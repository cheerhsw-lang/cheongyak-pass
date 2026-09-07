"use client";

import Link from "next/link";
import { OFFICIAL_LINKS } from "@/lib/sources";
import type { FontScale } from "@/lib/types";

export function Header({
  fontScale,
  onFontScale,
}: {
  fontScale: FontScale;
  onFontScale: (s: FontScale) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:rgb(242_235_224_/_0.88)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--ink)] text-[var(--brass-2)]">
            <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
              <path d="M4 11.5 12 5l8 6.5V20H4z" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M9 14.5h6v5.5H9z" fill="currentColor" />
            </svg>
          </span>
          <span>
            <span className="block text-xl font-extrabold tracking-tight">청약패스</span>
            <span className="block text-sm text-[var(--muted)]">주택청약 성공 계산기 · 민간 참고</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-base font-semibold">
          <Link className="touch rounded-2xl px-3 py-2 hover:bg-white/70" href="/#calc">
            가점계산
          </Link>
          <Link className="touch rounded-2xl px-3 py-2 hover:bg-white/70" href="/#notice">
            공고안내
          </Link>
          <Link className="touch rounded-2xl px-3 py-2 hover:bg-white/70" href="/guide/">
            이용안내
          </Link>
          <Link className="touch rounded-2xl px-3 py-2 hover:bg-white/70" href="/legal/">
            저작권·면책
          </Link>
          <a
            className="touch rounded-2xl bg-[var(--ink)] px-4 py-2 text-white"
            href={OFFICIAL_LINKS.applyHome}
            target="_blank"
            rel="noopener noreferrer"
          >
            청약홈 공식조회
          </a>
        </nav>
      </div>
      <div className="border-t border-[var(--line)] bg-[#1b1914] text-[#f2ebe0]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-sm">
          <p>정부·한국부동산원·청약홈 공식 서비스가 아닙니다. 결과는 법적 효력이 없는 참고 자료입니다.</p>
          <div className="flex items-center gap-2 no-print" aria-label="글자 크기">
            <span className="opacity-80">글자</span>
            {(["normal", "large", "xlarge"] as FontScale[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`touch rounded-xl px-3 ${fontScale === s ? "bg-[var(--brass)] text-white" : "bg-white/10"}`}
                onClick={() => onFontScale(s)}
              >
                {s === "normal" ? "보통" : s === "large" ? "크게" : "더크게"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
