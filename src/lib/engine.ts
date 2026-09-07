import type {
  DepositCheck,
  ProfileInput,
  PublicSim,
  RegionType,
  ScoreBreakdown,
  SpecialFlags,
} from "./types";

/** 주택공급에 관한 규칙 별표 1 가점제 배점 — 무주택기간 */
export function homelessScore(input: ProfileInput): { score: number; note: string } {
  if (input.hasHouse) {
    return { score: 0, note: "유주택 세대는 무주택기간 가점이 0점입니다." };
  }
  if (input.age < 30 && !input.married) {
    return {
      score: 0,
      note: "만 30세 미만 미혼 무주택자는 무주택기간 가점이 0점입니다. (만 30세 또는 그 이전 혼인신고일부터 기산)",
    };
  }
  const years = Math.max(0, input.homelessYears);
  if (years < 1) return { score: 2, note: "무주택기간 1년 미만(무주택자에 한함)은 2점입니다." };
  if (years >= 15) return { score: 32, note: "무주택기간 15년 이상은 32점 만점입니다." };
  const score = (Math.floor(years) + 1) * 2;
  return {
    score,
    note: `무주택기간 ${Math.floor(years)}년 이상~${Math.floor(years) + 1}년 미만 구간에 해당합니다.`,
  };
}

/** 부양가족수: 본인 제외, 0명 5점, 1명당 +5, 6명 이상 35점 */
export function dependentsScore(count: number): number {
  const n = Math.max(0, Math.floor(count));
  return Math.min(35, 5 + n * 5);
}

/** 청약통장 가입기간 배점표 */
export function accountPeriodScore(years: number): number {
  const y = Math.max(0, years);
  if (y < 0.5) return 1;
  if (y < 1) return 2;
  if (y >= 15) return 17;
  return Math.min(17, Math.floor(y) + 2);
}

/**
 * 2024년 주택공급에 관한 규칙 개정 취지:
 * 배우자 청약통장 가입기간의 50%를 합산하되, 가점 가산 상한은 3점으로 안내되는 사례가 많습니다.
 * 실제 인정 점수는 청약 접수 시 은행·청약홈 산정값이 우선입니다.
 */
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

export function specialFlags(input: ProfileInput): SpecialFlags {
  return {
    multiChild: input.childrenUnmarried >= 2 && !input.hasHouse,
    newborn: input.newbornWithin2y && !input.hasHouse,
    newlywed: input.married && input.marriageYears <= 7 && !input.hasHouse,
    firstHome: input.firstHomeEver && !input.hasHouse,
    elderlyParents: input.parentsCared3y && !input.hasHouse,
    youthDream: input.age >= 19 && input.age <= 34 && !input.hasHouse,
    convertLegacy: input.accountType === "savings" || input.accountType === "deposit" || input.accountType === "installment",
  };
}

export function strategyNote(total: number, checks: DepositCheck[]): string {
  const maxMet = [...checks].reverse().find((c) => c.met);
  const areaHint = maxMet ? `${maxMet.label} 예치 기준을 충족한 상태입니다.` : "민영 예치기준금액이 아직 부족합니다. 부족한 금액을 먼저 채우세요.";

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

export function runCalculation(input: ProfileInput): {
  scores: ScoreBreakdown;
  deposits: DepositCheck[];
  sim: PublicSim;
  special: SpecialFlags;
  strategy: string;
} {
  const h = homelessScore(input);
  const dep = dependentsScore(input.dependentsCount);
  const acc = accountPeriodScore(input.accountYears);
  const bonus = spouseAccountBonus(input.spouseAccountYears);
  const account = Math.min(17, acc + bonus);
  const total = h.score + dep + account;
  const deposits = depositChecks(input.region, input.currentAmount);
  return {
    scores: {
      homeless: h.score,
      dependents: dep,
      account,
      spouseBonus: bonus,
      total,
      homelessNote: h.note,
    },
    deposits,
    sim: publicSimulation(input),
    special: specialFlags(input),
    strategy: strategyNote(total, deposits),
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
