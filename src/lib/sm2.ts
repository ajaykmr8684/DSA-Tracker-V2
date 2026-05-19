/** SM-2 Spaced Repetition Algorithm */
export interface SM2State { ef: number; interval: number; reps: number }

export function sm2(quality: number, state: SM2State): SM2State {
  const newEf = Math.max(1.3, state.ef + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  let reps: number, interval: number
  if (quality < 3) { reps = 0; interval = 1 }
  else {
    reps = state.reps + 1
    interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(state.interval * newEf)
  }
  return { ef: newEf, interval: Math.max(1, interval), reps }
}

export function addDays(base: string, n: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function today(): string { return new Date().toISOString().slice(0, 10) }

export function revDays(count: number): number {
  if (count === 0) return 2
  if (count === 1) return 3
  if (count === 2) return 5
  return 10
}
