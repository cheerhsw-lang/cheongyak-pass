import { DEFAULT_PROFILE, SCHEDULE_KEY, SPOUSE_KEY, STORAGE_KEY, VIEW_KEY, type FontScale, type ProfileInput, type TrackMode } from "./types";

export interface UiPrefs {
  fontScale: FontScale;
  welcomed: boolean;
  wizardDone: boolean;
  track: TrackMode;
  notifyOn: boolean;
}

export const DEFAULT_UI: UiPrefs = { fontScale: "large", welcomed: false, wizardDone: false, track: "private", notifyOn: false };

export interface LocalEvent {
  id: string;
  title: string;
  date: string;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

export function loadProfile(): ProfileInput {
  if (!canUseStorage()) return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: ProfileInput) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function loadSpouse(): ProfileInput | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(SPOUSE_KEY);
    if (!raw) return null;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function saveSpouse(profile: ProfileInput | null) {
  if (!canUseStorage()) return;
  if (!profile) localStorage.removeItem(SPOUSE_KEY);
  else localStorage.setItem(SPOUSE_KEY, JSON.stringify(profile));
}

export function loadUi(): UiPrefs {
  if (!canUseStorage()) return DEFAULT_UI;
  try {
    const raw = localStorage.getItem(VIEW_KEY);
    if (!raw) return DEFAULT_UI;
    return { ...DEFAULT_UI, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_UI;
  }
}

export function saveUi(partial: Partial<UiPrefs>) {
  if (!canUseStorage()) return;
  const next = { ...loadUi(), ...partial };
  localStorage.setItem(VIEW_KEY, JSON.stringify(next));
}

export function loadSchedules(): LocalEvent[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSchedules(items: LocalEvent[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(items));
}

export function exportBackup() {
  return JSON.stringify(
    {
      v: 2,
      profile: loadProfile(),
      spouse: loadSpouse(),
      ui: loadUi(),
      schedules: loadSchedules(),
    },
    null,
    2,
  );
}

export function importBackup(raw: string) {
  const data = JSON.parse(raw) as { profile?: ProfileInput; spouse?: ProfileInput | null; ui?: UiPrefs; schedules?: LocalEvent[] };
  if (data.profile) saveProfile({ ...DEFAULT_PROFILE, ...data.profile });
  if (data.spouse) saveSpouse({ ...DEFAULT_PROFILE, ...data.spouse });
  if (data.ui) saveUi({ ...DEFAULT_UI, ...data.ui });
  if (data.schedules) saveSchedules(data.schedules);
}

export function clearAllLocal() {
  if (!canUseStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(VIEW_KEY);
  localStorage.removeItem(SPOUSE_KEY);
  localStorage.removeItem(SCHEDULE_KEY);
}

export function nearestUpcoming(items: LocalEvent[], now = new Date()) {
  const upcoming = items
    .map((s) => ({ ...s, days: Math.ceil((new Date(s.date).getTime() - +now) / 86400000) }))
    .filter((s) => !Number.isNaN(s.days))
    .sort((a, b) => a.days - b.days);
  return upcoming.find((s) => s.days >= 0) ?? upcoming[upcoming.length - 1];
}
