"use client";

import type { ScoreBreakdown } from "@/lib/types";
import { scoreTone } from "@/lib/format";

export function ScorePanel({ scores }: { scores: ScoreBreakdown }) {
  const tone = scoreTone(scores.total);
  const pct = Math.round((scores.total / 84) * 100);
  const r = 54;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const color = tone === "high" ? "#1d6a4a" : tone === "good" ? "#1e3a5f" : tone === "mid" ? "#8d6230" : "#b13228";

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 140 140" aria-hidden>
          <circle cx="70" cy="70" r={r} fill="none" stroke="#e7ddce" strokeWidth="12" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <p className="num text-4xl font-black leading-none">{scores.total}</p>
          <p className="text-sm text-[var(--muted)]">/ 84점</p>
        </div>
      </div>
      <ul className="w-full flex-1 space-y-2">
        <ScoreRow label="무주택기간" max={32} value={scores.homeless} />
        <ScoreRow label="부양가족수" max={35} value={scores.dependents} />
        <ScoreRow
          label="청약통장 가입기간"
          max={17}
          value={scores.account}
          extra={scores.spouseBonus > 0 ? `배우자 합산 참고 +${scores.spouseBonus}` : undefined}
        />
      </ul>
    </div>
  );
}

function ScoreRow({ label, max, value, extra }: { label: string; max: number; value: number; extra?: string }) {
  return (
    <li>
      <div className="flex justify-between text-sm font-semibold">
        <span>{label}</span>
        <span className="num">
          {value} / {max}
        </span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-[#efe6d8]">
        <div className="h-full rounded-full bg-[var(--ink)]" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      {extra ? <p className="mt-1 text-sm text-[var(--muted)]">{extra}</p> : null}
    </li>
  );
}
