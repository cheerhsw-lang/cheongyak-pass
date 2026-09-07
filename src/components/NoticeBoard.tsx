"use client";

import { useEffect, useState } from "react";
import { fetchNotices, loadOdcloudKey, receiptStatus, regionGroup, saveOdcloudKey, type AptNotice } from "@/lib/notices";
import { OFFICIAL_LINKS } from "@/lib/sources";

const FILTERS = [
  { id: "all", label: "전체" },
  { id: "seoul", label: "서울" },
  { id: "metro", label: "경기·인천" },
  { id: "etc", label: "그 외 지역" },
] as const;

export function NoticeBoard() {
  const [keyInput, setKeyInput] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [items, setItems] = useState<AptNotice[]>([]);
  const [remainder, setRemainder] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  useEffect(() => {
    const saved = loadOdcloudKey();
    if (saved) {
      setKeyInput(saved);
      setHasKey(true);
    }
  }, []);

  async function load(rem = remainder, serviceKey = loadOdcloudKey() || keyInput) {
    if (!serviceKey.trim()) {
      setError("공공데이터포털 일반 인증키를 이 기기에만 저장하면 최근 공고를 불러옵니다.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await fetchNotices(serviceKey.trim(), rem);
      saveOdcloudKey(serviceKey.trim());
      setHasKey(true);
      setItems(data);
      if (data.length === 0) setError("조건에 맞는 최근 공고가 없습니다. 청약홈에서 직접 확인해 주세요.");
    } catch (e) {
      setItems([]);
      setError(e instanceof Error ? e.message : "현재 데이터 조회가 집중되어 잠시 후 다시 이용해 주세요. 가점 계산은 그대로 쓸 수 있습니다.");
    } finally {
      setBusy(false);
    }
  }

  const visible = items.filter((it) => (filter === "all" ? true : regionGroup(it.region) === filter));

  return (
    <div className="space-y-4">
      <p className="rounded-2xl bg-[#fff7ea] p-4 text-[var(--muted)]">
        출처: 한국부동산원 주택청약정보 (공공데이터포털 OPEN API). 이 화면의 목록은 가공된 참고용이며, 접수·당첨은 청약홈 공고문이 최종입니다.
      </p>
      <div className="flex flex-wrap gap-2">
        <a className="touch rounded-2xl bg-[var(--ink)] px-4 py-2 font-bold text-white" href={OFFICIAL_LINKS.applyHomeApt} target="_blank" rel="noopener noreferrer">
          청약홈 APT 공고
        </a>
        <a className="touch rounded-2xl border border-[var(--line)] bg-white px-4 py-2 font-bold" href={OFFICIAL_LINKS.applyHomeRemndr} target="_blank" rel="noopener noreferrer">
          무순위·잔여세대
        </a>
        <a className="touch rounded-2xl border border-[var(--line)] bg-white px-4 py-2 font-bold" href={OFFICIAL_LINKS.dataSet} target="_blank" rel="noopener noreferrer">
          공공데이터 원문
        </a>
      </div>
      <div className="rounded-2xl border border-dashed border-[var(--line)] p-4">
        <p className="font-bold">선택: 내 인증키로 최근 공고 불러오기</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          키는 서버로 보내지 않고 이 브라우저에만 저장됩니다. 공공데이터포털에서 무료 발급받을 수 있습니다. 키가 없으면 위 청약홈 버튼만으로도 충분합니다.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            className="touch flex-1 rounded-2xl border border-[var(--line)] bg-white px-4"
            placeholder="일반 인증키 (선택)"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            className="touch rounded-2xl bg-[var(--navy)] px-5 font-bold text-white"
            onClick={() => load(false)}
            disabled={busy}
          >
            {busy ? "불러오는 중…" : "공고 불러오기"}
          </button>
        </div>
        {hasKey ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={`touch rounded-2xl px-4 ${!remainder ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white"}`}
              onClick={() => {
                setRemainder(false);
                load(false);
              }}
            >
              아파트 분양
            </button>
            <button
              type="button"
              className={`touch rounded-2xl px-4 ${remainder ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white"}`}
              onClick={() => {
                setRemainder(true);
                load(true);
              }}
            >
              무순위·잔여
            </button>
          </div>
        ) : null}
      </div>
      {error ? (
        <div className="rounded-2xl border border-[#ead2cf] bg-[#fff4f2] p-4">
          <p className="font-bold">현재 데이터 조회가 집중되어 있거나, 키가 없거나 유효하지 않습니다.</p>
          <p className="mt-1 text-[var(--muted)]">{error} 가점 계산 및 납입 시뮬레이터는 정상 이용 가능합니다.</p>
        </div>
      ) : null}
      {items.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`touch rounded-2xl px-4 ${filter === f.id ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white"}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <ul className="space-y-3">
            {visible.map((it) => {
              const st = receiptStatus(it.receiptStart, it.receiptEnd);
              const badge = st === "open" ? "접수중" : st === "upcoming" ? "접수예정" : st === "closed" ? "접수마감" : "일정확인";
              return (
                <li key={it.id} className="rounded-2xl border border-[var(--line)] bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#1b1914] px-3 py-1 text-sm font-bold text-white">{badge}</span>
                    {it.kind ? <span className="text-sm text-[var(--muted)]">{it.kind}</span> : null}
                  </div>
                  <h3 className="mt-2 text-xl font-extrabold">{it.name}</h3>
                  <p className="text-[var(--muted)]">
                    {it.region} {it.address}
                  </p>
                  <p className="mt-2 text-sm">
                    모집공고 {it.announceDate || "-"} · 접수 {it.receiptStart || "-"} ~ {it.receiptEnd || "-"}
                    {it.winnerDate ? ` · 당첨발표 ${it.winnerDate}` : ""}
                  </p>
                  {it.builder ? <p className="text-sm text-[var(--muted)]">시공 {it.builder}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a className="touch rounded-2xl bg-[var(--ink)] px-4 py-2 text-white" href={OFFICIAL_LINKS.applyHome} target="_blank" rel="noopener noreferrer">
                      청약홈에서 확인
                    </a>
                    {it.homepage ? (
                      <a className="touch rounded-2xl border border-[var(--line)] px-4 py-2" href={it.homepage} target="_blank" rel="noopener noreferrer">
                        단지 홈페이지
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted)]">본 카드는 공공데이터 참고 가공본이며 법적 효력이 없습니다.</p>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}
