import { accountPeriodScore, dependentsScore, homelessScore, runCalculation, spouseAccountBonus } from "./engine";
import { familyDependentCount, isTreatedHomeless } from "./family";
import { diagnoseRank } from "./rank";
import { DEFAULT_PROFILE } from "./types";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const h0 = homelessScore({ ...DEFAULT_PROFILE, hasHouse: true });
assert(h0.score === 0, "유주택 0점");

const cheap = homelessScore({ ...DEFAULT_PROFILE, hasHouse: true, smallCheapOnly: true, homelessYears: 8 });
assert(cheap.score === 18, `소형저가 예외 18점, 실제 ${cheap.score}`);
assert(isTreatedHomeless({ ...DEFAULT_PROFILE, hasHouse: true, smallCheapOnly: true }), "소형저가 무주택 인정");

const hYoung = homelessScore({ ...DEFAULT_PROFILE, age: 28, married: false, hasHouse: false });
assert(hYoung.score === 0, "만 30세 미만 미혼 0점");

const h8 = homelessScore({ ...DEFAULT_PROFILE, homelessYears: 8, age: 38, married: true, hasHouse: false });
assert(h8.score === 18, "8년 이상 18점");

const dated = homelessScore({
  ...DEFAULT_PROFILE,
  birthDate: "1988-09-07",
  marriageDate: "2020-01-01",
  hasHouse: false,
  married: true,
}, new Date("2026-09-07"));
assert(dated.score === 18, `날짜 기산 18점, 실제 ${dated.score}`);

assert(dependentsScore(0) === 5, "부양 0명 5점");
assert(dependentsScore(2) === 15, "부양 2명 15점");
assert(dependentsScore(6) === 35, "부양 6명 35점");

assert(
  familyDependentCount({
    ...DEFAULT_PROFILE,
    useFamilyWizard: true,
    married: true,
    childrenUnder30: 1,
    childrenOver30With1y: 0,
    parentsCared3y: false,
    parentsCount: 0,
  }) === 2,
  "마법사 배우자+자녀1 = 2",
);

assert(
  familyDependentCount({
    ...DEFAULT_PROFILE,
    useFamilyWizard: true,
    married: true,
    householdHead: true,
    parentsCared3y: true,
    parentsCount: 2,
    childrenUnder30: 0,
    childrenOver30With1y: 0,
  }) === 3,
  "마법사 배우자+부모2 = 3",
);

assert(accountPeriodScore(0.2) === 1, "6개월 미만 1점");
assert(accountPeriodScore(0.7) === 2, "1년 미만 2점");
assert(accountPeriodScore(10) === 12, "10년 12점");
assert(accountPeriodScore(15) === 17, "15년 17점");
assert(spouseAccountBonus(0) === 0, "배우자 없음");

const r = runCalculation({
  ...DEFAULT_PROFILE,
  homelessYears: 8,
  dependentsCount: 2,
  accountYears: 10,
  spouseAccountYears: 0,
});
assert(r.scores.total === 45, `예시 45점, 실제 ${r.scores.total}`);
assert(r.deposits[0].met, "서울 85㎡ 예치 충족");
assert(r.sim.shortfall === 9_000_000, "부족액 900만");
assert(r.sim.targetMonths === 36, "25만 원 시 36개월");
assert(r.sim.savedMonths === 54, "10만 원 대비 54개월 단축");
assert(r.rank.firstRankLikely, "기본 프로필 1순위 참고 충족");
assert(r.rank.danghaeLikely, "거주 3년으로 당해 참고 충족");
assert(r.nextActions.length === 3, "할 일 3개");
assert(r.sensitivity.plusDependent === 5, `부양 +1 = +5, 실제 ${r.sensitivity.plusDependent}`);
assert(r.sensitivity.plusHomelessYear === 2, `무주택 +1년 = +2, 실제 ${r.sensitivity.plusHomelessYear}`);
assert(r.sensitivity.plusAccountYear === 1, `통장 +1년 = +1, 실제 ${r.sensitivity.plusAccountYear}`);

const hotFail = diagnoseRank(
  { ...DEFAULT_PROFILE, heatZone: "HOT", paymentCount: 10, residenceYears: 0.5, accountYears: 1 },
  { accountYears: 1, deposit85: true },
);
assert(!hotFail.firstRankLikely, "과열 1년·10회는 1순위 아님");
assert(hotFail.missing.length >= 1, "부족 항목 안내");

const second = diagnoseRank(
  { ...DEFAULT_PROFILE, heatZone: "OTHER", paymentCount: 2 },
  { accountYears: 0.2, deposit85: false },
);
assert(!second.firstRankLikely, "비수도권 미충족");

const capOk = diagnoseRank(
  { ...DEFAULT_PROFILE, heatZone: "CAPITAL", paymentCount: 12, residenceYears: 1 },
  { accountYears: 1, deposit85: true },
);
assert(capOk.firstRankLikely && capOk.danghaeLikely, "수도권 1년·12회·당해 1년");

const publicOnly = runCalculation({ ...DEFAULT_PROFILE, accountType: "savings" });
assert(publicOnly.special.convertLegacy, "구형 저축 전환 플래그");
assert(publicOnly.nextActions.some((a) => a.title.includes("종합저축")), "전환 할 일");

console.log("engine tests passed");
