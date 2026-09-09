"use client";

import Link from "next/link";
import { useState } from "react";
import { OFFICIAL_LINKS } from "@/lib/sources";
import type { FontScale } from "@/lib/types";

export function Header({
  fontScale,
  onFontScale,
}: {
  fontScale: FontScale;
  onFontScale: (s: FontScale) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:rgb(255_250_244_/_0.94)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--navy)] text-[var(--brass-2)] sm:h-11 sm:w-11 sm:rounded-2xl">
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
              <path d="M4 11.5 12 5l8 6.5V20H4z" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M9 14.5h6v5.5H9z" fill="currentColor" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-extrabold tracking-tight sm:text-xl">청약패스</span>
            <span className="hidden truncate text-sm text-[var(--muted)] sm:block">주택청약 성공 계산기 · 민간 참고</span>
          </span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 text-base font-semibold lg:flex">
          <NavLinks onClick={() => setOpen(false)} />
        </nav>
        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <button
            type="button"
            className="btn-quiet rounded-xl px-3 py-2 text-sm font-bold lg:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "닫기" : "메뉴"}
          </button>
          <a
            className="touch btn-fill rounded-xl px-3 py-2 text-sm font-bold sm:rounded-2xl sm:px-4"
            href={OFFICIAL_LINKS.applyHome}
            target="_blank"
            rel="noopener noreferrer"
          >
            청약홈
          </a>
        </div>
      </div>
      <p className="bg-[var(--navy)] px-3 py-1.5 text-center text-xs leading-snug text-[var(--ivory)] sm:text-sm">
        정부·한국부동산원·청약홈 공식 서비스가 아닙니다. 결과는 참고 자료입니다.
      </p>
      <div
        id="site-menu"
        hidden={!open}
        className="border-t border-[var(--line)] bg-[var(--card)] px-3 py-3 lg:hidden"
      >
        <div className="flex flex-col gap-1 font-semibold">
          <NavLinks onClick={() => setOpen(false)} />
        </div>
        <FontButtons fontScale={fontScale} onFontScale={onFontScale} />
      </div>
      <div className="hidden border-t border-[var(--line)] bg-[var(--tint-navy)] lg:block">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-2">
          <FontButtons fontScale={fontScale} onFontScale={onFontScale} />
        </div>
      </div>
    </header>
  );
}

function NavLinks({ onClick }: { onClick: () => void }) {
  const cls = "rounded-xl px-3 py-2 text-[var(--ink)] hover:bg-[var(--tint-navy)]";
  return (
    <>
      <Link className={cls} href="/#calc" onClick={onClick}>
        가점계산
      </Link>
      <Link className={cls} href="/#notice" onClick={onClick}>
        공고안내
      </Link>
      <Link className={cls} href="/guide/" onClick={onClick}>
        이용안내
      </Link>
      <Link className={cls} href="/legal/" onClick={onClick}>
        저작권·면책
      </Link>
    </>
  );
}

function FontButtons({
  fontScale,
  onFontScale,
}: {
  fontScale: FontScale;
  onFontScale: (s: FontScale) => void;
}) {
  return (
    <div className="mt-3 flex items-center gap-2 no-print lg:mt-0" aria-label="글자 크기">
      <span className="text-sm text-[var(--muted)]">글자</span>
      {(["normal", "large", "xlarge"] as FontScale[]).map((s) => (
        <button
          key={s}
          type="button"
          className={`rounded-xl px-3 py-2 text-sm font-bold ${fontScale === s ? "btn-fill" : "btn-quiet"}`}
          onClick={() => onFontScale(s)}
        >
          {s === "normal" ? "보통" : s === "large" ? "크게" : "더크게"}
        </button>
      ))}
    </div>
  );
}
