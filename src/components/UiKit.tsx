"use client";

import type { ReactNode } from "react";

export function Stepper({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-bold">{label}</p>
          {hint ? <p className="text-sm text-[var(--muted)]">{hint}</p> : null}
        </div>
        <p className="num text-2xl font-extrabold">
          {value.toLocaleString("ko-KR")}
          {suffix ? <span className="ml-1 text-base font-semibold">{suffix}</span> : null}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="touch btn-quiet rounded-2xl px-5 text-2xl font-bold"
          aria-label={`${label} 줄이기`}
          onClick={() => onChange(Math.max(min, +(value - step).toFixed(4)))}
        >
          −
        </button>
        <input
          className="h-3 w-full accent-[var(--navy)]"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <button
          type="button"
          className="touch btn-quiet rounded-2xl px-5 text-2xl font-bold"
          aria-label={`${label} 늘리기`}
          onClick={() => onChange(Math.min(max, +(value + step).toFixed(4)))}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function ChoiceGroup<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: T;
  options: { value: T; label: string; desc?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="font-bold">{label}</legend>
      {hint ? <p className="mb-2 text-sm text-[var(--muted)]">{hint}</p> : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const on = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              className={`touch rounded-2xl border px-3 py-2.5 text-left sm:px-4 sm:py-3 ${on ? "btn-fill" : "btn-quiet"}`}
              onClick={() => onChange(opt.value)}
              aria-pressed={on}
            >
              <span className="block font-bold">{opt.label}</span>
              {opt.desc ? <span className={`block text-sm ${on ? "text-[var(--ivory)]/90" : "text-[var(--muted)]"}`}>{opt.desc}</span> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Section({
  id,
  kicker,
  title,
  children,
}: {
  id?: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="card mt-6 p-5 sm:p-7">
      <p className="kicker">{kicker}</p>
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
