
export const scalePolygon = (coordinates, scaleFactor) => {

  const scaledCoords = [];
  

  let centerLng = 0;
  let centerLat = 0;
  let totalPoints = 0;
  
  coordinates[0].forEach(coord => {
    centerLng += coord[0];
    centerLat += coord[1];
    totalPoints++;
  });
  
  centerLng /= totalPoints;
  centerLat /= totalPoints;

  const scaledRing = coordinates[0].map(coord => {
    const dx = (coord[0] - centerLng) * scaleFactor;
    const dy = (coord[1] - centerLat) * scaleFactor;
    return [centerLng + dx, centerLat + dy]; 
  });
  
  scaledCoords.push(scaledRing);
  return scaledCoords;
};