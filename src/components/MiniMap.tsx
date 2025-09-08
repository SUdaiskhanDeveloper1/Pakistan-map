import React, { useEffect, useRef } from "react";
import mapboxgl, { Map, LngLatBoundsLike } from "mapbox-gl";

export interface MiniMapProps {
  polygon: GeoJSON.Feature<GeoJSON.Polygon>;
  mapStyle: string;
  style?: string;
}

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN as string;

const MiniMap: React.FC<MiniMapProps> = ({
  polygon,
  style = "mapbox://styles/mapbox/streets-v10",
}) => {
  const miniMapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);

  useEffect(() => {
    if (!polygon) return;

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    map.current = new mapboxgl.Map({
      container: miniMapContainer.current as HTMLDivElement,
      style: style,
      interactive: false,
    });

    map.current.on("load", () => {
      map.current?.addSource("mini-polygon", {
        type: "geojson",
        data: polygon,
      });

      map.current?.addLayer({
        id: "mini-polygon-fill",
        type: "fill",
        source: "mini-polygon",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.5,
        },
      });

      const coords = polygon.geometry.coordinates[0];
      const bounds = coords.reduce(
        (b, coord) => b.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(
          coords[0] as [number, number],
          coords[0] as [number, number]
        )
      );

      map.current?.fitBounds(bounds, { padding: 70 });
    });

    const handleMouseEnter = () => {
      if (map.current) {
        const maxZoom = map.current.getMaxZoom ? map.current.getMaxZoom() : 22;
        map.current.zoomTo(maxZoom, { duration: 900 });
      }
    };

    const handleMouseLeave = () => {
      if (map.current && polygon) {
        const coords = polygon.geometry.coordinates[0];
        const bounds = coords.reduce(
          (b, coord) => b.extend(coord as [number, number]),
          new mapboxgl.LngLatBounds(
            coords[0] as [number, number],
            coords[0] as [number, number]
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
