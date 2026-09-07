import { buildNextActions } from "./actions";
import { ageFromBirth, dateTurning30, yearsBetween } from "./dates";
import { familyDependentCount, isTreatedHomeless, unmarriedChildren } from "./family";
import { diagnoseRank } from "./rank";
import type {
  DepositCheck,
  NextAction,
  ProfileInput,
  PublicSim,
  RankDiagnosis,
  RegionType,
  ScoreBreakdown,
  Sensitivity,
  SpecialFlags,
} from "./types";

export function homelessScoreFromYears(years: number, treatedHomeless: boolean, age: number, married: boolean): { score: number; note: string } {
  if (!treatedHomeless) {
    return { score: 0, note: "유주택 세대는 무주택기간 가점이 0점입니다. 소형·저가 1호만 가진 경우는 예외 입력을 확인하세요." };
  }
  if (age < 30 && !married) {
    return {
      score: 0,
      note: "만 30세 미만 미혼 무주택자는 무주택기간 가점이 0점입니다. (만 30세 또는 그 이전 혼인신고일부터 기산)",
    };
  }
  const y = Math.max(0, years);
  if (y < 1) return { score: 2, note: "무주택기간 1년 미만(무주택자에 한함)은 2점입니다." };
  if (y >= 15) return { score: 32, note: "무주택기간 15년 이상은 32점 만점입니다." };
  const score = (Math.floor(y) + 1) * 2;
  return { score, note: `무주택기간 ${Math.floor(y)}년 이상~${Math.floor(y) + 1}년 미만 구간에 해당합니다.` };
}

export function homelessScore(input: ProfileInput, now = new Date()) {
  const resolved = resolveProfile(input, now);
  return homelessScoreFromYears(resolved.homelessYears, resolved.treatedHomeless, resolved.age, input.married);
}

export function dependentsScore(count: number): number {
  const n = Math.max(0, Math.floor(count));
  return Math.min(35, 5 + n * 5);
}

export function accountPeriodScore(years: number): number {
  const y = Math.max(0, years);
  if (y < 0.5) return 1;
  if (y < 1) return 2;
  if (y >= 15) return 17;
  return Math.min(17, Math.floor(y) + 2);
}

export function spouseAccountBonus(spouseYears: number): number {
  if (spouseYears <= 0) return 0;
  const halfPeriodScore = accountPeriodScore(spouseYears * 0.5);
  return Math.min(3, Math.max(0, halfPeriodScore - 1));
}

export const DEPOSIT_TABLE: Record<
  RegionType,
  { under85: number; under102: number; under135: number; all: number }
> = {
  SEOUL_BUSAN: { under85: 3_000_000, under102: 6_000_000, under135: 10_000_000, all: 15_000_000 },
  METRO: { under85: 2_500_000, under102: 4_000_000, under135: 7_000_000, all: 10_000_000 },
  OTHER: { under85: 2_000_000, under102: 3_000_000, under135: 4_000_000, all: 5_000_000 },
};

export function depositChecks(region: RegionType, amount: number): DepositCheck[] {
  const t = DEPOSIT_TABLE[region];
  return [
    { label: "전용 85㎡ 이하", amount: t.under85, met: amount >= t.under85 },
    { label: "전용 102㎡ 이하", amount: t.under102, met: amount >= t.under102 },
    { label: "전용 135㎡ 이하", amount: t.under135, met: amount >= t.under135 },
    { label: "모든 면적", amount: t.all, met: amount >= t.all },
  ];
}

export function monthsToLabel(months: number): string {
  if (months <= 0) return "이미 목표 인정액에 도달";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest}개월`;
  if (rest === 0) return `${years}년`;
  return `${years}년 ${rest}개월`;
}

export function expectedPeriodLabel(months: number, from = new Date()): string {
  if (months <= 0) return "현재 도달";
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  const y = d.getFullYear();
  const half = d.getMonth() < 6 ? "상반기" : "하반기";
  return `${y}년 ${half}`;
}

export function publicSimulation(input: ProfileInput): PublicSim {
  const monthly = Math.max(1, input.monthlyDeposit);
  const shortfall = Math.max(0, input.targetCutline - input.currentAmount);
  const targetMonths = shortfall > 0 ? Math.ceil(shortfall / monthly) : 0;
  const baselineMonths = shortfall > 0 ? Math.ceil(shortfall / 100_000) : 0;
  const savedMonths = Math.max(0, baselineMonths - targetMonths);
  return {
    shortfall,
    targetMonths,
    baselineMonths,
    savedMonths,
    expectedLabel: expectedPeriodLabel(targetMonths),
    baselineLabel: expectedPeriodLabel(baselineMonths),
  };
}

export function specialFlags(input: ProfileInput, now = new Date()): SpecialFlags {
  const resolved = resolveProfile(input, now);
  const kids = unmarriedChildren(input);
  return {
    multiChild: kids >= 2 && resolved.treatedHomeless,
    newborn: input.newbornWithin2y && resolved.treatedHomeless,
    newlywed: input.married && resolved.marriageYears <= 7 && resolved.treatedHomeless,
    firstHome: input.firstHomeEver && resolved.treatedHomeless,
    elderlyParents: input.parentsCared3y && resolved.treatedHomeless,
    youthDream: resolved.age >= 19 && resolved.age <= 34 && resolved.treatedHomeless,
    convertLegacy: input.accountType === "savings" || input.accountType === "deposit" || input.accountType === "installment",
  };
}

export function strategyNote(total: number, checks: DepositCheck[], rank: RankDiagnosis): string {
  const maxMet = [...checks].reverse().find((c) => c.met);
  const areaHint = maxMet ? `${maxMet.label} 예치 기준을 충족한 상태입니다.` : "민영 예치기준금액이 아직 부족합니다. 부족한 금액을 먼저 채우세요.";
  if (!rank.firstRankLikely) {
    return `${areaHint} ${rank.summary} 가점제는 1순위 안에서 적용됩니다.`;
  }
  if (total < 40) {
    return `${areaHint} 가점이 낮은 편이므로 특별공급, 전용 85㎡ 초과 추첨제, 비인기 지역·무순위 일정을 함께 살펴보세요.`;
  }
  if (total < 55) {
    return `${areaHint} 서울 핵심지 가점제는 경쟁이 큽니다. 추첨제 비중이 높은 중대형과 특별공급을 병행하는 전략이 현실적입니다.`;
  }
  if (total < 70) {
    return `${areaHint} 수도권 일반공급을 도전해 볼 수 있는 구간입니다. 인기 단지는 당첨 가점이 더 높을 수 있으니 공고문의 가점 커트라인을 비교하세요.`;
  }
  return `${areaHint} 가점 경쟁력은 높은 편입니다. 그래도 당첨은 공고마다 달라지므로 청약홈 최종 공고문으로 자격과 일정을 확인하세요.`;
}

export function resolveProfile(input: ProfileInput, now = new Date()) {
  const age = ageFromBirth(input.birthDate, now) ?? input.age;
  const treatedHomeless = isTreatedHomeless(input);
  let homelessYears = input.homelessYears;
  if (input.birthDate) {
    const turn30 = dateTurning30(input.birthDate);
    let start = turn30;
    if (input.married && input.marriageDate && turn30 && input.marriageDate < turn30) start = input.marriageDate;
    const computed = start ? yearsBetween(start, now) : null;
    if (computed !== null) homelessYears = treatedHomeless && !(age < 30 && !input.married) ? computed : 0;
  }
  const accountYears = yearsBetween(input.accountOpenDate, now) ?? input.accountYears;
  const marriageYears = yearsBetween(input.marriageDate, now) ?? input.marriageYears;
  const dependentsUsed = familyDependentCount(input);
  return { age, treatedHomeless, homelessYears, accountYears, marriageYears, dependentsUsed };
}

export function scoreSensitivity(input: ProfileInput, now = new Date()): Sensitivity {
  const base = runCalculation(input, now).scores.total;
  const plusDep = { ...input, useFamilyWizard: false, dependentsCount: familyDependentCount(input) + 1 };
  const plusHome = { ...input, birthDate: "", homelessYears: resolveProfile(input, now).homelessYears + 1 };
  const plusAcc = { ...input, accountOpenDate: "", accountYears: resolveProfile(input, now).accountYears + 1 };
  return {
    plusDependent: runCalculation(plusDep, now).scores.total - base,
    plusHomelessYear: runCalculation(plusHome, now).scores.total - base,
    plusAccountYear: runCalculation(plusAcc, now).scores.total - base,
  };
}

export function runCalculation(
  input: ProfileInput,
  now = new Date(),
  nearestSchedule?: { title: string; date: string; days: number },
): {
  scores: ScoreBreakdown;
  deposits: DepositCheck[];
  sim: PublicSim;
  special: SpecialFlags;
  rank: RankDiagnosis;
  strategy: string;
  nextActions: NextAction[];
  sensitivity: Omit<Sensitivity, never>;
} {
  const resolved = resolveProfile(input, now);
  const h = homelessScoreFromYears(resolved.homelessYears, resolved.treatedHomeless, resolved.age, input.married);
  const dep = dependentsScore(resolved.dependentsUsed);
  const acc = accountPeriodScore(resolved.accountYears);
  const bonus = spouseAccountBonus(input.spouseAccountYears);
  const account = Math.min(17, acc + bonus);
  const total = h.score + dep + account;
  const deposits = depositChecks(input.region, input.currentAmount);
  const rank = diagnoseRank(input, { accountYears: resolved.accountYears, deposit85: deposits[0].met });
  const special = specialFlags(input, now);
  const sim = publicSimulation(input);
  const nextActions = buildNextActions({ rank, deposits, special, sim, profile: input, nearestSchedule });
  const plusDep = dependentsScore(resolved.dependentsUsed + 1) - dep;
  const plusHome =
    homelessScoreFromYears(resolved.homelessYears + 1, resolved.treatedHomeless, resolved.age, input.married).score - h.score;
  const plusAcc = Math.min(17, accountPeriodScore(resolved.accountYears + 1) + bonus) - account;
  return {
    scores: {
      homeless: h.score,
      dependents: dep,
      account,
      spouseBonus: bonus,
      total,
      homelessNote: h.note,
      homelessYearsUsed: resolved.homelessYears,
      accountYearsUsed: resolved.accountYears,
      dependentsUsed: resolved.dependentsUsed,
    },
    deposits,
    sim,
    special,
    rank,
    strategy: strategyNote(total, deposits, rank),
    nextActions,
    sensitivity: { plusDependent: plusDep, plusHomelessYear: plusHome, plusAccountYear: plusAcc },
  };
}

export const HOMELESS_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "1년 미만" },
  { value: 1, label: "1년 이상 ~ 2년 미만" },
  { value: 2, label: "2년 이상 ~ 3년 미만" },
  { value: 3, label: "3년 이상 ~ 4년 미만" },
  { value: 4, label: "4년 이상 ~ 5년 미만" },
  { value: 5, label: "5년 이상 ~ 6년 미만" },
  { value: 6, label: "6년 이상 ~ 7년 미만" },
  { value: 7, label: "7년 이상 ~ 8년 미만" },
  { value: 8, label: "8년 이상 ~ 9년 미만" },
  { value: 9, label: "9년 이상 ~ 10년 미만" },
  { value: 10, label: "10년 이상 ~ 11년 미만" },
  { value: 11, label: "11년 이상 ~ 12년 미만" },
  { value: 12, label: "12년 이상 ~ 13년 미만" },
  { value: 13, label: "13년 이상 ~ 14년 미만" },
  { value: 14, label: "14년 이상 ~ 15년 미만" },
  { value: 15, label: "15년 이상" },
];

export const ACCOUNT_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "6개월 미만" },
  { value: 0.5, label: "6개월 이상 ~ 1년 미만" },
  { value: 1, label: "1년 이상 ~ 2년 미만" },
  { value: 2, label: "2년 이상 ~ 3년 미만" },
  { value: 3, label: "3년 이상 ~ 4년 미만" },
  { value: 4, label: "4년 이상 ~ 5년 미만" },
  { value: 5, label: "5년 이상 ~ 6년 미만" },
  { value: 6, label: "6년 이상 ~ 7년 미만" },
  { value: 7, label: "7년 이상 ~ 8년 미만" },
  { value: 8, label: "8년 이상 ~ 9년 미만" },
  { value: 9, label: "9년 이상 ~ 10년 미만" },
  { value: 10, label: "10년 이상 ~ 11년 미만" },
  { value: 11, label: "11년 이상 ~ 12년 미만" },
  { value: 12, label: "12년 이상 ~ 13년 미만" },
  { value: 13, label: "13년 이상 ~ 14년 미만" },
  { value: 14, label: "14년 이상 ~ 15년 미만" },
  { value: 15, label: "15년 이상" },
];
