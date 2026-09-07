import { PageFrame } from "@/components/PageFrame";
import { OFFICIAL_LINKS } from "@/lib/sources";

export default function GuidePage() {
  return (
    <PageFrame>
      <p className="kicker">계산 근거</p>
      <h1 className="mt-2 text-4xl font-black">이 계산기는 무엇을 참고하나요</h1>
      <p className="mt-4 text-[var(--muted)]">
        청약패스는 주거 안정을 돕는 공익 목적의 민간 참고 도구입니다. 법령과 공공기관이 이미 공개한 배점·예치금·공공데이터만을 요약해 보여 주며, 공식 접수·당첨 심사를 대신하지 않습니다.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">민영 1순위 (참고 게이트)</h2>
      <p className="mt-2">
        가점 84점은 1순위 안에서 적용됩니다. 청약패스는 투기과열·청약과열(가입 2년·납입 24회·당해 2년), 수도권 그 외(1년·12회·당해 1년), 비수도권(6개월·6회), 위축(1개월·1회)을 참고 기준으로 보여 줍니다. 실제 요건은 해당 입주자모집공고문을 따릅니다.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">부양가족 구성</h2>
      <p className="mt-2">
        배우자는 등본 분리여도 인정되는 경우가 많고, 만 30세 이상 미혼 자녀는 1년 이상 등재, 직계존속은 세대주가 3년 부양해야 하는 경우가 많습니다. 숫자만 넣으면 틀리기 쉬워 구성 질문을 제공합니다.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">소형·저가주택</h2>
      <p className="mt-2">
        전용 60㎡ 이하이면서 공시가격 요건을 갖춘 1호는 무주택 기간을 인정받는 예외가 있습니다. 가격 한도는 개정될 수 있으므로 공고문·HUG 안내를 확인하세요.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">홈 화면 설치</h2>
      <p className="mt-2">
        브라우저 메뉴의 홈 화면에 추가(또는 설치)로 앱처럼 쓸 수 있습니다. 관심 단지 알림은 이 기기에서만 울리며 서버로 보내지 않습니다.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">민영주택 가점 (84점)</h2>
      <p className="mt-2">
        무주택기간 32점, 부양가족수 35점, 청약통장 가입기간 17점은 「주택공급에 관한 규칙」 별표 가점제 배점을 따릅니다. 만 30세 미만 미혼 무주택자는 무주택기간 0점, 유주택 세대도 0점입니다.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        <li>무주택 1년 미만 2점, 1년마다 2점, 15년 이상 32점</li>
        <li>부양가족 0명(본인만) 5점, 1명당 5점, 6명 이상 35점</li>
        <li>통장 6개월 미만 1점, 6개월~1년 2점, 이후 1년마다 1점, 15년 이상 17점</li>
      </ul>
      <p className="mt-3">
        배우자 가입기간 합산, 미성년 가입 인정 한도처럼 세부 산정은 개정 시점과 은행 시스템에 따라 달라질 수 있습니다. 입력칸의 기간은 <strong>은행·청약홈에 표시된 값</strong>을 넣는 것이 가장 안전합니다.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">민영 예치기준금액</h2>
      <p className="mt-2">
        「주택공급에 관한 규칙」 별표 민영주택 청약 예치기준금액을 사용합니다. 서울·부산 / 그 밖의 광역시 / 그 외 지역, 전용 85·102·135㎡·모든 면적 구간입니다. 기준 시점은 입주자모집공고일 현재 주민등록 주소지입니다.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">공공분양 월 납입 시뮬레이션</h2>
      <p className="mt-2">
        국민주택 월 납입 인정 한도가 2024년 11월 납입분부터 10만 원에서 25만 원으로 오른 사실을 반영합니다. 화면의 2,100만 원 목표는 법령이 정한 당첨선이 아니라 사용자가 바꿀 수 있는 참고 가정값입니다. 실제 당첨은 해당 단지의 무주택 요건·납입인정금액 순위·공고 조건을 따릅니다.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">분양 공고 목록</h2>
      <p className="mt-2">
        한국부동산원이 공공데이터포털에 제공하는 주택청약정보 OPEN API를 선택적으로 사용합니다. 인증키는 서버로 보내지 않고 사용자 기기에만 저장할 수 있습니다. 키가 없어도 청약홈 공식 페이지로 바로 이동할 수 있습니다.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">확인해야 할 공식 창구</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <a className="underline" href={OFFICIAL_LINKS.applyHome} target="_blank" rel="noopener noreferrer">
            청약홈 (applyhome.co.kr)
          </a>{" "}
          — 공고·접수·당첨
        </li>
        <li>
          <a className="underline" href={OFFICIAL_LINKS.law} target="_blank" rel="noopener noreferrer">
            국가법령정보센터 주택공급에 관한 규칙
          </a>
        </li>
        <li>
          <a className="underline" href={OFFICIAL_LINKS.hugScore} target="_blank" rel="noopener noreferrer">
            주택도시보증공사 청약가점 안내
          </a>
        </li>
        <li>
          <a className="underline" href={OFFICIAL_LINKS.dataPortal} target="_blank" rel="noopener noreferrer">
            공공데이터포털
          </a>
        </li>
      </ul>
    </PageFrame>
  );
}
