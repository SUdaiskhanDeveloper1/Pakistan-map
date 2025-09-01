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
  const popupRef = useRef(
    new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
  );
  const [, setHoveredPolygon] = useState(null);
  const delayTimeout = useRef(null);
  const canShowPopup = useRef(true);

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
          "line-color": "black",
          "line-width": 1.2,
        },
      });

      map.current.addSource("country-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });
      // borders layer of pakistan .
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
        paint: {
          "line-color": "#666666",
          "line-width": 1,
          "line-dasharray": [3, 2],
        },
        filter: ["==", "iso_3166_1", "PK"],
      });
      map.current.addSource("crosshair-x", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.current.addSource("crosshair-y", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.current.addLayer({
        id: "crosshair-x-line",
        type: "line",
        source: "crosshair-x",
        paint: {
          "line-color": "red",
          "line-width": 1,
          "line-dasharray": [2, 2],
        },
      });

      map.current.addLayer({
        id: "crosshair-y-line",
        type: "line",
        source: "crosshair-y",
        paint: {
          "line-color": "red",
          "line-width": 1,
          "line-dasharray": [2, 2],
        },
      });

      map.current.on("mousemove", (e) => {
        const { lng, lat } = e.lngLat;

        const xLine = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [
                  [-180, lat],
                  [180, lat],
                ],
              },
            },
          ],
        };

        const yLine = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [
                  [lng, -90],
                  [lng, 90],
                ],
              },
            },
          ],
        };

        map.current.getSource("crosshair-x").setData(xLine);
        map.current.getSource("crosshair-y").setData(yLine);
      });

      map.current.on("mousemove", "polygon-fill", (e) => {
        if (!e.features.length) return;
        if (!canShowPopup.current) return; 
        const feature = e.features[0];
        
        if (delayTimeout.current) {
          clearTimeout(delayTimeout.current);
          delayTimeout.current = null;
        }
        setHoveredPolygon((prev) => {
         
          if (prev && prev.id === feature.id) return prev;

          popupRef.current
            .setLngLat(e.lngLat)
            .setHTML(
              '<div id="popup-container" style="width:250px;height:200px"></div>'
            )
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
          return feature;
        });
      });

      map.current.on("mouseleave", "polygon-fill", () => {
        popupRef.current.remove();
        setHoveredPolygon(null);
    
        canShowPopup.current = false;
        delayTimeout.current = setTimeout(() => {
          canShowPopup.current = true;
          delayTimeout.current = null;
        }, 1500);
      });
    });
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default MapView;
