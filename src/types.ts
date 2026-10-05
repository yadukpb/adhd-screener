export type Level = "typical" | "mild" | "elevated";

export interface CptTrial { nogo: boolean; rt: number | null }
export interface CptSummary {
  nGo: number; nNoGo: number;
  omissionPct: number; commissionPct: number;
  meanRt: number; rtSd: number; tau: number; dPrime: number;
}

export interface StopTrial { stop: boolean; ssd: number | null; rt: number | null }
export interface StopSummary {
  valid: boolean; ssrt: number; pRespondGivenStop: number;
  meanGoRt: number; meanSsd: number;
}

export interface NbackTrial { target: boolean; responded: boolean }
export interface NbackSummary { hits: number; misses: number; falseAlarms: number; correctRejections: number; dPrime: number }

export interface Session {
  asrs: number[] | null;
  wurs: number[] | null;
  cpt?: CptSummary;
  stop?: StopSummary;
  nback?: NbackSummary;
}

export type RegionId = "pfc" | "ifg" | "parietal" | "acc" | "dmn" | "striatum" | "accumbens" | "limbic" | "cerebellum";

export interface Indicator {
  key: string;
  label: string;
  z: number | null;
  level: Level;
  valueText: string;
  meaning: string;
  regions: RegionId[];
  refs: string[];
}

export interface Reference {
  id: string;
  cite: string;
  topic: "prevalence" | "brain" | "tasks" | "questionnaires" | "outcomes" | "consensus";
  finding: string;
  usedFor: string;
}
