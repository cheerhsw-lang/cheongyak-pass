"use client";

import { useEffect, useMemo, useState } from "react";
import { BANKS } from "@/lib/banks";
import { ACCOUNT_OPTIONS, HOMELESS_OPTIONS, runCalculation } from "@/lib/engine";
import { manWon, won } from "@/lib/format";
import { clearAllLocal, loadProfile, loadUi, saveProfile, saveUi } from "@/lib/storage";
import { DISCLAIMER } from "@/lib/sources";
import { SCHEDULE_KEY, type AccountType, type FontScale, type ProfileInput, type RegionType } from "@/lib/types";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { NoticeBoard } from "./NoticeBoard";
import { ScorePanel } from "./ScorePanel";
import { Simulator } from "./Simulator";
import { ChoiceGroup, Section, Stepper } from "./UiKit";

interface LocalEvent {
  id: string;
  title: string;
  date: string;
}

export function HomeApp() {
  const [profile, setProfile] = useState<ProfileInput | null>(null);
  const [fontScale, setFontScale] = useState<FontScale>("large");
  const [welcome, setWelcome] = useState(false);
  const [schedules, setSchedules] = useState<LocalEvent[]>([]);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDate, setDraftDate] = useState("");

  useEffect(() => {
    const p = loadProfile();
    const ui = loadUi();
    setProfile(p);
    setFontScale(ui.fontScale);
    setWelcome(!ui.welcomed);
    document.documentElement.dataset.fs = ui.fontScale;
    try {
      const raw = localStorage.getItem(SCHEDULE_KEY);
      if (raw) setSchedules(JSON.parse(raw));
    } catch {
      setSchedules([]);
    }
  }, []);

  useEffect(() => {
    if (!profile) return;
    saveProfile(profile);
  }, [profile]);

  const result = useMemo(() => (profile ? runCalculation(profile) : null), [profile]);

  function patch(partial: Partial<ProfileInput>) {
    setProfile((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  function changeFont(s: FontScale) {
    setFontScale(s);
    document.documentElement.dataset.fs = s;
    saveUi({ fontScale: s, welcomed: true });
  }

  function closeWelcome() {
    setWelcome(false);
    saveUi({ fontScale, welcomed: true });
  }

  function addSchedule() {
    if (!draftTitle.trim() || !draftDate) return;
    const next = [...schedules, { id: crypto.randomUUID(), title: draftTitle.trim(), date: draftDate }];
    setSchedules(next);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(next));
    setDraftTitle("");
  }

  function removeSchedule(id: string) {
    const next = schedules.filter((s) => s.id !== id);
    setSchedules(next);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(next));
  }

  if (!profile || !result) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="text-xl font-bold">계산기를 준비하는 중입니다…</p>
      </div>
    );
  }

  const { scores, deposits, sim, special, strategy } = result;

  return (
    <>
      <Header fontScale={fontScale} onFontScale={changeFont} />
      {welcome ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <div className="card max-w-lg p-6">
            <p className="kicker">바로 시작</p>
            <h2 className="mt-1 text-3xl font-black">로그인 없이, 이 기기에서만 기억합니다</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--muted)]">
              <li>회원가입·주민번호·계좌번호는 받지 않습니다.</li>
              <li>나이·가족·납입액 등 입력값은 이 브라우저에만 저장되어, 다음에 다시 열어도 그대로입니다.</li>
              <li>정부나 청약홈 공식 앱이 아닌 민간 공익 참고 도구입니다.</li>
            </ul>
            <button type="button" className="touch mt-6 w-full rounded-2xl bg-[var(--ink)] text-lg font-bold text-white" onClick={closeWelcome}>
              계산 시작하기
            </button>
          </div>
        </div>
      ) : null}

      <main id="main" className="mx-auto max-w-6xl px-4 py-8">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="kicker">공공데이터 기반 민간 참고 도구</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">내 청약 가점, 지금 바로 확인</h1>
            <p className="mt-4 max-w-2xl text-[var(--muted)]">
              민영주택 일반공급 가점(84점), 지역별 예치금, 공공분양 월 납입 도달 기간을 큰 글씨와 큰 버튼으로 계산합니다. 광고 없고, 결과는 참고용입니다.
            </p>
          </div>
          <aside className="card p-5">
            <p className="text-sm font-bold text-[var(--brass)]">실시간 가점</p>
            <ScorePanel scores={scores} />
            <p className="mt-3 text-sm text-[var(--muted)]">{scores.homelessNote}</p>
          </aside>
        </section>

        <Section id="calc" kicker="1단계" title="나의 기본 청약 자격">
          <Stepper label="만 나이" hint="무주택기간은 원칙적으로 만 30세부터 기산합니다." value={profile.age} min={19} max={90} suffix="세" onChange={(age) => patch({ age })} />
          <ChoiceGroup
            label="혼인 여부"
            value={profile.married ? "yes" : "no"}
            options={[
              { value: "yes", label: "혼인", desc: "만 30세 이전 혼인이면 혼인신고일부터 무주택기간 기산" },
              { value: "no", label: "미혼", desc: "만 30세 미만이면 무주택 가점 0점" },
            ]}
            onChange={(v) => patch({ married: v === "yes" })}
          />
          <ChoiceGroup
            label="주택 보유"
            value={profile.hasHouse ? "yes" : "no"}
            options={[
              { value: "no", label: "무주택", desc: "세대원 전원 무주택 기준은 공고문 확인" },
              { value: "yes", label: "유주택", desc: "무주택기간 가점 0점" },
            ]}
            onChange={(v) => patch({ hasHouse: v === "yes" })}
          />
          <div>
            <label className="font-bold" htmlFor="homeless">
              무주택 기간
            </label>
            <select
              id="homeless"
              className="touch mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4"
              value={profile.homelessYears}
              onChange={(e) => patch({ homelessYears: Number(e.target.value) })}
            >
              {HOMELESS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Stepper
            label="부양가족 수 (본인 제외)"
            hint="주민등록등본 세대원. 직계존속은 3년 이상 계속 등재 시에만 인정되는 경우가 많습니다."
            value={profile.dependentsCount}
            min={0}
            max={8}
            suffix="명"
            onChange={(dependentsCount) => patch({ dependentsCount })}
          />
          <ChoiceGroup
            label="거주 지역 (예치금 기준)"
            hint="입주자모집공고일 현재 주민등록 주소지 기준입니다."
            value={profile.region}
            options={[
              { value: "SEOUL_BUSAN", label: "서울특별시 · 부산광역시", desc: "85㎡ 이하 300만 원" },
              { value: "METRO", label: "그 밖의 광역시", desc: "85㎡ 이하 250만 원" },
              { value: "OTHER", label: "그 외 시·군", desc: "85㎡ 이하 200만 원" },
            ]}
            onChange={(region) => patch({ region: region as RegionType })}
          />
        </Section>

        <Section kicker="2단계" title="청약통장 보유 현황">
          <div>
            <label className="font-bold" htmlFor="accountYears">
              통장 가입 기간
            </label>
            <p className="text-sm text-[var(--muted)]">은행·청약홈에 표시된 가입기간을 그대로 고르세요. 미성년 인정 한도는 은행 산정값이 우선입니다.</p>
            <select
              id="accountYears"
              className="touch mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4"
              value={profile.accountYears}
              onChange={(e) => patch({ accountYears: Number(e.target.value) })}
            >
              {ACCOUNT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold" htmlFor="spouseYears">
              배우자 통장 가입 기간 (선택)
            </label>
            <p className="text-sm text-[var(--muted)]">2024년 개정 취지를 반영한 참고 가산(최대 3점)입니다. 실제 합산은 청약 접수 시 확인하세요.</p>
            <select
              id="spouseYears"
              className="touch mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4"
              value={profile.spouseAccountYears}
              onChange={(e) => patch({ spouseAccountYears: Number(e.target.value) })}
            >
              <option value={0}>없음 / 합산 안 함</option>
              {ACCOUNT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Stepper
            label="현재 납입 인정총액"
            hint="만원 단위로 조절합니다."
            value={Math.round(profile.currentAmount / 10_000)}
            min={0}
            max={20000}
            step={10}
            suffix="만 원"
            onChange={(v) => patch({ currentAmount: v * 10_000 })}
          />
          <ChoiceGroup
            label="보유 통장 유형"
            value={profile.accountType}
            options={[
              { value: "comprehensive", label: "주택청약종합저축", desc: "민영·공공 모두 가능" },
              { value: "youthDream", label: "청년 주택드림 청약통장", desc: "만 19~34세 등 요건" },
              { value: "savings", label: "구형 청약저축", desc: "공공 전용 → 종합저축 전환 검토" },
              { value: "deposit", label: "구형 청약예금", desc: "민영 전용 → 전환 검토" },
              { value: "installment", label: "구형 청약부금", desc: "민영 전용 → 전환 검토" },
            ]}
            onChange={(accountType) => patch({ accountType: accountType as AccountType })}
          />
          {special.convertLegacy ? (
            <div className="rounded-2xl bg-[#fff4e5] p-4">
              <p className="font-bold">종합저축 전환을 검토해 보세요</p>
              <p className="text-[var(--muted)]">기존 가입기간·납입 실적을 이어 공공·민영 모두 청약할 수 있습니다. 반드시 기존 통장을 만든 같은 은행 영업점에서만 전환됩니다.</p>
            </div>
          ) : null}
          {special.youthDream ? (
            <div className="rounded-2xl bg-[#eef6f1] p-4">
              <p className="font-bold">청년 주택드림 청약통장 대상 연령대입니다</p>
              <p className="text-[var(--muted)]">소득·무주택 등 세부 요건과 우대금리는 취급 은행·최신 고시를 확인하세요. 본 안내는 자격 확정이 아닙니다.</p>
            </div>
          ) : null}
        </Section>

        <Section kicker="결과 1" title="민간분양 가점 및 예치금">
          <div className="rounded-3xl bg-[var(--ink)] p-6 text-[var(--paper)]">
            <p className="text-sm opacity-80">나의 청약 가점 (참고)</p>
            <p className="num mt-1 text-5xl font-black">
              {scores.total}
              <span className="ml-2 text-2xl font-bold opacity-70">/ 84점</span>
            </p>
            <p className="mt-3">
              무주택 {scores.homeless}점 + 부양가족 {scores.dependents}점 + 가입기간 {scores.account}점
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {deposits.map((d) => (
              <li key={d.label} className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
                <span>
                  {d.label}
                  <span className="block text-sm text-[var(--muted)]">{manWon(d.amount)}</span>
                </span>
                <strong className={d.met ? "text-[var(--pine)]" : "text-[var(--clay)]"}>{d.met ? "충족" : "부족"}</strong>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-[#fff7ea] p-4 font-semibold">{strategy}</p>
          <p className="text-sm text-[var(--muted)]">{DISCLAIMER}</p>
        </Section>

        <Section kicker="결과 2" title="공공분양 월 납입 시뮬레이터">
          <Stepper
            label="목표 인정액 (참고)"
            hint="기본값 2,100만 원은 수도권에서 자주 쓰는 가정값이며 공식 당첨선이 아닙니다."
            value={Math.round(profile.targetCutline / 10_000)}
            min={300}
            max={8000}
            step={50}
            suffix="만 원"
            onChange={(v) => patch({ targetCutline: v * 10_000 })}
          />
          <p className="text-sm text-[var(--muted)]">
            현재 {won(profile.currentAmount)} · 부족액 {won(sim.shortfall)}
          </p>
          <Simulator monthly={profile.monthlyDeposit} onMonthly={(monthlyDeposit) => patch({ monthlyDeposit })} sim={sim} current={profile.currentAmount} target={profile.targetCutline} />
        </Section>

        <Section kicker="특별공급" title="원터치 자격 체크 (참고)">
          <Stepper label="미혼 자녀 수" hint="다자녀 특별공급은 미혼 자녀 2명 이상으로 완화된 사례가 있습니다. 단지 공고마다 다릅니다." value={profile.childrenUnmarried} min={0} max={6} suffix="명" onChange={(childrenUnmarried) => patch({ childrenUnmarried })} />
          <ChoiceGroup
            label="입주자모집공고일 기준 2년 이내 출산·임신"
            value={profile.newbornWithin2y ? "yes" : "no"}
            options={[
              { value: "yes", label: "해당" },
              { value: "no", label: "해당 없음" },
            ]}
            onChange={(v) => patch({ newbornWithin2y: v === "yes" })}
          />
          <Stepper label="혼인 기간" value={profile.marriageYears} min={0} max={40} suffix="년" onChange={(marriageYears) => patch({ marriageYears })} />
          <ChoiceGroup
            label="세대원 전원 과거 주택 소유 이력 없음 (생애최초)"
            value={profile.firstHomeEver ? "yes" : "no"}
            options={[
              { value: "yes", label: "없음" },
              { value: "no", label: "있음" },
            ]}
            onChange={(v) => patch({ firstHomeEver: v === "yes" })}
          />
          <ChoiceGroup
            label="무주택 직계존속 3년 이상 부양 (노부모)"
            value={profile.parentsCared3y ? "yes" : "no"}
            options={[
              { value: "yes", label: "해당" },
              { value: "no", label: "해당 없음" },
            ]}
            onChange={(v) => patch({ parentsCared3y: v === "yes" })}
          />
          <ul className="grid gap-2 sm:grid-cols-2">
            <Flag ok={special.multiChild} label="다자녀 특별공급 후보" />
            <Flag ok={special.newborn} label="신생아 관련 공급 후보" />
            <Flag ok={special.newlywed} label="신혼부부 특별공급 후보" />
            <Flag ok={special.firstHome} label="생애최초 특별공급 후보" />
            <Flag ok={special.elderlyParents} label="노부모 부양 특별공급 후보" />
          </ul>
          <p className="text-sm text-[var(--muted)]">
            부부 중복 청약이 허용되는 단지도 있습니다. 중복 당첨 시 처리 기준은 해당 공고문을 따릅니다. 위 표시는 가능성 안내일 뿐 자격 확정이 아닙니다.
          </p>
        </Section>

        <Section id="notice" kicker="실시간" title="전국 분양 공고 안내">
          <NoticeBoard />
        </Section>

        <Section kicker="내 일정" title="관심 단지 D-Day (이 기기에만 저장)">
          <p className="text-[var(--muted)]">공고 접수일을 직접 적어두면 다음 방문 때도 남아 있습니다. 서버에는 올라가지 않습니다.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className="touch flex-1 rounded-2xl border border-[var(--line)] bg-white px-4" placeholder="단지명 또는 메모" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
            <input className="touch rounded-2xl border border-[var(--line)] bg-white px-4" type="date" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} />
            <button type="button" className="touch rounded-2xl bg-[var(--ink)] px-5 font-bold text-white" onClick={addSchedule}>
              저장
            </button>
          </div>
          <ul className="space-y-2">
            {schedules.length === 0 ? <li className="text-[var(--muted)]">아직 저장한 일정이 없습니다.</li> : null}
            {schedules.map((s) => {
              const days = Math.ceil((new Date(s.date).getTime() - Date.now()) / 86400000);
              const label = Number.isNaN(days) ? "" : days > 0 ? `D-${days}` : days === 0 ? "D-Day" : `${-days}일 지남`;
              return (
                <li key={s.id} className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
                  <span>
                    <strong>{s.title}</strong>
                    <span className="ml-2 text-[var(--muted)]">
                      {s.date} · {label}
                    </span>
                  </span>
                  <button type="button" className="text-[var(--clay)]" onClick={() => removeSchedule(s.id)}>
                    삭제
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section kicker="은행" title="청약통장 은행 바로가기">
          <p className="text-[var(--muted)]">전환·예치금 변경은 기존 가입 은행에서 처리됩니다. 새 창으로 각 은행 공식 사이트가 열립니다.</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {BANKS.map((b) => (
              <a key={b.name} className="touch rounded-2xl border border-[var(--line)] bg-white px-4 py-3 hover:border-[var(--ink)]" href={b.href} target="_blank" rel="noopener noreferrer">
                <strong className="block">{b.name}</strong>
                <span className="text-sm text-[var(--muted)]">{b.hint}</span>
              </a>
            ))}
          </div>
        </Section>

        <div className="mt-8 flex flex-wrap gap-3 no-print">
          <button
            type="button"
            className="touch rounded-2xl border border-[var(--line)] bg-white px-5 font-bold"
            onClick={() => window.print()}
          >
            결과 인쇄
          </button>
          <button
            type="button"
            className="touch rounded-2xl border border-[var(--clay)] px-5 font-bold text-[var(--clay)]"
            onClick={() => {
              if (confirm("이 기기에 저장된 계산 입력값을 모두 지울까요?")) {
                clearAllLocal();
                localStorage.removeItem(SCHEDULE_KEY);
                window.location.reload();
              }
            }}
          >
            내 기기 저장값 삭제
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`rounded-2xl px-4 py-3 font-bold ${ok ? "bg-[#e8f6ee] text-[var(--pine)]" : "bg-[#f3eee6] text-[var(--muted)]"}`}>
      {ok ? "해당 가능 · " : "해당 없음 · "}
      {label}
    </li>
  );
}
