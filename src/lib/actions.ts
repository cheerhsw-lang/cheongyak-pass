import { manWon, won } from "./format";
import type { DepositCheck, NextAction, ProfileInput, PublicSim, RankDiagnosis, SpecialFlags } from "./types";

export function buildNextActions(input: {
  rank: RankDiagnosis;
  deposits: DepositCheck[];
  special: SpecialFlags;
  sim: PublicSim;
  profile: ProfileInput;
  nearestSchedule?: { title: string; date: string; days: number };
}): NextAction[] {
  const out: NextAction[] = [];
  const { rank, deposits, special, sim, profile, nearestSchedule } = input;
  const short85 = deposits[0] && !deposits[0].met ? deposits[0].amount - profile.currentAmount : 0;

  if (nearestSchedule && nearestSchedule.days >= 0 && nearestSchedule.days <= 7) {
    out.push({
      title: `${nearestSchedule.title} 접수 D-${nearestSchedule.days === 0 ? "Day" : nearestSchedule.days}`,
      detail: "청약홈에서 해당 입주자모집공고문을 열고 자격·일정을 확인하세요. 이 앱의 일정은 참고용입니다.",
    });
  }

  if (!rank.firstRankLikely) {
    out.push({
      title: "민영 1순위 요건을 채우세요",
      detail: rank.missing.length ? `부족한 참고 항목: ${rank.missing.join(", ")}.` : rank.summary,
    });
  } else if (!rank.danghaeLikely) {
    out.push({
      title: "당해 거주가 짧으면 기타 물량을 보세요",
      detail: "1순위 통장·예치는 참고 충족입니다. 해당 주택건설지역 거주기간이 짧으면 기타 지역 우선 공급을 공고문에서 확인하세요.",
    });
  }

  if (short85 > 0) {
    out.push({
      title: `민영 85㎡ 예치 ${manWon(short85)} 부족`,
      detail: `지금 인정액 ${won(profile.currentAmount)}. 공고일 전날까지 해당 지역 예치기준을 맞추세요.`,
    });
  }

  if (special.convertLegacy) {
    out.push({
      title: "같은 은행에서 종합저축 전환을 상담하세요",
      detail: "구형 청약저축·예금·부금은 기존 가입 은행 영업점에서만 주택청약종합저축으로 바꿀 수 있습니다.",
    });
  }

  if (sim.shortfall > 0 && profile.monthlyDeposit < 250_000) {
    out.push({
      title: "공공분양은 월 인정 한도 25만 원을 검토하세요",
      detail: `목표 참고액까지 ${won(sim.shortfall)} 부족합니다. 종전 10만 원보다 25만 원이 도달을 앞당깁니다.`,
    });
  }

  if (special.multiChild || special.newlywed || special.firstHome || special.newborn || special.elderlyParents) {
    out.push({
      title: "특별공급 후보를 공고문과 대조하세요",
      detail: "다자녀·신혼·생애최초·신생아·노부모는 단지마다 요건이 다릅니다. 일반공급 가점과 별개입니다.",
    });
  }

  if (out.length < 3) {
    out.push({
      title: "청약홈에서 최종 공고문을 확인하세요",
      detail: "본 결과는 법적 효력이 없는 참고입니다. 접수·당첨은 applyhome.co.kr 공고문과 은행 조회가 기준입니다.",
    });
  }

  if (out.length < 3) {
    out.push({
      title: "관심 단지 접수일을 이 기기에 저장하세요",
      detail: "아래 D-Day에 날짜를 적어두면 다시 들어와도 남고, 알림을 켜면 접수 전에 알려 드립니다.",
    });
  }

  if (out.length < 3) {
    out.push({
      title: "은행 앱에서 가입기간·납입횟수를 조회하세요",
      detail: "실제 1순위·가점은 은행과 청약홈 산정값이 우선입니다. 본 화면 숫자는 같은 배점표를 쓴 참고값입니다.",
    });
  }

  return out.slice(0, 3);
}
