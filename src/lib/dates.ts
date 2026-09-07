export function yearsBetween(fromIso: string, to = new Date()): number | null {
  if (!fromIso) return null;
  const from = new Date(fromIso);
  if (Number.isNaN(+from) || from > to) return null;
  let years = to.getFullYear() - from.getFullYear();
  const beforeBirthday =
    to.getMonth() < from.getMonth() || (to.getMonth() === from.getMonth() && to.getDate() < from.getDate());
  if (beforeBirthday) years -= 1;
  return Math.max(0, years + fractionYear(from, to, years));
}

function fractionYear(from: Date, to: Date, fullYears: number): number {
  const after = new Date(from);
  after.setFullYear(from.getFullYear() + fullYears);
  const next = new Date(after);
  next.setFullYear(after.getFullYear() + 1);
  const span = +next - +after;
  if (span <= 0) return 0;
  return Math.min(0.999, Math.max(0, (+to - +after) / span));
}

export function ageFromBirth(birthDate: string, to = new Date()): number | null {
  const y = yearsBetween(birthDate, to);
  return y === null ? null : Math.floor(y);
}

export function dateTurning30(birthDate: string): string | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (Number.isNaN(+b)) return null;
  b.setFullYear(b.getFullYear() + 30);
  return b.toISOString().slice(0, 10);
}

export function addYearsIso(iso: string, years: number): string {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}
