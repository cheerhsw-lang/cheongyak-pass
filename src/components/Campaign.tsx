"use client";

import { LAW_AS_OF, type NextAction, type RankDiagnosis, type ScoreBreakdown, type Sensitivity, type TrackMode } from "@/lib/types";
import { ScorePanel } from "./ScorePanel";

export function TrackTabs({ value, onChange }: { value: TrackMode; onChange: (v: TrackMode) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        className={`touch rounded-2xl px-4 py-3 font-bold ${value === "private" ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white"}`}
        onClick={() => onChange("private")}
      >
        민영 일반공급
      </button>
      <button
        type="button"
        className={`touch rounded-2xl px-4 py-3 font-bold ${value === "public" ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white"}`}
        onClick={() => onChange("public")}
      >
        공공·국민주택
      </button>
    </div>
  );
}

export function CommandCenter({
  track,
  scores,
  rank,
  publicShort,
  actions,
}: {
  track: TrackMode;
  scores: ScoreBreakdown;
  rank: RankDiagnosis;
  publicShort: string;
  actions: NextAction[];
}) {
  return (
    <section className="card p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="kicker">오늘 작전실</p>
        <span className="rounded-full border border-[var(--line)] px-3 py-1 text-sm">법령 참고일 {LAW_AS_OF}</span>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          {track === "private" ? (
            <>
              <p className={`text-2xl font-black ${rank.firstRankLikely ? "text-[var(--pine)]" : "text-[var(--clay)]"}`}>
                {rank.firstRankLikely ? "민영 1순위 가능 (참고)" : "민영 1순위 미충족 가능 (참고)"}
              </p>
              <p className="mt-1 text-[var(--muted)]">{rank.summary}</p>
              {!rank.danghaeLikely && rank.firstRankLikely ? (
                <p className="mt-2 font-semibold">당해 거주가 짧으면 기타 지역 물량을 우선 보세요.</p>
              ) : null}
              <div className="mt-4">
                <ScorePanel scores={scores} />
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-black">공공·국민주택은 저축총액 경쟁</p>
              <p className="mt-1 text-[var(--muted)]">
                84점 가점이 아닙니다. 무주택 세대구성원과 월 인정 납입 누적이 핵심입니다. 목표 참고액까지 {publicShort}.
              </p>
            </>
          )}
        </div>
        <ol className="space-y-3">
          <p className="font-bold">오늘 할 일 3가지</p>
          {actions.map((a, i) => (
            <li key={a.title} className="rounded-2xl border border-[var(--line)] bg-white p-4">
              <p className="text-sm text-[var(--brass)]">{i + 1}</p>
              <p className="font-extrabold">{a.title}</p>
              <p className="text-sm text-[var(--muted)]">{a.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function SensitivityCard({ s }: { s: Sensitivity }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <p className="rounded-2xl bg-[#fff7ea] p-4">
        부양가족 1명 더 인정되면 <strong className="num">+{s.plusDependent}점</strong>
      </p>
      <p className="rounded-2xl bg-[#fff7ea] p-4">
        무주택 1년 더면 <strong className="num">+{s.plusHomelessYear}점</strong>
      </p>
      <p className="rounded-2xl bg-[#fff7ea] p-4">
        통장 1년 더면 <strong className="num">+{s.plusAccountYear}점</strong>
      </p>
    </div>
  );
}

export function RankChecks({ rank }: { rank: RankDiagnosis }) {
  const rows = [
    ["통장 가입기간", rank.accountOk],
    ["납입 인정 횟수", rank.paymentsOk],
    ["85㎡ 예치", rank.depositOk],
    ["당해 거주기간", rank.residenceOk],
  ] as const;
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {rows.map(([label, ok]) => (
        <li key={label} className={`rounded-2xl px-4 py-3 font-bold ${ok ? "bg-[#e8f6ee] text-[var(--pine)]" : "bg-[#fff4f2] text-[var(--clay)]"}`}>
          {ok ? "충족 · " : "부족 · "}
          {label}
        </li>
      ))}
    </ul>
  );
}
