import type { ProfileInput } from "./types";

/** 본인 제외 부양가족 수. 마법사를 켜면 구성원 질문으로 계산합니다. */
export function familyDependentCount(input: ProfileInput): number {
  if (!input.useFamilyWizard) return Math.max(0, Math.floor(input.dependentsCount));
  let n = 0;
  if (input.married) n += 1;
  n += Math.max(0, Math.floor(input.childrenUnder30));
  n += Math.max(0, Math.floor(input.childrenOver30With1y));
  if (input.householdHead && input.parentsCared3y) n += Math.max(0, Math.floor(input.parentsCount));
  return n;
}

export function unmarriedChildren(input: ProfileInput): number {
  if (!input.useFamilyWizard) return Math.max(0, Math.floor(input.childrenUnmarried));
  return Math.max(0, Math.floor(input.childrenUnder30) + Math.floor(input.childrenOver30With1y));
}

export function isTreatedHomeless(input: ProfileInput): boolean {
  if (input.smallCheapOnly) return true;
  return !input.hasHouse;
}
