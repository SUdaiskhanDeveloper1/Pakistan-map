import "../App.css";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { polygons } from "../data/polygons";
import { scalePolygon } from "../utils/scalePolygon";
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
  const originalPolygons = useRef(polygons);
  const delayTimeout = useRef(null);
  const canShowPopup = useRef(true);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12", 
      center: [71, 30],
      zoom: 4.7,
      interactive: true, 
    });

    
    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

   
    setTimeout(() => {
      const navControl = document.querySelector('.mapboxgl-ctrl-top-right');
      if (navControl) {
        navControl.style.right = '-2px';
        navControl.style.top = '-7px';
        navControl.style.left = 'unset';
      }
    }, 500);

    map.current.on("load", () => {
      
      const scaledFeatures = polygons.features.map((f, idx) => {
        const coords = f.geometry.coordinates;
        let area = 0;
        if (coords && coords[0] && coords[0].length > 2) {
          for (let i = 0, len = coords[0].length - 1; i < len; i++) {
            area += coords[0][i][0] * coords[0][i + 1][1];
            area -= coords[0][i + 1][0] * coords[0][i][1];
          }
          area = Math.abs(area / 2);
        }
        if (!area) return f;

        return {
          ...f,
          geometry: {
            ...f.geometry,
            coordinates: scalePolygon(f.geometry.coordinates, 3),
          },
        };
      });

      const scaledPolygons = { ...polygons, features: scaledFeatures };
      map.current.addSource("polygons", {
        type: "geojson",
        data: scaledPolygons,
      });

      originalPolygons.current = scaledPolygons;

      
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

    
      map.current.addLayer(
        {
          id: "polygon-label",
          type: "symbol",
          source: "polygons",
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 10,
            "text-anchor": "center",
          },
          paint: {
            "text-color": "#d32f2f", 
            "text-halo-color": "#fff",
            "text-halo-width": 1.5,
          },
        },
        "settlement-label" 
      );

      
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
              '<div id="popup-container" style="width:220px;height:180px"></div>'
            )
            .addTo(map.current);
         
          const container = document.getElementById("popup-container");
          if (container) {
            const root = createRoot(container);
            const coords = feature.geometry.coordinates;
            const miniPolygon = {
              type: "Feature",
              properties: { name: feature.properties.name, color: "black" },
              geometry: {
                type: "Polygon",
                coordinates: scalePolygon(coords, 0.02),
              },
            };
            root.render(
              <div>
                <h3>{feature.properties.name}</h3>
                <MiniMap polygon={miniPolygon} style="mapbox://styles/mapbox/streets-v10" />
              </div>
            );
          }
          return feature;
        });
      });

      map.current.on("mouseleave", "polygon-fill", () => {
        popupRef.current.remove();
        setHoveredPolygon(null);
        map.current.getSource("polygons").setData(originalPolygons.current);

        canShowPopup.current = false;
        delayTimeout.current = setTimeout(() => {
          canShowPopup.current = true;
          delayTimeout.current = null;
        }, 1000);
      });

   
      const settlementLayer = map.current.getStyle().layers.find(
        (l) => l.id === "settlement-label"
      );

      if (settlementLayer) {
        map.current.setLayoutProperty("settlement-label", "text-size", [
          "interpolate",
          ["linear"],
          ["zoom"],
          4, 10, 
          8, 14, 
          12, 18 
        ]);

       
        map.current.setFilter("settlement-label", [
          "all",
          ["==", ["get", "iso_3166_1"], "PK"]
        ]);
      }
    });
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default MapView;