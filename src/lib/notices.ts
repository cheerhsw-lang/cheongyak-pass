import { API_KEY_STORAGE } from "./types";

export interface AptNotice {
  id: string;
  name: string;
  region: string;
  address: string;
  builder: string;
  announceDate: string;
  receiptStart: string;
  receiptEnd: string;
  winnerDate: string;
  homepage: string;
  houseCount: string;
  kind: string;
}

interface RawNotice {
  HOUSE_MANAGE_NO?: string;
  PBLANC_NO?: string;
  HOUSE_NM?: string;
  SUBSCRPT_AREA_CODE_NM?: string;
  HSSPLY_ADRES?: string;
  CNSTRCT_ENTRPS_NM?: string;
  RCRIT_PBLANC_DE?: string;
  RCEPT_BGNDE?: string;
  RCEPT_ENDDE?: string;
  PZCOMPT_DE?: string | null;
  HMPG_ADRES?: string;
  TOT_SUPLY_HSHLDCO?: number | string;
  HOUSE_SECD_NM?: string;
  HOUSE_DTL_SECD_NM?: string;
}

const APT_URL = "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail";
const REM_URL = "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail";

function mapRow(row: RawNotice): AptNotice {
  return {
    id: `${row.HOUSE_MANAGE_NO ?? ""}-${row.PBLANC_NO ?? ""}-${row.HOUSE_NM ?? ""}`,
    name: row.HOUSE_NM ?? "단지명 미상",
    region: row.SUBSCRPT_AREA_CODE_NM ?? "",
    address: row.HSSPLY_ADRES ?? "",
    builder: row.CNSTRCT_ENTRPS_NM ?? "",
    announceDate: row.RCRIT_PBLANC_DE ?? "",
    receiptStart: row.RCEPT_BGNDE ?? "",
    receiptEnd: row.RCEPT_ENDDE ?? "",
    winnerDate: row.PZCOMPT_DE ?? "",
    homepage: row.HMPG_ADRES ?? "",
    houseCount: String(row.TOT_SUPLY_HSHLDCO ?? ""),
    kind: row.HOUSE_DTL_SECD_NM || row.HOUSE_SECD_NM || "APT",
  };
}

function recentDate(days = 60) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function loadOdcloudKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_STORAGE) ?? "";
}

export function saveOdcloudKey(key: string) {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (!trimmed) localStorage.removeItem(API_KEY_STORAGE);
  else localStorage.setItem(API_KEY_STORAGE, trimmed);
}

export async function fetchNotices(serviceKey: string, remainder = false): Promise<AptNotice[]> {
  const endpoint = remainder ? REM_URL : APT_URL;
  const since = recentDate(90);
  const url = new URL(endpoint);
  url.searchParams.set("page", "1");
  url.searchParams.set("perPage", "40");
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("cond[RCRIT_PBLANC_DE::GTE]", since);

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error("공고 조회에 실패했습니다.");
  }
  const json = (await res.json()) as { data?: RawNotice[]; code?: number; msg?: string };
  if (json.code && json.code < 0) {
    throw new Error(json.msg || "인증키가 유효하지 않습니다.");
  }
  return (json.data ?? []).map(mapRow);
}

export function regionGroup(region: string): "seoul" | "metro" | "etc" {
  if (region.includes("서울")) return "seoul";
  if (region.includes("경기") || region.includes("인천")) return "metro";
  return "etc";
}

export function matchesMyRegion(region: string, prefer: "seoul" | "metro" | "etc" | "all"): boolean {
  if (prefer === "all") return true;
  return regionGroup(region) === prefer;
}

export function noticeHint(opts: { firstRankLikely: boolean; danghaeLikely: boolean; deposit85: boolean; remainder: boolean }): string {
  if (opts.remainder) return "무순위·잔여는 통장 요건이 단지마다 다릅니다. 공고문을 확인하세요.";
  if (!opts.deposit85) return "예치금이 85㎡ 기준에 못 미치면 해당 면적 민영 1순위가 어려울 수 있습니다.";
  if (!opts.firstRankLikely) return "1순위 참고 요건이 부족하면 이 공고도 2순위·특별공급·추첨만 해당될 수 있습니다.";
  if (!opts.danghaeLikely) return "당해 거주가 짧으면 기타 지역 물량 위주로 보세요.";
  return "내 예치·1순위 참고 요건과 맞는 편입니다. 그래도 공고문이 최종입니다.";
}

export function receiptStatus(start: string, end: string, now = new Date()): "upcoming" | "open" | "closed" | "unknown" {
  if (!start || !end) return "unknown";
  const s = new Date(start);
  const e = new Date(end);
  e.setHours(23, 59, 59, 999);
  if (Number.isNaN(+s) || Number.isNaN(+e)) return "unknown";
  if (now < s) return "upcoming";
  if (now > e) return "closed";
  return "open";
}
