export const ROVER_MAX_SOL = {
  curiosity: 4100,
  opportunity: 5111,
  spirit: 2208
}

export function isValidSol(rover, sol) {
  const n = Number(sol)
  if (!Number.isFinite(n) || Number.isNaN(n)) return { ok: false, msg: 'Enter a valid number' }
  if (!Number.isInteger(n) || n < 0) return { ok: false, msg: 'Enter a whole positive number' }
  const max = ROVER_MAX_SOL[rover] ?? 9999
  if (n > max) return { ok: false, msg: `Max sol for ${rover} is ${max}` }
  return { ok: true, msg: '' }
}
