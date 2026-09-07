import { PageFrame } from "@/components/PageFrame";
import { DISCLAIMER, OFFICIAL_LINKS, SOURCE_FOOTER } from "@/lib/sources";

export default function LegalPage() {
  return (
    <PageFrame>
      <p className="kicker">법적 고지</p>
      <h1 className="mt-2 text-4xl font-black">저작권 · 공공데이터 · 개인정보 · 면책</h1>
      <p className="mt-4 text-[var(--muted)]">{DISCLAIMER}</p>

      <h2 className="mt-10 text-2xl font-extrabold">1. 이 서비스의 성격 (사칭 금지)</h2>
      <p className="mt-2">
        청약패스는 민간이 만든 비영리 성격의 참고 계산기입니다. 대한민국 정부, 국토교통부, 한국부동산원, 청약홈, 주택도시보증공사, 각 지방자치단체의 공식 창구가 아닙니다. 앱 이름·화면·아이콘에 ‘정부 공식’, ‘한국부동산원 공인’, ‘청약홈 공식 앱’과 같은 표현을 쓰지 않습니다.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">2. 공공데이터 이용</h2>
      <p className="mt-2">
        분양 공고를 불러올 때 사용하는 원천은 공공데이터포털에 공개된 한국부동산원 주택청약정보입니다. 「공공데이터의 제공 및 이용 활성화에 관한 법률」에 따라 출처를 밝히고, 공공데이터를 상업적으로 왜곡하거나 원 제공기관인 것처럼 표시하지 않습니다.
      </p>
      <p className="mt-2 font-bold">{SOURCE_FOOTER}</p>
      <p className="mt-2">
        공공데이터 오류·누락·갱신 지연이 있을 수 있습니다. 본 화면의 목록은 원문을 보기 쉽게 재구성한 참고본이며, 입주자모집공고의 효력은 청약홈과 사업주체 공고문에만 있습니다.
      </p>
      <p className="mt-2">
        데이터셋 원문:{" "}
        <a className="underline" href={OFFICIAL_LINKS.dataSet} target="_blank" rel="noopener noreferrer">
          공공데이터포털 한국부동산원 주택청약정보
        </a>
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">3. 법령·배점표 저작권</h2>
      <p className="mt-2">
        가점 배점과 예치기준금액은 「주택공급에 관한 규칙」 등 공개 법령의 내용을 계산에 필요한 범위에서 인용·요약합니다. 법령의 공식 원문은 국가법령정보센터에 있습니다. 청약홈·HUG·은행 웹사이트의 문장, 이미지, 로고, 공고문 PDF를 그대로 복사해 두지 않았습니다.
      </p>
      <p className="mt-2">
        화면의 설명 문장, 레이아웃, 계산 프로그램 코드는 청약패스 원저작물입니다. 법령 원문 자체는 국가의 법령 정보이며, 공공데이터는 각 제공 기관의 이용조건(공공누리 등)을 따릅니다.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">4. 면책</h2>
      <p className="mt-2">
        계산 결과, 특별공급 후보 표시, 납입 도달 시점, 공고 일정은 입력값과 공개 기준을 바탕으로 한 추정입니다. 오입력, 법령·고시 개정, 단지별 특별 규정, 전산 산정 차이로 실제와 다를 수 있습니다. 청약 신청, 계약, 대출, 세금에 관한 결정의 책임은 이용자에게 있으며, 본 서비스는 법률·세무·금융 자문이 아닙니다.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">5. 개인정보 — 수집하지 않습니다</h2>
      <p className="mt-2">
        회원가입, 로그인, 이름, 주민등록번호, 전화번호, 계좌번호, 위치추적을 요구하지 않습니다. 나이·가족 수·납입액 등 이용자가 입력한 값은 이용자 브라우저의 로컬 저장소(localStorage)에만 남고, 청약패스 운영 서버로 전송하지 않습니다. 공고 조회용 인증키를 넣는 경우에도 같은 기기에만 저장됩니다.
      </p>
      <p className="mt-2">
        다음에 같은 브라우저로 들어오면 이전 입력값이 보여 ‘다시 로그인’할 필요가 없습니다. 다른 사람 기기·공용 PC를 쓰면 저장값을 직접 지워야 합니다. 화면 아래 ‘내 기기 저장값 삭제’로 즉시 지울 수 있습니다.
      </p>
      <p className="mt-2">
        청약홈·은행 사이트로 이동하면 해당 기관의 개인정보 처리방침이 적용됩니다. 본 서비스는 그 사이트에 이용자 정보를 넘기지 않습니다.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">6. 상표</h2>
      <p className="mt-2">
        청약홈, 한국부동산원, 공공데이터포털, 각 은행 명칭은 해당 권리자의 상표 또는 명칭입니다. 안내 목적의 표기일 뿐 제휴·후원·감수를 뜻하지 않습니다.
      </p>

      <h2 className="mt-10 text-2xl font-extrabold">7. 공익성</h2>
      <p className="mt-2">
        주택 청약 제도는 공개된 규칙인데도 배점과 예치금이 복잡해 접근이 어렵습니다. 이 도구는 광고 없이 그 규칙을 큰 글씨로 풀어, 누구나 공식 창구로 가기 전에 스스로 준비할 수 있게 하려는 공익 목적입니다. 최종 확인은 항상 청약홈과 입주자모집공고문입니다.
      </p>
    </PageFrame>
  );
}
