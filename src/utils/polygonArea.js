
export function polygonArea(coordinates) {
  const ring = coordinates[0];
  let area = 0;
  for (let i = 0, len = ring.length - 1; i < len; i++) {
    area += ring[i][0] * ring[i + 1][1];
    area -= ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(area / 2);
}
