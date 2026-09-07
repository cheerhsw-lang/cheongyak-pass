"use client";

import { useEffect, useState } from "react";
import { loadUi, saveUi } from "@/lib/storage";
import type { FontScale } from "@/lib/types";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function PageFrame({ children }: { children: React.ReactNode }) {
  const [fontScale, setFontScale] = useState<FontScale>("large");
  useEffect(() => {
    const ui = loadUi();
    setFontScale(ui.fontScale);
    document.documentElement.dataset.fs = ui.fontScale;
  }, []);
  return (
    <>
      <Header
        fontScale={fontScale}
        onFontScale={(s) => {
          setFontScale(s);
          document.documentElement.dataset.fs = s;
          saveUi({ fontScale: s, welcomed: true });
        }}
      />
      <main id="main" className="mx-auto max-w-3xl px-4 py-10">
        {children}
      </main>
      <Footer />
    </>
  );
}
