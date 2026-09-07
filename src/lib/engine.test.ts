import { accountPeriodScore, dependentsScore, homelessScore, runCalculation, spouseAccountBonus } from "./engine";
import { DEFAULT_PROFILE } from "./types";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const h0 = homelessScore({ ...DEFAULT_PROFILE, hasHouse: true });
assert(h0.score === 0, "유주택 0점");

const hYoung = homelessScore({ ...DEFAULT_PROFILE, age: 28, married: false, hasHouse: false });
assert(hYoung.score === 0, "만 30세 미만 미혼 0점");

const h8 = homelessScore({ ...DEFAULT_PROFILE, homelessYears: 8, age: 38, married: true, hasHouse: false });
assert(h8.score === 18, "8년 이상 18점");

assert(dependentsScore(0) === 5, "부양 0명 5점");
assert(dependentsScore(2) === 15, "부양 2명 15점");
assert(dependentsScore(6) === 35, "부양 6명 35점");

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

console.log("engine tests passed");
