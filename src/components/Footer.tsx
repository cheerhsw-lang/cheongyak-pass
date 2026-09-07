import Link from "next/link";
import { DISCLAIMER, OFFICIAL_LINKS, SOURCE_FOOTER } from "@/lib/sources";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-[#1b1914] text-[#f2ebe0]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="kicker text-[var(--brass-2)]">출처 표기</p>
        <p className="mt-2 text-lg font-bold">{SOURCE_FOOTER}</p>
        <p className="mt-4 max-w-4xl text-[0.98rem] leading-relaxed text-[#e7ddce]">{DISCLAIMER}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-base">
          <a className="underline decoration-[var(--brass-2)]" href={OFFICIAL_LINKS.applyHome} target="_blank" rel="noopener noreferrer">
            청약홈
          </a>
          <a className="underline decoration-[var(--brass-2)]" href={OFFICIAL_LINKS.dataPortal} target="_blank" rel="noopener noreferrer">
            공공데이터포털
          </a>
          <a className="underline decoration-[var(--brass-2)]" href={OFFICIAL_LINKS.law} target="_blank" rel="noopener noreferrer">
            주택공급에 관한 규칙
          </a>
          <Link className="underline decoration-[var(--brass-2)]" href="/legal/">
            저작권·개인정보·면책
          </Link>
          <Link className="underline decoration-[var(--brass-2)]" href="/guide/">
            계산 근거
          </Link>
        </div>
        <p className="mt-8 text-sm opacity-70">© {new Date().getFullYear()} 청약패스 · 비영리 공익 참고 도구 · 광고·회원가입 없음</p>
      </div>
    </footer>
  );
}
