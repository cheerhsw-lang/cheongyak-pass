export function won(n: number): string {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

export function manWon(n: number): string {
  return `${Math.round(n / 10_000).toLocaleString("ko-KR")}만 원`;
}

export function scoreTone(total: number): "low" | "mid" | "good" | "high" {
  if (total < 40) return "low";
  if (total < 55) return "mid";
  if (total < 70) return "good";
  return "high";
}
