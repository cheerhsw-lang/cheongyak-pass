import { DEFAULT_PROFILE, STORAGE_KEY, VIEW_KEY, type FontScale, type ProfileInput } from "./types";

export interface UiPrefs {
  fontScale: FontScale;
  welcomed: boolean;
}

export const DEFAULT_UI: UiPrefs = { fontScale: "large", welcomed: false };

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

export function saveUi(ui: UiPrefs) {
  if (!canUseStorage()) return;
  localStorage.setItem(VIEW_KEY, JSON.stringify(ui));
}

export function clearAllLocal() {
  if (!canUseStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(VIEW_KEY);
}
