import { PwaBoot } from "@/components/InstallBar";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "청약패스 | 주택청약 성공 계산기",
  description:
    "로그인 없이 바로 쓰는 민간 주택청약 참고 계산기. 민영 가점 84점, 예치금, 공공분양 월 납입 시뮬레이션. 입력값은 이 기기에만 저장됩니다. 정부·한국부동산원 공식 서비스가 아닙니다.",
  applicationName: "청약패스",
  keywords: ["주택청약", "청약가점", "청약계산기", "공공분양", "청약패스"],
  authors: [{ name: "청약패스" }],
  openGraph: {
    title: "청약패스 | 주택청약 성공 계산기",
    description: "민간 참고 계산기 · 로그인 없음 · 내 기기에만 저장",
    locale: "ko_KR",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: { icon: `${BASE}/icon.svg` },
  manifest: `${BASE}/manifest.webmanifest`,
};

export const viewport: Viewport = {
  themeColor: "#1b1914",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-fs="large">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="manifest" href={`${BASE}/manifest.webmanifest`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="청약패스" />
        <link rel="apple-touch-icon" href={`${BASE}/icon.svg`} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          본문으로 건너뛰기
        </a>
        {children}
        <PwaBoot />
      </body>
    </html>
  );
}
