export const scalePolygon = (coordinates, factor = 1.08) => {
  let coords = coordinates[0];
  let centroid = coords.reduce(
    (acc, [lng, lat]) => [
      acc[0] + lng / coords.length,
      acc[1] + lat / coords.length,
    ],
    [0, 0]
  );

  let scaled = coords.map(([lng, lat]) => [
    centroid[0] + (lng - centroid[0]) * factor,
    centroid[1] + (lat - centroid[1]) * factor,
  ]);

  return [scaled];
};
