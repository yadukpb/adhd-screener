import type { Reference } from "../types";

/**
 * Citation set grounding every number and claim this screener makes.
 * Nothing in scoring/, questionnaires/, or ui/ should assert a fact without
 * a `usedFor` entry pointing back here.
 */
export const references: Reference[] = [
  {
    id: "polanczyk2007",
    cite: "Polanczyk G, de Lima MS, Horta BL, Biederman J, Rohde LA (2007). The worldwide prevalence of ADHD: a systematic review and metaregression analysis. Am J Psychiatry 164(6):942-948.",
    topic: "prevalence",
    finding: "Pooled worldwide prevalence of ADHD in children/adolescents ~5.29%.",
    usedFor: "Framing banner copy and report context ('not a diagnosis') around base rates.",
  },
  {
    id: "simon2009",
    cite: "Simon V, Czobor P, Balint S, Meszaros A, Bitter I (2009). Prevalence and correlates of adult ADHD: a meta-analysis. Br J Psychiatry 194(3):204-211.",
    topic: "prevalence",
    finding: "Pooled adult ADHD prevalence ~2.5%.",
    usedFor: "Adult-screener framing text.",
  },
  {
    id: "shaw2007",
    cite: "Shaw P, Eckstrand K, Sharp W, et al. (2007). Attention-deficit/hyperactivity disorder is characterized by a delay in cortical maturation. PNAS 104(49):19649-19654.",
    topic: "brain",
    finding: "ADHD associated with delayed cortical maturation, most pronounced in prefrontal regions supporting executive control.",
    usedFor: "Mapping elevated-score indicators to the 'pfc' region.",
  },
  {
    id: "cortese2012",
    cite: "Cortese S, Kelly C, Chabernaud C, et al. (2012). Toward systems neuroscience of ADHD: a meta-analysis of 55 fMRI studies. Am J Psychiatry 169(10):1038-1055.",
    topic: "brain",
    finding: "ADHD shows convergent hypoactivation in frontoparietal, ventral attention, and dorsal attention networks, and failure to deactivate default mode network (DMN) during task performance.",
    usedFor: "Mapping sustained-attention indicators to 'parietal' and 'dmn'; DMN intrusion narrative in meaning text.",
  },
  {
    id: "castellanos2008",
    cite: "Castellanos FX, Proal E (2012). Large-scale brain systems in ADHD: beyond the prefrontal-striatal model. Trends Cogn Sci 16(1):17-26.",
    topic: "brain",
    finding: "Default-mode network (DMN) intrusion into task-positive activity correlates with reaction-time variability and attention lapses in ADHD.",
    usedFor: "Linking CPT RT-SD/tau indicators to 'dmn' region.",
  },
  {
    id: "aron2004",
    cite: "Aron AR, Poldrack RA (2005). The cognitive neuroscience of response inhibition: relevance for genetic research in ADHD. Biol Psychiatry 57(11):1285-1292.",
    topic: "brain",
    finding: "Right inferior frontal gyrus (IFG) and pre-SMA, via a hyperdirect pathway to subthalamic nucleus/striatum, implement stopping of a planned response; this circuit is weaker in ADHD.",
    usedFor: "Mapping stop-signal task indicators to 'ifg' and 'striatum'.",
  },
  {
    id: "volkow2009",
    cite: "Volkow ND, Wang GJ, Kollins SH, et al. (2009). Evaluating dopamine reward pathway in ADHD: clinical implications. JAMA 302(10):1084-1091.",
    topic: "brain",
    finding: "Reduced dopamine D2/D3 receptor and transporter availability in the nucleus accumbens / reward circuitry correlates with inattention symptom severity.",
    usedFor: "Mapping low-motivation / high-omission CPT patterns to 'accumbens' and 'limbic'.",
  },
  {
    id: "valera2007",
    cite: "Valera EM, Faraone SV, Murray KE, Seidman LJ (2007). Meta-analysis of structural imaging findings in ADHD. Biol Psychiatry 61(12):1361-1369.",
    topic: "brain",
    finding: "Cerebellar vermis volume reductions are among the most consistently replicated structural findings in ADHD, linked to timing and motor-response variability.",
    usedFor: "Mapping RT-variability indicators to 'cerebellum'.",
  },
  {
    id: "bush2005",
    cite: "Bush G (2011). Cingulate, frontal, and parietal cortical dysfunction in ADHD. Biol Psychiatry 69(12):1160-1167.",
    topic: "brain",
    finding: "Anterior cingulate cortex (ACC) hypoactivation during conflict/error monitoring is a consistent ADHD finding, linked to commission errors and post-error slowing deficits.",
    usedFor: "Mapping commission-error indicators to 'acc'.",
  },
  {
    id: "huangpollock2012",
    cite: "Huang-Pollock CL, Karalunas SL, Tam H, Moore AN (2012). Evaluating vigilance deficits in ADHD: a meta-analysis of CPT performance. J Abnorm Psychol 121(2):360-371.",
    topic: "tasks",
    finding: "ADHD groups show moderate-to-large effect sizes on CPT omission errors, commission errors, and RT variability relative to controls (Hedges g ~0.5-0.7).",
    usedFor: "CPT normative z-score thresholds and omission/commission weighting in scoring/stats.ts.",
  },
  {
    id: "lijffijt2005",
    cite: "Lijffijt M, Kenemans JL, Verbaten MN, van Engeland H (2005). A meta-analytic review of stopping performance in ADHD: deficient inhibitory motor control? J Abnorm Psychol 114(2):216-222.",
    topic: "tasks",
    finding: "ADHD groups show longer stop-signal reaction time (SSRT) than controls, effect size ~0.6, independent of go-RT differences.",
    usedFor: "Stop-signal task SSRT normative thresholds; chosen SSRT integration method citation in stats.ts.",
  },
  {
    id: "verbruggen2019",
    cite: "Verbruggen F, Aron AR, Band GP, et al. (2019). A consensus guide to capturing the ability to inhibit actions and impulsive behaviors in the stop-signal task. eLife 8:e46323.",
    topic: "consensus",
    finding: "Recommends the integration method (not mean/median) for SSRT estimation, and requires p(respond|signal) between .25 and .75 for a valid estimate.",
    usedFor: "ssrtIntegration() implementation and the StopSummary.valid gate in scoring.",
  },
  {
    id: "kofler2013",
    cite: "Kofler MJ, Rapport MD, Bolden J, et al. (2013). Working memory deficits and social problems in children with ADHD. J Abnorm Child Psychol 41(1):115-126.",
    topic: "tasks",
    finding: "ADHD groups show moderate working-memory deficits on n-back and span tasks (g ~0.4-0.6), partially independent of inhibitory control deficits.",
    usedFor: "N-back d' normative thresholds.",
  },
  {
    id: "kessler2005asrs",
    cite: "Kessler RC, Adler L, Ames M, et al. (2005). The World Health Organization Adult ADHD Self-Report Scale (ASRS): a short screening scale for use in the general population. Psychol Med 35(2):245-256.",
    topic: "questionnaires",
    finding: "ASRS-v1.1 Part A (6 items) has sensitivity 68.7% / specificity 99.5% against clinical diagnosis using the validated scoring algorithm (specific frequency threshold per item).",
    usedFor: "questionnaires/asrs.ts item bank and scoring thresholds.",
  },
  {
    id: "ward1993wurs",
    cite: "Ward MF, Wender PH, Reimherr FW (1993). The Wender Utah Rating Scale: an aid in the retrospective diagnosis of childhood ADHD. Am J Psychiatry 150(6):885-890.",
    topic: "questionnaires",
    finding: "WURS-25 score >=46 discriminates adults with childhood-onset ADHD from controls with ~86% sensitivity / ~99% specificity in the validation sample.",
    usedFor: "questionnaires/wurs.ts item bank, 25-item short form, and the 46-point cutoff.",
  },
  {
    id: "silverstein2019ec",
    cite: "Silverstein MJ, Faraone SV, Alperin S, Leon TL, Biederman J, Spencer TJ, Adler LA (2019). Validation of the expanded versions of the Adult ADHD Self-Report Scale v1.1 Symptom Checklist and the Adult ADHD Investigator Symptom Rating Scale. J Atten Disord 23(10):1101-1110.",
    topic: "questionnaires",
    finding:
      "Validated a 4-item 'Emotional Dyscontrol' extension to the ASRS-v1.1, covering mood lability, irritability, and emotional overreactivity, on the same 0-4 Never-to-Very Often response scale as the base ASRS.",
    usedFor:
      "questionnaires/emotionalDyscontrol.ts -- the construct and response scale this project's own (original-wording) 4-item subscale is modeled on. Not a reproduction of this paper's item text, which isn't openly published.",
  },
  {
    id: "faraone2021consensus",
    cite: "Faraone SV, Banaschewski T, Coghill D, et al. (2021). The World Federation of ADHD International Consensus Statement: 208 evidence-based conclusions about ADHD. Neurosci Biobehav Rev 128:789-818.",
    topic: "consensus",
    finding: "No single biomarker or task is diagnostic; ADHD diagnosis requires clinical interview against DSM-5/ICD-11 criteria, developmental history, and impairment across settings.",
    usedFor: "The 'Not a diagnosis' banner and every report disclaimer in ui/report.ts.",
  },
  {
    id: "barkley2006outcomes",
    cite: "Barkley RA, Fischer M, Smallish L, Fletcher K (2006). Young adult outcome of hyperactive children: adaptive functioning in major life activities. J Am Acad Child Adolesc Psychiatry 45(2):192-202.",
    topic: "outcomes",
    finding: "Untreated childhood ADHD predicts significantly worse educational attainment, employment stability, and relationship outcomes in young adulthood versus controls.",
    usedFor: "Motivational framing in ui/report.ts for 'elevated' results to seek clinical follow-up.",
  },
  {
    id: "dsm5tr",
    cite: "American Psychiatric Association (2022). Diagnostic and Statistical Manual of Mental Disorders, 5th Edition, Text Revision (DSM-5-TR). Washington, DC: APA Publishing.",
    topic: "consensus",
    finding: "Defines ADHD's three presentations (predominantly inattentive, predominantly hyperactive-impulsive, combined) and the criteria a diagnosis requires: several symptoms present before age 12, clear impairment in two or more settings, and symptoms not better explained by another condition.",
    usedFor: "The 'Learn about ADHD' page's definition and diagnostic-criteria sections.",
  },
  {
    id: "faraone2019genetics",
    cite: "Faraone SV, Larsson H (2019). Genetics of attention deficit hyperactivity disorder. Molecular Psychiatry 24(4):562-575.",
    topic: "genetics",
    finding: "Twin studies consistently estimate ADHD heritability around 70-80%, making it one of the most heritable conditions in psychiatry; no single gene is responsible, and common environmental explanations (parenting style, sugar, screen time) are not supported as primary causes.",
    usedFor: "The 'Learn about ADHD' page's causes section.",
  },
  {
    id: "gollwitzer1999",
    cite: "Gollwitzer PM (1999). Implementation intentions: Strong effects of simple plans. American Psychologist 54(7):493-503.",
    topic: "treatment",
    finding: "Forming a specific if-then plan ('if situation X arises, I will do Y') substantially improves follow-through and self-regulation compared to a general goal intention alone, replicated across many self-regulation domains.",
    usedFor: "exercises/library.ts -- the 'Pause-Plan' impulse-control exercise.",
  },
  {
    id: "barkley1997",
    cite: "Barkley RA (1997). Behavioral inhibition, sustained attention, and executive functions: constructing a unifying theory of ADHD. Psychological Bulletin 121(1):65-94.",
    topic: "treatment",
    finding: "ADHD involves impaired behavioral inhibition and executive self-regulation; 'externalizing' time, rules, and goals -- making them visible outside the head rather than held in mind -- compensates for weak internal self-regulation.",
    usedFor: "exercises/library.ts -- the externalization basis of the focus-blocks and chunking exercises.",
  },
  {
    id: "safren2005cbt",
    cite: "Safren SA, Otto MW, Sprich S, Winett CL, Wilens TE, Biederman J (2005). Cognitive-behavioral therapy for ADHD in medication-treated adults with continued symptoms. Behaviour Research and Therapy 43(7):831-842.",
    topic: "treatment",
    finding: "A structured CBT program -- organizational-skills training (breaking tasks into smaller steps) plus a cognitive-restructuring module for adaptive thinking -- significantly reduced ADHD symptoms and improved functioning in medication-treated adults with residual symptoms, versus a waitlist control.",
    usedFor: "exercises/library.ts -- the 'Break It Down' task-breakdown exercise and the 'Thought Record' cognitive-restructuring exercise.",
  },
  {
    id: "barkley1997time",
    cite: "Barkley RA, Koplowitz S, Anderson T, McMurray MB (1997). Sense of time in children with ADHD: effects of duration, distraction, and stimulant medication. Journal of the International Neuropsychological Society 3(4):359-369.",
    topic: "treatment",
    finding: "Children with ADHD show measurable deficits reproducing and estimating time durations compared to controls -- the empirical basis for 'time blindness' as a specific executive-function deficit, not just a figure of speech.",
    usedFor: "exercises/library.ts -- the 'Time Estimation Trainer' exercise's estimate-vs-actual calibration loop.",
  },
  {
    id: "zylowska2008mindfulness",
    cite: "Zylowska L, Ackerman DL, Yang MH, Futrell JL, Horton NL, Hale TS, Pataki C, Smalley SL (2008). Mindfulness meditation training in adults and adolescents with ADHD: a feasibility study. Journal of Attention Disorders 11(6):737-746.",
    topic: "treatment",
    finding: "An 8-week mindfulness training program for ADHD adults/adolescents was feasible and associated with improvements in attention and self-reported ADHD symptoms in this uncontrolled feasibility study -- early evidence, not yet a large confirmatory RCT.",
    usedFor: "exercises/library.ts -- the 'Mindful Pause' exercise.",
  },
  {
    id: "lieberman2007affectlabeling",
    cite: "Lieberman MD, Eisenberger NI, Crockett MJ, Tom SM, Pfeifer JH, Way BM (2007). Putting feelings into words: affect labeling disrupts amygdala activity in response to affective stimuli. Psychol Sci 18(5):421-428.",
    topic: "treatment",
    finding:
      "Simply naming an emotion in words (\"affect labeling\"), rather than suppressing or analyzing it, measurably reduced amygdala reactivity in an fMRI study -- a brief, concrete technique for de-escalating a strong emotional reaction in the moment.",
    usedFor: "exercises/library.ts -- the 'Name the Feeling' emotional-regulation exercise.",
  },
  {
    id: "miller1956",
    cite: "Miller GA (1956). The magical number seven, plus or minus two: some limits on our capacity for processing information. Psychological Review 63(2):81-97.",
    topic: "treatment",
    finding: "Working memory holds a small number of meaningful 'chunks' rather than raw items; grouping information into fewer, larger chunks reduces the load on working memory.",
    usedFor: "exercises/library.ts -- the chunking step of the working-memory exercise.",
  },
];

export function referencesByTopic(topic: Reference["topic"]): Reference[] {
  return references.filter((r) => r.topic === topic);
}

export function referenceById(id: string): Reference | undefined {
  return references.find((r) => r.id === id);
}
