export const degToRad = (degrees: number): number => {
  const rad = (degrees % 360) * (Math.PI / 180)
  return rad > Math.PI ? Math.PI - rad : rad
}
