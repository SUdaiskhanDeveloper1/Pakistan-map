import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MiniMap = ({ polygon }) => {
  const miniMapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!polygon) return;

    map.current = new mapboxgl.Map({
      container: miniMapContainer.current,
      style: "mapbox://styles/mapbox/light-v9",
      interactive: false,
    });

    map.current.on("load", () => {
      map.current.addSource("mini-polygon", { type: "geojson", data: polygon });
      map.current.addLayer({
        id: "mini-polygon-fill",
        type: "fill",
        source: "mini-polygon",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.5,
        },
      });

      const bounds = polygon.geometry.coordinates[0].reduce(
        (b, coord) => b.extend(coord),
        new mapboxgl.LngLatBounds(
          polygon.geometry.coordinates[0][0],
          polygon.geometry.coordinates[0][0]
        )
      );
      map.current.fitBounds(bounds, { padding: 15 });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [polygon]);

  return (
    <div
      ref={miniMapContainer}
      style={{ width: "90%", height: "150px", borderRadius: "6px" }}
    />
  );
};

export default MiniMap;
