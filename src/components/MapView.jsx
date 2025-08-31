
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { polygons } from "../data/polygons";
import MiniMap from "./MiniMap";
import { createRoot } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popupRef = useRef(new mapboxgl.Popup({ closeButton: false, closeOnClick: false }));
  const [hoveredPolygon, setHoveredPolygon] = useState(null);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [71, 30],
      zoom: 4.6,
      interactive: false,
    });

    map.current.on("load", () => {
     
      map.current.addSource("polygons", { type: "geojson", data: polygons });
      map.current.addLayer({
        id: "polygon-fill",
        type: "fill",
        source: "polygons",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.5,
        },
      });
      map.current.addLayer({
        id: "polygon-outline",
        type: "line",
        source: "polygons",
        paint: {
          "line-color": "#0a1234ff",
          "line-width": 1.2,
        },
      });

    
      map.current.addSource("country-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });
      map.current.addLayer({
        id: "pakistan-outer-border",
        type: "line",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        paint: { "line-color": "#000000", "line-width": 2.5 },
        filter: ["==", "iso_3166_1_alpha_3", "PAK"],
      });
      map.current.addSource("admin-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.mapbox-admin-boundaries-v3",
      });
      map.current.addLayer({
        id: "pakistan-inner-borders",
        type: "line",
        source: "admin-boundaries",
        "source-layer": "admin1",
        paint: { "line-color": "#666666", "line-width": 1, "line-dasharray": [3, 2] },
        filter: ["==", "iso_3166_1", "PK"],
      });

      
      map.current.on("mousemove", "polygon-fill", (e) => {
        if (!e.features.length) return;
        const feature = e.features[0];
        setHoveredPolygon(feature);

        popupRef.current
          .setLngLat(e.lngLat)
          .setHTML('<div id="popup-container" style="width:250px;height:200px"></div>')
          .addTo(map.current);

        const container = document.getElementById("popup-container");
        if (container) {
          const root = createRoot(container);
          root.render(
            <div>
              <h3>{feature.properties.name}</h3>
              <MiniMap polygon={feature} />
            </div>
          );
        }
      });

     
      map.current.on("mouseleave", "polygon-fill", () => {
        popupRef.current.remove();
        setHoveredPolygon(null);
      });
    });
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default MapView;
