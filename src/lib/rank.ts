import type { HeatZone, ProfileInput, RankDiagnosis, RegionType } from "./types";

export const HEAT_OPTIONS: { value: HeatZone; label: string; desc: string }[] = [
  { value: "HOT", label: "투기과열 · 청약과열", desc: "가입 2년 · 납입 24회 · 당해 2년(참고)" },
  { value: "CAPITAL", label: "수도권 그 외", desc: "가입 1년 · 납입 12회 · 당해 1년(참고)" },
  { value: "OTHER", label: "비수도권 일반", desc: "가입 6개월 · 납입 6회" },
  { value: "DEPRESSED", label: "위축지역", desc: "가입 1개월 · 납입 1회" },
];

export function rankNeeds(zone: HeatZone): { years: number; pays: number; reside: number; label: string } {
  switch (zone) {
    case "HOT":
      return { years: 2, pays: 24, reside: 2, label: "투기과열·청약과열" };
    case "CAPITAL":
      return { years: 1, pays: 12, reside: 1, label: "수도권(과열 제외)" };
    case "DEPRESSED":
      return { years: 1 / 12, pays: 1, reside: 0, label: "위축지역" };
    default:
      return { years: 0.5, pays: 6, reside: 0, label: "비수도권 일반" };
  }
}

export function diagnoseRank(
  input: ProfileInput,
  opts: { accountYears: number; deposit85: boolean },
): RankDiagnosis {
  const need = rankNeeds(input.heatZone);
  const accountOk = opts.accountYears + 1e-9 >= need.years;
  const paymentsOk = input.paymentCount >= need.pays;
  const depositOk = opts.deposit85;
  const residenceOk = input.residenceYears + 1e-9 >= need.reside;
  const firstRankLikely = accountOk && paymentsOk && depositOk;
  const danghaeLikely = firstRankLikely && residenceOk;
  const missing: string[] = [];
  if (!accountOk) missing.push(`통장 가입기간 ${need.years < 1 ? `${Math.round(need.years * 12)}개월` : `${need.years}년`} 이상`);
  if (!paymentsOk) missing.push(`납입 인정 ${need.pays}회 이상`);
  if (!depositOk) missing.push("해당 지역 전용 85㎡ 예치기준금액");
  if (!residenceOk && need.reside > 0) missing.push(`해당 주택건설지역 ${need.reside}년 거주(당해)`);

  let summary = "민영 1순위 요건을 참고 기준으로 충족한 편입니다. 공고문의 해당/기타 구분을 확인하세요.";
  if (!firstRankLikely) {
    summary = `민영 1순위가 아직 어려울 수 있습니다. 부족한 항목: ${missing.filter((m) => !m.includes("거주")).join(", ") || "요건 확인"}.`;
  } else if (!danghaeLikely) {
    summary = "1순위 통장·예치 요건은 참고 충족이나, 당해 거주기간이 짧으면 기타 지역 물량만 해당될 수 있습니다.";
  }

  return {
    heatLabel: need.label,
    firstRankLikely,
    danghaeLikely,
    accountOk,
    paymentsOk,
    depositOk,
    residenceOk,
    needAccountYears: need.years,
    needPayments: need.pays,
    needResidenceYears: need.reside,
    missing,
    summary,
  };
}

export function preferredNoticeFilter(region: RegionType): "seoul" | "metro" | "etc" | "all" {
  if (region === "SEOUL_BUSAN") return "seoul";
  if (region === "METRO") return "metro";
  return "etc";
}
