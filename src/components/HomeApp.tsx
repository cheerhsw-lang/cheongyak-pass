"use client";

import { BANKS } from "@/lib/banks";
import { ACCOUNT_OPTIONS, HOMELESS_OPTIONS, runCalculation } from "@/lib/engine";
import { manWon, won } from "@/lib/format";
import { noticeHint } from "@/lib/notices";
import { HEAT_OPTIONS, preferredNoticeFilter } from "@/lib/rank";
import { DISCLAIMER, OFFICIAL_LINKS } from "@/lib/sources";
import {
  clearAllLocal,
  exportBackup,
  importBackup,
  loadProfile,
  loadSchedules,
  loadSpouse,
  loadUi,
  nearestUpcoming,
  saveProfile,
  saveSchedules,
  saveSpouse,
  saveUi,
  type LocalEvent,
} from "@/lib/storage";
import {
  DEFAULT_PROFILE,
  type AccountType,
  type FontScale,
  type HeatZone,
  type ProfileInput,
  type RegionType,
  type TrackMode,
} from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { CommandCenter, RankChecks, SensitivityCard, TrackTabs } from "./Campaign";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { InstallBar } from "./InstallBar";
import { NoticeBoard } from "./NoticeBoard";
import { Simulator } from "./Simulator";
import { ChoiceGroup, Section, Stepper } from "./UiKit";

export function HomeApp() {
  const [profile, setProfile] = useState<ProfileInput | null>(null);
  const [spouse, setSpouse] = useState<ProfileInput | null>(null);
  const [editSpouse, setEditSpouse] = useState(false);
  const [fontScale, setFontScale] = useState<FontScale>("large");
  const [welcome, setWelcome] = useState(false);
  const [wizard, setWizard] = useState(0);
  const [track, setTrack] = useState<TrackMode>("private");
  const [notifyOn, setNotifyOn] = useState(false);
  const [schedules, setSchedules] = useState<LocalEvent[]>([]);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDate, setDraftDate] = useState("");

  useEffect(() => {
    const p = loadProfile();
    const ui = loadUi();
    const s = loadSpouse();
    const ev = loadSchedules();
    setProfile(p);
    setSpouse(s);
    setEditSpouse(Boolean(s));
    setFontScale(ui.fontScale);
    setTrack(ui.track);
    setNotifyOn(ui.notifyOn);
    setWelcome(!ui.welcomed);
    setWizard(ui.wizardDone ? 99 : 1);
    setSchedules(ev);
    document.documentElement.dataset.fs = ui.fontScale;
  }, []);

  useEffect(() => {
    if (!profile) return;
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveSpouse(editSpouse ? spouse : null);
  }, [spouse, editSpouse]);

  const soon = useMemo(() => nearestUpcoming(schedules), [schedules]);
  const result = useMemo(
    () => (profile ? runCalculation(profile, new Date(), soon) : null),
    [profile, soon],
  );
  const spouseResult = useMemo(() => (editSpouse && spouse ? runCalculation(spouse) : null), [editSpouse, spouse]);

  useEffect(() => {
    if (!notifyOn || !soon || soon.days < 0 || soon.days > 3) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const key = `cheongyak-pass:notified:${soon.id}:${soon.date}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    new Notification("청약패스 (민간 참고)", {
      body: `${soon.title} 접수 ${soon.days === 0 ? "오늘" : `D-${soon.days}`}. 청약홈 공고문을 확인하세요.`,
      icon: "./icon.svg",
    });
  }, [notifyOn, soon]);

  function patch(partial: Partial<ProfileInput>) {
    setProfile((prev) => (prev ? { ...prev, ...partial } : prev));
  }
  function patchSpouse(partial: Partial<ProfileInput>) {
    setSpouse((prev) => ({ ...(prev ?? { ...DEFAULT_PROFILE, married: true }), ...partial }));
  }
  function persistUi(partial: Partial<ReturnType<typeof loadUi>>) {
    const ui = { ...loadUi(), fontScale, welcomed: true, wizardDone: wizard >= 99, track, notifyOn, ...partial };
    saveUi(ui);
  }
  function changeFont(s: FontScale) {
    setFontScale(s);
    document.documentElement.dataset.fs = s;
    persistUi({ fontScale: s });
  }
  function changeTrack(v: TrackMode) {
    setTrack(v);
    persistUi({ track: v });
  }

  function finishWelcome() {
    setWelcome(false);
    persistUi({ welcomed: true });
  }
  function finishWizard() {
    setWizard(99);
    persistUi({ wizardDone: true, welcomed: true });
    setWelcome(false);
  }

  function addSchedule() {
    if (!draftTitle.trim() || !draftDate) return;
    const next = [...schedules, { id: crypto.randomUUID(), title: draftTitle.trim(), date: draftDate }];
    setSchedules(next);
    saveSchedules(next);
    setDraftTitle("");
  }
  function removeSchedule(id: string) {
    const next = schedules.filter((s) => s.id !== id);
    setSchedules(next);
    saveSchedules(next);
  }

  function downloadBackup() {
    const blob = new Blob([exportBackup()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cheongyak-pass-backup.json";
    a.click();
  }

  if (!profile || !result) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="text-xl font-bold">계산기를 준비하는 중입니다…</p>
      </div>
    );
  }

  const { scores, deposits, sim, special, rank, strategy, nextActions, sensitivity } = result;

  return (
    <>
      <Header fontScale={fontScale} onFontScale={changeFont} />
      {welcome ? (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[color:rgb(27_63_110_/_0.5)] px-3 py-3">
          <div className="card mx-auto w-full max-w-lg p-5">
            <p className="kicker">바로 시작</p>
            <h2 className="mt-1 text-3xl font-black">로그인 없이, 이 기기에서만 기억합니다</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--muted)]">
              <li>회원가입·주민번호·계좌번호는 받지 않습니다.</li>
              <li>입력값은 이 브라우저에만 저장되어 다음에 다시 열어도 그대로입니다.</li>
              <li>홈 화면에 설치하면 앱처럼 쓸 수 있습니다. 정부·청약홈 공식 앱이 아닙니다.</li>
            </ul>
            <button type="button" className="touch btn-fill mt-6 w-full rounded-2xl text-lg font-bold" onClick={finishWelcome}>
              세 가지만 먼저 답하기
            </button>
          </div>
        </div>
      ) : null}
      {!welcome && wizard < 99 ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-[color:rgb(27_63_110_/_0.55)]">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
            <div className="card mx-auto w-full max-w-lg p-5">
              <p className="kicker">빠른 설정 {wizard}/3</p>
              {wizard === 1 ? (
                <ChoiceGroup
                  label="지금 주택이 있나요?"
                  value={profile.smallCheapOnly ? "cheap" : profile.hasHouse ? "yes" : "no"}
                  options={[
                    { value: "no", label: "무주택", desc: "세대 무주택은 공고문 기준" },
                    { value: "cheap", label: "소형·저가 1호만", desc: "무주택 기간 인정 예외 참고" },
                    { value: "yes", label: "그 외 유주택", desc: "무주택 가점 0점" },
                  ]}
                  onChange={(v) => {
                    if (v === "cheap") patch({ hasHouse: true, smallCheapOnly: true });
                    else if (v === "yes") patch({ hasHouse: true, smallCheapOnly: false });
                    else patch({ hasHouse: false, smallCheapOnly: false });
                  }}
                />
              ) : null}
              {wizard === 2 ? (
                <>
                  <Stepper label="만 나이" value={profile.age} min={19} max={90} suffix="세" onChange={(age) => patch({ age })} />
                  <div className="mt-4">
                    <ChoiceGroup
                      label="혼인"
                      value={profile.married ? "yes" : "no"}
                      options={[
                        { value: "yes", label: "혼인" },
                        { value: "no", label: "미혼" },
                      ]}
                      onChange={(v) => patch({ married: v === "yes" })}
                    />
                  </div>
                </>
              ) : null}
              {wizard === 3 ? (
                <>
                  <label className="font-bold" htmlFor="wizAcc">
                    청약통장 가입기간
                  </label>
                  <select id="wizAcc" className="touch mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4" value={profile.accountYears} onChange={(e) => patch({ accountYears: Number(e.target.value) })}>
                    {ACCOUNT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-4">
                    <ChoiceGroup label="청약하려는 지역 규제 (참고)" value={profile.heatZone} options={HEAT_OPTIONS} onChange={(heatZone) => patch({ heatZone: heatZone as HeatZone })} />
                  </div>
                </>
              ) : null}
            </div>
          </div>
          <div className="shrink-0 border-t border-[var(--line)] bg-[var(--card)] px-3 py-3">
            <div className="mx-auto flex max-w-lg gap-2">
              {wizard > 1 ? (
                <button type="button" className="touch btn-quiet flex-1 rounded-2xl font-bold" onClick={() => setWizard((w) => w - 1)}>
                  이전
                </button>
              ) : null}
              <button
                type="button"
                className="touch btn-fill flex-1 rounded-2xl font-bold"
                onClick={() => (wizard >= 3 ? finishWizard() : setWizard((w) => w + 1))}
              >
                {wizard >= 3 ? "작전실 열기" : "다음"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <main id="main" className="mx-auto max-w-6xl px-4 py-8">
        <p className="kicker">공공데이터 기반 민간 참고 도구</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">오늘 청약, 무엇을 하면 되나</h1>
        <p className="mt-3 max-w-3xl text-[var(--muted)]">
          민영 1순위와 가점, 공공 저축 경쟁을 나눠 보여 줍니다. 광고 없고 로그인 없습니다. 결과는 참고용이며 청약홈 공고문이 최종입니다.
        </p>
        <InstallBar
          notifyOn={notifyOn}
          onNotify={(v) => {
            setNotifyOn(v);
            persistUi({ notifyOn: v, welcomed: true });
          }}
        />

        <div className="mt-6">
          <TrackTabs value={track} onChange={changeTrack} />
        </div>
        <div className="mt-4">
          <CommandCenter track={track} scores={scores} rank={rank} publicShort={sim.shortfall === 0 ? "이미 도달" : won(sim.shortfall)} actions={nextActions} />
        </div>

        <Section id="calc" kicker="민영" title="1·2순위와 가점">
          <ChoiceGroup label="규제 지역 (공고문의 해당 지역)" hint="투기과열·청약과열이면 가입 2년·납입 24회가 일반적입니다. 단지마다 다릅니다." value={profile.heatZone} options={HEAT_OPTIONS} onChange={(heatZone) => patch({ heatZone: heatZone as HeatZone })} />
          <Stepper label="납입 인정 횟수" hint="은행·청약홈 조회값을 넣으세요." value={profile.paymentCount} min={0} max={240} suffix="회" onChange={(paymentCount) => patch({ paymentCount })} />
          <Stepper label="해당 주택건설지역 거주기간" hint="당해 우선 공급 참고. 공고문이 최종입니다." value={profile.residenceYears} min={0} max={20} step={0.5} suffix="년" onChange={(residenceYears) => patch({ residenceYears })} />
          <RankChecks rank={rank} />
          <Stepper label="만 나이" hint="생년월일을 넣으면 자동으로 바뀝니다." value={profile.age} min={19} max={90} suffix="세" onChange={(age) => patch({ age, birthDate: "" })} />
          <label className="font-bold" htmlFor="birth">
            생년월일 (선택)
          </label>
          <input id="birth" type="date" className="touch w-full rounded-2xl border border-[var(--line)] bg-white px-4" value={profile.birthDate} onChange={(e) => patch({ birthDate: e.target.value })} />
          <ChoiceGroup
            label="혼인"
            value={profile.married ? "yes" : "no"}
            options={[
              { value: "yes", label: "혼인", desc: "만 30세 이전 혼인이면 혼인신고일부터 무주택 기산" },
              { value: "no", label: "미혼", desc: "만 30세 미만이면 무주택 가점 0점" },
            ]}
            onChange={(v) => patch({ married: v === "yes" })}
          />
          <label className="font-bold" htmlFor="wed">
            혼인신고일 (선택)
          </label>
          <input id="wed" type="date" className="touch w-full rounded-2xl border border-[var(--line)] bg-white px-4" value={profile.marriageDate} onChange={(e) => patch({ marriageDate: e.target.value })} />
          <ChoiceGroup
            label="주택 보유"
            value={profile.smallCheapOnly ? "cheap" : profile.hasHouse ? "yes" : "no"}
            options={[
              { value: "no", label: "무주택" },
              { value: "cheap", label: "소형·저가 1호만", desc: "전용 60㎡ 이하·공시가 요건은 공고문" },
              { value: "yes", label: "유주택" },
            ]}
            onChange={(v) => {
              if (v === "cheap") patch({ hasHouse: true, smallCheapOnly: true });
              else if (v === "yes") patch({ hasHouse: true, smallCheapOnly: false });
              else patch({ hasHouse: false, smallCheapOnly: false });
            }}
          />
          <div>
            <label className="font-bold" htmlFor="homeless">
              무주택 기간 (날짜가 없으면 이 값)
            </label>
            <select id="homeless" className="touch mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4" value={Math.min(15, Math.floor(profile.homelessYears))} onChange={(e) => patch({ homelessYears: Number(e.target.value), birthDate: "" })}>
              {HOMELESS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <ChoiceGroup label="거주 지역 (예치금)" value={profile.region} options={[
            { value: "SEOUL_BUSAN", label: "서울특별시 · 부산광역시", desc: "85㎡ 300만 원" },
            { value: "METRO", label: "그 밖의 광역시", desc: "85㎡ 250만 원" },
            { value: "OTHER", label: "그 외 시·군", desc: "85㎡ 200만 원" },
          ]} onChange={(region) => patch({ region: region as RegionType })} />
        </Section>

        <Section kicker="가족" title="부양가족 구성 (가점 35점)">
          <ChoiceGroup
            label="구성원으로 계산"
            value={profile.useFamilyWizard ? "yes" : "no"}
            options={[
              { value: "no", label: "숫자만 입력", desc: "이미 아는 부양가족 수" },
              { value: "yes", label: "가족 구성 질문", desc: "배우자·자녀·부모를 나눠 계산" },
            ]}
            onChange={(v) => patch({ useFamilyWizard: v === "yes" })}
          />
          {profile.useFamilyWizard ? (
            <>
              <ChoiceGroup label="세대주" value={profile.householdHead ? "yes" : "no"} options={[{ value: "yes", label: "본인이 세대주" }, { value: "no", label: "아님" }]} onChange={(v) => patch({ householdHead: v === "yes" })} />
              <Stepper label="만 30세 미만 미혼 자녀 (등본)" value={profile.childrenUnder30} min={0} max={6} suffix="명" onChange={(childrenUnder30) => patch({ childrenUnder30 })} />
              <Stepper label="만 30세 이상 미혼 자녀 · 1년 이상 등재" hint="1년 미만이면 가점에 넣지 마세요." value={profile.childrenOver30With1y} min={0} max={4} suffix="명" onChange={(childrenOver30With1y) => patch({ childrenOver30With1y })} />
              <ChoiceGroup label="무주택 직계존속 3년 부양" value={profile.parentsCared3y ? "yes" : "no"} options={[{ value: "yes", label: "해당" }, { value: "no", label: "해당 없음" }]} onChange={(v) => patch({ parentsCared3y: v === "yes" })} />
              {profile.parentsCared3y ? <Stepper label="인정 직계존속 수" value={profile.parentsCount} min={1} max={4} suffix="명" onChange={(parentsCount) => patch({ parentsCount })} /> : null}
              <p className="font-bold">계산된 부양가족 {scores.dependentsUsed}명 → {scores.dependents}점</p>
            </>
          ) : (
            <Stepper label="부양가족 수 (본인 제외)" value={profile.dependentsCount} min={0} max={8} suffix="명" onChange={(dependentsCount) => patch({ dependentsCount })} />
          )}
          <SensitivityCard s={sensitivity} />
        </Section>

        <Section kicker="통장" title="청약통장">
          <label className="font-bold" htmlFor="accOpen">
            최초 가입일 (선택)
          </label>
          <input id="accOpen" type="date" className="touch w-full rounded-2xl border border-[var(--line)] bg-white px-4" value={profile.accountOpenDate} onChange={(e) => patch({ accountOpenDate: e.target.value })} />
          <select className="touch w-full rounded-2xl border border-[var(--line)] bg-white px-4" value={profile.accountYears} onChange={(e) => patch({ accountYears: Number(e.target.value), accountOpenDate: "" })}>
            {ACCOUNT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select className="touch w-full rounded-2xl border border-[var(--line)] bg-white px-4" value={profile.spouseAccountYears} onChange={(e) => patch({ spouseAccountYears: Number(e.target.value) })}>
            <option value={0}>배우자 통장 합산 안 함</option>
            {ACCOUNT_OPTIONS.map((o) => (
              <option key={`s-${o.value}`} value={o.value}>
                배우자 {o.label}
              </option>
            ))}
          </select>
          <Stepper label="현재 납입 인정총액" value={Math.round(profile.currentAmount / 10_000)} min={0} max={20000} step={10} suffix="만 원" onChange={(v) => patch({ currentAmount: v * 10_000 })} />
          <ChoiceGroup label="통장 유형" value={profile.accountType} options={[
            { value: "comprehensive", label: "주택청약종합저축" },
            { value: "youthDream", label: "청년 주택드림" },
            { value: "savings", label: "구형 청약저축" },
            { value: "deposit", label: "구형 청약예금" },
            { value: "installment", label: "구형 청약부금" },
          ]} onChange={(accountType) => patch({ accountType: accountType as AccountType })} />
          {special.convertLegacy ? <p className="rounded-2xl bg-[#fff4e5] p-4 font-bold">같은 은행 영업점에서 종합저축 전환을 상담하세요. 타행은 안 됩니다.</p> : null}
        </Section>

        {track === "private" ? (
          <Section kicker="결과 · 민영" title="가점과 예치">
            <div className="rounded-3xl bg-[var(--navy)] p-6 text-[var(--ivory)]">
              <p className="text-sm opacity-80">민영 가점 (참고) · {rank.firstRankLikely ? "1순위 가능 참고" : "1순위 미충족 가능"}</p>
              <p className="num mt-1 text-5xl font-black">
                {scores.total}
                <span className="ml-2 text-2xl font-bold opacity-70">/ 84점</span>
              </p>
              <p className="mt-3">
                무주택 {scores.homeless}점 + 부양 {scores.dependents}점 + 가입 {scores.account}점
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
            <p className="rounded-2xl bg-[var(--tint)] p-4 font-semibold">{strategy}</p>
            <p className="text-sm text-[var(--muted)]">{DISCLAIMER}</p>
          </Section>
        ) : (
          <Section kicker="결과 · 공공" title="월 납입 시뮬레이터">
            <p className="text-[var(--muted)]">공공·국민주택 일반공급(전용 85㎡ 이하)은 가점이 아니라 인정 납입액 누적 순인 경우가 많습니다. 아래 목표액은 가정값입니다.</p>
            <Stepper label="목표 인정액 (참고)" value={Math.round(profile.targetCutline / 10_000)} min={300} max={8000} step={50} suffix="만 원" onChange={(v) => patch({ targetCutline: v * 10_000 })} />
            <p className="text-sm text-[var(--muted)]">
              현재 {won(profile.currentAmount)} · 부족액 {won(sim.shortfall)}
            </p>
            <Simulator monthly={profile.monthlyDeposit} onMonthly={(monthlyDeposit) => patch({ monthlyDeposit })} sim={sim} current={profile.currentAmount} target={profile.targetCutline} />
          </Section>
        )}

        <Section kicker="비교" title="본인 · 배우자 누가 신청하나">
          <ChoiceGroup
            label="배우자 프로필"
            value={editSpouse ? "yes" : "no"}
            options={[
              { value: "no", label: "본인만" },
              { value: "yes", label: "배우자도 이 기기에 저장", desc: "서버로 보내지 않습니다" },
            ]}
            onChange={(v) => {
              setEditSpouse(v === "yes");
              if (v === "yes" && !spouse) setSpouse({ ...DEFAULT_PROFILE, married: true });
            }}
          />
          {editSpouse && spouse ? (
            <>
              <Stepper label="배우자 만 나이" value={spouse.age} min={19} max={90} suffix="세" onChange={(age) => patchSpouse({ age })} />
              <Stepper label="배우자 부양가족 수" value={spouse.dependentsCount} min={0} max={8} suffix="명" onChange={(dependentsCount) => patchSpouse({ dependentsCount, useFamilyWizard: false })} />
              <select className="touch w-full rounded-2xl border border-[var(--line)] bg-white px-4" value={spouse.accountYears} onChange={(e) => patchSpouse({ accountYears: Number(e.target.value) })}>
                {ACCOUNT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    배우자 통장 {o.label}
                  </option>
                ))}
              </select>
              <select className="touch w-full rounded-2xl border border-[var(--line)] bg-white px-4" value={Math.min(15, Math.floor(spouse.homelessYears))} onChange={(e) => patchSpouse({ homelessYears: Number(e.target.value) })}>
                {HOMELESS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    배우자 무주택 {o.label}
                  </option>
                ))}
              </select>
              {spouseResult ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <p className="rounded-2xl bg-[var(--navy)] p-4 text-[var(--ivory)]">
                    본인 <strong className="num text-3xl">{scores.total}</strong>점
                    <span className="block text-sm opacity-80">{rank.firstRankLikely ? "1순위 참고 가능" : "1순위 참고 부족"}</span>
                  </p>
                  <p className="rounded-2xl border border-[var(--line)] bg-white p-4">
                    배우자 <strong className="num text-3xl">{spouseResult.scores.total}</strong>점
                    <span className="block text-sm text-[var(--muted)]">{spouseResult.rank.firstRankLikely ? "1순위 참고 가능" : "1순위 참고 부족"}</span>
                  </p>
                  <p className="sm:col-span-2 font-semibold">
                    {spouseResult.scores.total === scores.total
                      ? "가점이 같습니다. 중복 청약 허용 여부는 공고문에서 확인하세요."
                      : spouseResult.scores.total > scores.total
                        ? `배우자가 ${spouseResult.scores.total - scores.total}점 높습니다. 누가 접수할지는 공고문의 중복 청약 규칙을 보세요.`
                        : `본인이 ${scores.total - spouseResult.scores.total}점 높습니다. 중복 청약 규칙은 공고문 기준입니다.`}
                  </p>
                </div>
              ) : null}
            </>
          ) : null}
        </Section>

        <Section kicker="특별공급" title="원터치 자격 체크">
          <Stepper label="미혼 자녀 수" value={profile.useFamilyWizard ? profile.childrenUnder30 + profile.childrenOver30With1y : profile.childrenUnmarried} min={0} max={6} suffix="명" onChange={(n) => patch(profile.useFamilyWizard ? { childrenUnder30: n, childrenOver30With1y: 0 } : { childrenUnmarried: n })} />
          <ChoiceGroup label="2년 이내 출산·임신" value={profile.newbornWithin2y ? "yes" : "no"} options={[{ value: "yes", label: "해당" }, { value: "no", label: "해당 없음" }]} onChange={(v) => patch({ newbornWithin2y: v === "yes" })} />
          <Stepper label="혼인 기간" value={profile.marriageYears} min={0} max={40} suffix="년" onChange={(marriageYears) => patch({ marriageYears, marriageDate: "" })} />
          <ChoiceGroup label="생애최초 (세대 주택 이력 없음)" value={profile.firstHomeEver ? "yes" : "no"} options={[{ value: "yes", label: "없음" }, { value: "no", label: "있음" }]} onChange={(v) => patch({ firstHomeEver: v === "yes" })} />
          <ul className="grid gap-2 sm:grid-cols-2">
            <Flag ok={special.multiChild} label="다자녀 후보" />
            <Flag ok={special.newborn} label="신생아 관련 후보" />
            <Flag ok={special.newlywed} label="신혼부부 후보" />
            <Flag ok={special.firstHome} label="생애최초 후보" />
            <Flag ok={special.elderlyParents} label="노부모 부양 후보" />
          </ul>
        </Section>

        <Section id="notice" kicker="공고" title="내 자격에 맞춰 보기">
          <NoticeBoard
            prefer={preferredNoticeFilter(profile.region)}
            hint={noticeHint({ firstRankLikely: rank.firstRankLikely, danghaeLikely: rank.danghaeLikely, deposit85: deposits[0].met, remainder: false })}
            onSaveSchedule={(title, date) => {
              const next = [...schedules, { id: crypto.randomUUID(), title, date }];
              setSchedules(next);
              saveSchedules(next);
            }}
          />
        </Section>

        <Section kicker="일정" title="관심 단지 D-Day">
          <p className="text-[var(--muted)]">접수일을 적어두면 다시 들어와도 남습니다. 알림은 이 기기에서만 울립니다.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className="touch flex-1 rounded-2xl border border-[var(--line)] bg-white px-4" placeholder="단지명" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
            <input className="touch rounded-2xl border border-[var(--line)] bg-white px-4" type="date" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} />
            <button type="button" className="touch btn-fill rounded-2xl px-5 font-bold" onClick={addSchedule}>
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
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {BANKS.map((b) => (
              <a key={b.name} className="touch rounded-2xl border border-[var(--line)] bg-white px-4 py-3" href={b.href} target="_blank" rel="noopener noreferrer">
                <strong className="block">{b.name}</strong>
                <span className="text-sm text-[var(--muted)]">{b.hint}</span>
              </a>
            ))}
          </div>
          <a className="inline-block font-bold underline" href={OFFICIAL_LINKS.applyHome} target="_blank" rel="noopener noreferrer">
            청약홈 공식 조회
          </a>
        </Section>

        <div className="mt-8 flex flex-wrap gap-3 no-print">
          <button type="button" className="touch rounded-2xl border border-[var(--line)] bg-white px-5 font-bold" onClick={() => window.print()}>
            결과 인쇄
          </button>
          <button type="button" className="touch rounded-2xl border border-[var(--line)] bg-white px-5 font-bold" onClick={downloadBackup}>
            내 설정 파일로 저장
          </button>
          <label className="touch rounded-2xl border border-[var(--line)] bg-white px-5 font-bold">
            설정 불러오기
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  importBackup(await file.text());
                  window.location.reload();
                } catch {
                  alert("올바른 백업 파일이 아닙니다.");
                }
              }}
            />
          </label>
          <button
            type="button"
            className="touch rounded-2xl border border-[var(--clay)] px-5 font-bold text-[var(--clay)]"
            onClick={() => {
              if (confirm("이 기기에 저장된 계산 입력값을 모두 지울까요?")) {
                clearAllLocal();
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
    <li className={`rounded-2xl px-4 py-3 font-bold ${ok ? "bg-[var(--tint-navy)] text-[var(--navy)]" : "bg-[var(--tint)] text-[var(--muted)]"}`}>
      {ok ? "해당 가능 · " : "해당 없음 · "}
      {label}
    </li>
  );
}
