import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MiniMap = ({ polygon, style = "mapbox://styles/mapbox/streets-v10" }) => {
  const miniMapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!polygon) return;

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    map.current = new mapboxgl.Map({
      container: miniMapContainer.current,
      style: style, 
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
      map.current.fitBounds(bounds, { padding: 70 });
    });

    const handleMouseEnter = () => {
      if (map.current) {
        const maxZoom = map.current.getMaxZoom ? map.current.getMaxZoom() : 22;
        map.current.zoomTo(maxZoom, { duration: 900 }); 
      }
    };
    
    const handleMouseLeave = () => {
      if (map.current) {
        const bounds = polygon.geometry.coordinates[0].reduce(
          (b, coord) => b.extend(coord),
          new mapboxgl.LngLatBounds(
            polygon.geometry.coordinates[0][0],
            polygon.geometry.coordinates[0][0]
          )
        );
        map.current.fitBounds(bounds, { padding: 70 });
      }
    };
    
    const container = miniMapContainer.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [polygon, style]);

  return (
    <div
      ref={miniMapContainer}
      style={{ width: "100%", height: "150px", borderRadius: "16px" }}
    />
  );
};

export default MiniMap;