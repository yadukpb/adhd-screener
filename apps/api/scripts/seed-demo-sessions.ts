/**
 * Seeds realistic screening sessions for an existing user, run through the
 * exact same scoring pipeline as POST /api/sessions (summarize* +
 * computeIndicators from @adhd-screener/core, then regenerateLearningPath),
 * so the data -- including the resulting learning path -- is representative
 * of a real completed run, not hand-faked. Backdates createdAt across a few
 * weeks so the dashboard's trend chart has something to show, and marks a
 * couple of learning-path steps done so "My Path" doesn't look untouched.
 *
 * Usage: npx tsx scripts/seed-demo-sessions.ts <email> [--clear]
 */
import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "../src/db";
import { UserModel } from "../src/models/User";
import { ScreeningSessionModel } from "../src/models/ScreeningSession";
import { LearningPathModel } from "../src/models/LearningPath";
import { regenerateLearningPath } from "../src/services/learningPath";
import { summarizeCpt, summarizeStop, summarizeNback, computeIndicators } from "@adhd-screener/core";
import type { CptTrial, StopTrial, NbackTrial, Session } from "@adhd-screener/core";
import { mulberry32 } from "@adhd-screener/core";

const email = process.argv[2];
const shouldClear = process.argv.includes("--clear");
if (!email) {
  console.error("Usage: npx tsx scripts/seed-demo-sessions.ts <email> [--clear]");
  process.exit(1);
}

type Rng = () => number;
function gaussian(rng: Rng, mean: number, sd: number): number {
  const u1 = Math.max(rng(), 1e-9);
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * sd;
}

function makeCptTrials(rng: Rng, opts: { omissionRate: number; commissionRate: number; rtMean: number; rtSd: number }): CptTrial[] {
  const trials: CptTrial[] = [];
  for (let i = 0; i < 80; i++) {
    const nogo = i % 5 === 4; // 20% no-go, evenly spread
    if (nogo) {
      const committed = rng() < opts.commissionRate;
      trials.push({ nogo: true, rt: committed ? Math.round(gaussian(rng, opts.rtMean, opts.rtSd)) : null });
    } else {
      const missed = rng() < opts.omissionRate;
      trials.push({ nogo: false, rt: missed ? null : Math.round(Math.max(150, gaussian(rng, opts.rtMean, opts.rtSd))) });
    }
  }
  return trials;
}

function makeStopTrials(rng: Rng, opts: { goRtMean: number; goRtSd: number; stopSkill: number }): { trials: StopTrial[]; maxRt: number } {
  const trials: StopTrial[] = [];
  let ssd = 250;
  let maxRt = 0;
  for (let i = 0; i < 64; i++) {
    const isStop = i % 4 === 3; // 25% stop trials
    if (!isStop) {
      const rt = Math.round(Math.max(150, gaussian(rng, opts.goRtMean, opts.goRtSd)));
      maxRt = Math.max(maxRt, rt);
      trials.push({ stop: false, ssd: null, rt });
    } else {
      // opts.stopSkill in [0,1]: higher = stops more often at a given SSD.
      const stopped = rng() < opts.stopSkill;
      trials.push({ stop: true, ssd, rt: stopped ? null : Math.round(gaussian(rng, opts.goRtMean + 30, opts.goRtSd)) });
      ssd += stopped ? 50 : -50;
      ssd = Math.min(900, Math.max(50, ssd));
    }
  }
  return { trials, maxRt: maxRt || 1200 };
}

function makeNbackTrials(rng: Rng, opts: { hitRate: number; falseAlarmRate: number }): NbackTrial[] {
  const trials: NbackTrial[] = [];
  for (let i = 0; i < 50; i++) {
    const isTarget = i >= 2 && rng() < 0.3;
    if (isTarget) trials.push({ target: true, responded: rng() < opts.hitRate });
    else trials.push({ target: false, responded: rng() < opts.falseAlarmRate });
  }
  return trials;
}

interface Profile {
  label: string;
  daysAgo: number;
  asrs: number[];
  wurs: number[];
  emotionalDyscontrol: number[];
  cpt: { omissionRate: number; commissionRate: number; rtMean: number; rtSd: number };
  stop: { goRtMean: number; goRtSd: number; stopSkill: number };
  nback: { hitRate: number; falseAlarmRate: number };
}

// Tells a "things improved across repeated screenings" story -- the kind of
// trend the dashboard's chart exists to show.
const profiles: Profile[] = [
  {
    label: "3 weeks ago -- rougher run",
    daysAgo: 21,
    asrs: [3, 3, 3, 3, 3, 2],
    wurs: new Array(25).fill(3),
    emotionalDyscontrol: [4, 3, 4, 3],
    cpt: { omissionRate: 0.22, commissionRate: 0.55, rtMean: 430, rtSd: 140 },
    stop: { goRtMean: 420, goRtSd: 60, stopSkill: 0.3 },
    nback: { hitRate: 0.45, falseAlarmRate: 0.3 },
  },
  {
    label: "10 days ago -- some improvement",
    daysAgo: 10,
    asrs: [2, 2, 3, 2, 2, 1],
    wurs: new Array(25).fill(2),
    emotionalDyscontrol: [2, 3, 2, 1],
    cpt: { omissionRate: 0.1, commissionRate: 0.3, rtMean: 410, rtSd: 100 },
    stop: { goRtMean: 400, goRtSd: 50, stopSkill: 0.45 },
    nback: { hitRate: 0.65, falseAlarmRate: 0.18 },
  },
  {
    label: "today -- mostly typical",
    daysAgo: 0,
    asrs: [1, 1, 2, 1, 0, 0],
    wurs: new Array(25).fill(1),
    emotionalDyscontrol: [1, 1, 0, 1],
    cpt: { omissionRate: 0.03, commissionRate: 0.12, rtMean: 400, rtSd: 85 },
    stop: { goRtMean: 395, goRtSd: 45, stopSkill: 0.5 },
    nback: { hitRate: 0.82, falseAlarmRate: 0.08 },
  },
];

async function main() {
  const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/adhd-screener";
  await connectDb(uri);

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  if (shouldClear) {
    const { deletedCount } = await ScreeningSessionModel.deleteMany({ user: user._id });
    await LearningPathModel.deleteMany({ user: user._id });
    console.log(`Cleared ${deletedCount} existing session(s) + learning path for ${email}`);
  }

  for (const [i, profile] of profiles.entries()) {
    const rng = mulberry32(1000 + i);
    const cptTrials = makeCptTrials(rng, profile.cpt);
    const { trials: stopTrials, maxRt } = makeStopTrials(rng, profile.stop);
    const nbackTrials = makeNbackTrials(rng, profile.nback);

    const session: Session = { asrs: profile.asrs, wurs: profile.wurs, emotionalDyscontrol: profile.emotionalDyscontrol };
    session.cpt = summarizeCpt(cptTrials);
    session.stop = summarizeStop(stopTrials, maxRt);
    session.nback = summarizeNback(nbackTrials);
    const indicators = computeIndicators(session);

    const createdAt = new Date(Date.now() - profile.daysAgo * 24 * 60 * 60 * 1000);
    const [doc] = await ScreeningSessionModel.create([
      {
        user: user._id,
        asrs: session.asrs,
        wurs: session.wurs,
        cpt: session.cpt,
        stop: session.stop,
        nback: session.nback,
        indicators,
        createdAt,
        updatedAt: createdAt,
      },
    ]);

    // Same call POST /api/sessions makes -- the path regenerates and merges
    // after every seeded session exactly like it would for a real run.
    await regenerateLearningPath(user._id.toString(), doc._id.toString(), indicators);

    const elevated = indicators.filter((x) => x.level === "elevated").length;
    const mild = indicators.filter((x) => x.level === "mild").length;
    console.log(`Seeded "${profile.label}" (${createdAt.toISOString().slice(0, 10)}): ${elevated} elevated, ${mild} mild`);
  }

  // Mark a couple of steps done partway through, so the final path looks
  // like someone who's actually been working through it, not a fresh
  // untouched list -- purely cosmetic for the demo.
  const path = await LearningPathModel.findOne({ user: user._id });
  if (path && path.steps.length > 0) {
    const toComplete = path.steps.slice(0, Math.min(2, path.steps.length));
    for (const step of toComplete) {
      step.status = "done";
      step.completedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    }
    await path.save();
    console.log(`Marked ${toComplete.length} learning-path step(s) done: ${toComplete.map((s) => s.key).join(", ")}`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
