"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBar({ notifyOn, onNotify }: { notifyOn: boolean; onNotify: (v: boolean) => void }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setInstalled(standalone);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    setDeferred(null);
  }

  async function toggleNotify() {
    if (!notifyOn) {
      if (!("Notification" in window)) {
        alert("이 브라우저는 알림을 지원하지 않습니다.");
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
      onNotify(true);
      const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
      new Notification("청약패스", { body: "관심 단지 접수 전에 이 기기에서 알려 드립니다. 정부 공식 앱이 아닙니다.", icon: `${base}/icon.svg` });
    } else {
      onNotify(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2 no-print">
      {installed ? (
        <span className="touch rounded-2xl bg-[var(--tint-navy)] px-4 py-2 font-bold text-[var(--navy)]">홈 화면에 설치됨</span>
      ) : deferred ? (
        <button type="button" className="touch btn-fill rounded-2xl px-4 py-2 font-bold" onClick={install}>
          홈 화면에 설치
        </button>
      ) : (
        <span className="touch rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--ink)]">
          휴대폰 브라우저 메뉴에서 ‘홈 화면에 추가’를 누르면 앱처럼 열립니다.
        </span>
      )}
      <button type="button" className={`touch rounded-2xl px-4 py-2 font-bold ${notifyOn ? "btn-fill" : "btn-quiet"}`} onClick={toggleNotify}>
        {notifyOn ? "접수 알림 켜짐" : "접수 알림 켜기"}
      </button>
    </div>
  );
}

export function PwaBoot() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` || "/" }).catch(() => undefined);
  }, []);
  return null;
}
