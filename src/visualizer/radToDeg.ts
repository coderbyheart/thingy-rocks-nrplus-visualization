export const radToDeg = (radians: number): number => {
  const res = ((radians / (Math.PI * 2)) * 360) % 360
  if (res > 180) return 180 - res
  return res
}
