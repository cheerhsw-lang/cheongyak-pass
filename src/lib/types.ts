export type RegionType = "SEOUL_BUSAN" | "METRO" | "OTHER";
export type HeatZone = "HOT" | "CAPITAL" | "OTHER" | "DEPRESSED";
export type TrackMode = "private" | "public";
export type AccountType =
  | "comprehensive"
  | "savings"
  | "deposit"
  | "installment"
  | "youthDream";
export type FontScale = "normal" | "large" | "xlarge";

export interface ProfileInput {
  age: number;
  married: boolean;
  hasHouse: boolean;
  homelessYears: number;
  dependentsCount: number;
  accountYears: number;
  spouseAccountYears: number;
  currentAmount: number;
  monthlyDeposit: number;
  targetCutline: number;
  region: RegionType;
  accountType: AccountType;
  childrenUnmarried: number;
  newbornWithin2y: boolean;
  marriageYears: number;
  firstHomeEver: boolean;
  parentsCared3y: boolean;
  heatZone: HeatZone;
  paymentCount: number;
  residenceYears: number;
  householdHead: boolean;
  useFamilyWizard: boolean;
  childrenUnder30: number;
  childrenOver30With1y: number;
  parentsCount: number;
  smallCheapOnly: boolean;
  birthDate: string;
  marriageDate: string;
  accountOpenDate: string;
}

export interface ScoreBreakdown {
  homeless: number;
  dependents: number;
  account: number;
  spouseBonus: number;
  total: number;
  homelessNote: string;
  homelessYearsUsed: number;
  accountYearsUsed: number;
  dependentsUsed: number;
}

export interface DepositCheck {
  label: string;
  amount: number;
  met: boolean;
}

export interface PublicSim {
  shortfall: number;
  targetMonths: number;
  baselineMonths: number;
  savedMonths: number;
  expectedLabel: string;
  baselineLabel: string;
}

export interface SpecialFlags {
  multiChild: boolean;
  newborn: boolean;
  newlywed: boolean;
  firstHome: boolean;
  elderlyParents: boolean;
  youthDream: boolean;
  convertLegacy: boolean;
}

export interface RankDiagnosis {
  heatLabel: string;
  firstRankLikely: boolean;
  danghaeLikely: boolean;
  accountOk: boolean;
  paymentsOk: boolean;
  depositOk: boolean;
  residenceOk: boolean;
  needAccountYears: number;
  needPayments: number;
  needResidenceYears: number;
  missing: string[];
  summary: string;
}

export interface NextAction {
  title: string;
  detail: string;
}

export interface Sensitivity {
  plusDependent: number;
  plusHomelessYear: number;
  plusAccountYear: number;
}

export const DEFAULT_PROFILE: ProfileInput = {
  age: 38,
  married: true,
  hasHouse: false,
  homelessYears: 8,
  dependentsCount: 2,
  accountYears: 10,
  spouseAccountYears: 0,
  currentAmount: 12_000_000,
  monthlyDeposit: 250_000,
  targetCutline: 21_000_000,
  region: "SEOUL_BUSAN",
  accountType: "comprehensive",
  childrenUnmarried: 1,
  newbornWithin2y: false,
  marriageYears: 8,
  firstHomeEver: true,
  parentsCared3y: false,
  heatZone: "CAPITAL",
  paymentCount: 120,
  residenceYears: 3,
  householdHead: true,
  useFamilyWizard: false,
  childrenUnder30: 1,
  childrenOver30With1y: 0,
  parentsCount: 0,
  smallCheapOnly: false,
  birthDate: "",
  marriageDate: "",
  accountOpenDate: "",
};

export const STORAGE_KEY = "cheongyak-pass:v1";
export const SPOUSE_KEY = "cheongyak-pass:spouse";
export const VIEW_KEY = "cheongyak-pass:ui";
export const API_KEY_STORAGE = "cheongyak-pass:odcloud-key";
export const SCHEDULE_KEY = "cheongyak-pass:schedules";
export const LAW_AS_OF = "2026-09-07";
