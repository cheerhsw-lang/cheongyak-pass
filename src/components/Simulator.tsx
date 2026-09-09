"use client";

import { useMemo, useState } from "react";
import type { PublicSim } from "@/lib/types";
import { monthsToLabel } from "@/lib/engine";
import { manWon, won } from "@/lib/format";

export function Simulator({
  monthly,
  onMonthly,
  sim,
  current,
  target,
}: {
  monthly: number;
  onMonthly: (n: number) => void;
  sim: PublicSim;
  current: number;
  target: number;
}) {
  const [zoom, setZoom] = useState(1);
  const ratio = target <= 0 ? 1 : Math.min(1, current / target);
  const after = target <= 0 ? 1 : Math.min(1, (current + monthly) / target);

  const ticks = useMemo(() => {
    const months = Math.max(sim.targetMonths, sim.baselineMonths, 12);
    const shown = Math.max(6, Math.round(months / zoom));
    return Array.from({ length: 8 }, (_, i) => Math.round((shown / 7) * i));
  }, [sim.baselineMonths, sim.targetMonths, zoom]);

  return (
    <div className="space-y-5">
      <p className="text-[var(--muted)]">
        2024년 11월 납입분부터 국민주택(공공분양 등) 월 인정 한도가 <strong className="text-[var(--ink)]">10만 원 → 25만 원</strong>으로
        올랐습니다. 아래 목표액은 법령상 커트라인이 아니라, 수도권에서 자주 거론되는 <strong>참고 가정값</strong>입니다. 직접 바꿀 수 있습니다.
      </p>
      <div>
        <p className="mb-2 font-bold">앞으로 매월 넣을 금액</p>
        <div className="grid grid-cols-5 gap-2">
          {[5, 10, 15, 20, 25].map((m) => {
            const v = m * 10_000;
            const on = monthly === v;
            return (
              <button
                key={m}
                type="button"
                className={`touch rounded-2xl border text-center text-sm font-bold sm:text-base ${on ? "btn-fill" : "btn-quiet"}`}
                onClick={() => onMonthly(v)}
              >
                {m}만
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Gauge title="지금 인정액" value={ratio} caption={`${manWon(current)} / ${manWon(target)}`} />
        <Gauge title="한 달 더 납입 후" value={after} caption={`${won(monthly)} 추가 시`} />
      </div>
      <div
        className="rounded-2xl border border-[var(--line)] bg-[var(--tint)] p-4"
        onWheel={(e) => {
          if (!e.ctrlKey && !e.metaKey) return;
          e.preventDefault();
          setZoom((z) => Math.min(4, Math.max(1, z + (e.deltaY < 0 ? 0.25 : -0.25))));
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-bold">도달 타임라인</p>
          <div className="flex gap-2">
            <button type="button" className="touch btn-quiet rounded-xl px-3 font-bold" onClick={() => setZoom((z) => Math.max(1, z - 0.5))}>
              넓게
            </button>
            <button type="button" className="touch btn-quiet rounded-xl px-3 font-bold" onClick={() => setZoom((z) => Math.min(4, z + 0.5))}>
              자세히
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">버튼을 누르거나, 컴퓨터에서는 Ctrl+스크롤로 기간을 늘리고 줄일 수 있습니다.</p>
        <div className="relative mt-4 h-24">
          <div className="absolute inset-x-0 top-10 h-2 rounded-full bg-[var(--tint)]" />
          <div
            className="absolute top-10 h-2 rounded-full bg-[var(--navy)]"
            style={{ width: sim.baselineMonths === 0 ? "100%" : `${Math.min(100, (sim.targetMonths / Math.max(sim.baselineMonths, 1)) * 100)}%` }}
          />
          {ticks.map((m) => (
            <div key={m} className="absolute top-6" style={{ left: `${(m / Math.max(ticks[ticks.length - 1] || 1, 1)) * 100}%` }}>
              <div className="h-10 w-px bg-[var(--line)]" />
              <span className="num relative -left-4 text-xs text-[var(--muted)]">{m}개월</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <p>
            월 {manWon(monthly)} 납입 시 <strong className="num text-2xl">{monthsToLabel(sim.targetMonths)}</strong>
            <span className="block text-[var(--muted)]">{sim.expectedLabel} 전후 도달(참고)</span>
          </p>
          <p>
            종전 한도 월 10만 원 대비 <strong className="num text-2xl">{monthsToLabel(sim.savedMonths)} 단축</strong>
            <span className="block text-[var(--muted)]">10만 원 시 {sim.baselineLabel}</span>
          </p>
        </div>
        {sim.shortfall === 0 ? (
          <p className="mt-3 font-bold text-[var(--pine)]">목표 참고액을 이미 충족했습니다.</p>
        ) : monthly === 250_000 ? (
          <p className="mt-3 font-bold text-[var(--pine)]">월 25만 원(현행 인정 한도)은 도달 기간을 가장 짧게 만듭니다.</p>
        ) : monthly < 100_000 ? (
          <p className="mt-3 font-bold text-[var(--clay)]">월 5만 원은 기간이 크게 늘어납니다. 여력이 되면 한도를 올려 보세요.</p>
        ) : null}
      </div>
    </div>
  );
}

function Gauge({ title, value, caption }: { title: string; value: number; caption: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <p className="font-bold">{title}</p>
      <div className="mt-3 h-5 overflow-hidden rounded-full bg-[var(--tint)]">
        <div className="h-full rounded-full bg-[var(--navy)] transition-all" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]">{caption}</p>
    </div>
  );
}
