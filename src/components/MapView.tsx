import "../App.css";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Popup, GeoJSONSource, MapLayerMouseEvent } from "mapbox-gl";
import { polygons } from "../data/polygons";
import { scalePolygon } from "../utils/scalePolygon";
import MiniMap from "./MiniMap";
import { createRoot, Root } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";


const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
if (!MAPBOX_TOKEN) {
  throw new Error("Mapbox access token is missing!");
}
mapboxgl.accessToken = MAPBOX_TOKEN;

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const popupRootRef = useRef<Root | null>(null);

  const [, setHoveredPolygon] = useState<any>(null);
  const originalPolygons = useRef<any>(polygons);
  const delayTimeout = useRef<NodeJS.Timeout | null>(null);
  const canShowPopup = useRef(true);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [71, 30],
      zoom: 4.7,
      interactive: true,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    setTimeout(() => {
      const navControl = document.querySelector(
        ".mapboxgl-ctrl-top-right"
      ) as HTMLElement | null;
      if (navControl) {
        navControl.style.right = "-2px";
        navControl.style.top = "-7px";
        navControl.style.left = "unset";
      }
    }, 100);

    map.current.on("load", () => {
      
      const scaledFeatures = polygons.features.map((f: any) => {
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

      const scaledPolygons = {
        ...polygons,
        type: "FeatureCollection" as "FeatureCollection",
        features: scaledFeatures,
      };

      map.current!.addSource("polygons", {
        type: "geojson",
        data: scaledPolygons,
      });

      originalPolygons.current = scaledPolygons;

      map.current!.addLayer({
        id: "polygon-fill",
        type: "fill",
        source: "polygons",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.5,
        },
      });

      map.current!.addLayer({
        id: "polygon-outline",
        type: "line",
        source: "polygons",
        paint: {
          "line-color": "black",
          "line-width": 1.2,
        },
      });

      map.current!.addLayer(
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

      map.current!.addSource("country-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });

      map.current!.addLayer({
        id: "pakistan-outer-border",
        type: "line",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        paint: { "line-color": "#000000", "line-width": 2.5 },
        filter: ["==", "iso_3166_1_alpha_3", "PAK"],
      });

      map.current!.addSource("admin-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.mapbox-admin-boundaries-v3",
      });

      map.current!.addLayer({
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

      map.current!.addSource("crosshair-x", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.current!.addSource("crosshair-y", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.current!.addLayer({
        id: "crosshair-x-line",
        type: "line",
        source: "crosshair-x",
        paint: {
          "line-color": "red",
          "line-width": 1,
          "line-dasharray": [2, 2],
        },
      });

      map.current!.addLayer({
        id: "crosshair-y-line",
        type: "line",
        source: "crosshair-y",
        paint: {
          "line-color": "red",
          "line-width": 1,
          "line-dasharray": [2, 2],
        },
      });

      map.current!.on("mousemove", (e) => {
        const { lng, lat } = e.lngLat;

        const xLine: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "LineString", coordinates: [[-180, lat], [180, lat]] },
              properties: {},
            },
          ],
        };

        const yLine: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "LineString", coordinates: [[lng, -90], [lng, 90]] },
              properties: {},
            },
          ],
        };

        (map.current!.getSource("crosshair-x") as GeoJSONSource).setData(xLine);
        (map.current!.getSource("crosshair-y") as GeoJSONSource).setData(yLine);
      });

      map.current!.on("mousemove", "polygon-fill", (e: MapLayerMouseEvent) => {
        if (!e.features?.length) return;
        if (!canShowPopup.current) return;
        const feature = e.features[0];

        if (delayTimeout.current) {
          clearTimeout(delayTimeout.current);
          delayTimeout.current = null;
        }

        setHoveredPolygon((prev: any) => {
          if (prev && prev.id === feature.id) return prev;

          
          if (popupRootRef.current) {
            popupRootRef.current.unmount();
            popupRootRef.current = null;
          }
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }

          popupRef.current = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });
          popupRef.current
            .setLngLat(e.lngLat)
            .setHTML(
              '<div id="popup-container" style="width:220px;height:180px"></div>'
            )
            .addTo(map.current!);

          const container = document.getElementById("popup-container");
          if (container) {
            const root = createRoot(container);
            popupRootRef.current = root;
            let coords: any = [];
            if (
              feature.geometry.type === "Polygon" ||
              feature.geometry.type === "MultiPolygon"
            ) {
              coords = (feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon).coordinates;
            }
            const miniPolygon: GeoJSON.Feature<GeoJSON.Polygon> = {
              type: "Feature",
              properties: { name: feature.properties?.name, color: "black" },
              geometry: {
                type: "Polygon",
                coordinates: scalePolygon(coords, 0.02),
              },
            };
            root.render(
              <div>
                <h3>{feature.properties?.name}</h3>
                <MiniMap
                  polygon={miniPolygon}
                  mapStyle="mapbox://styles/mapbox/streets-v10"
                />
              </div>
            );
          }
          return feature;
        });
      });

      map.current!.on("mouseleave", "polygon-fill", () => {
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
        if (popupRootRef.current) {
          popupRootRef.current.unmount();
          popupRootRef.current = null;
        }
        setHoveredPolygon(null);
        (map.current!.getSource("polygons") as GeoJSONSource).setData(
          originalPolygons.current
        );

        canShowPopup.current = false;
        delayTimeout.current = setTimeout(() => {
          canShowPopup.current = true;
          delayTimeout.current = null;
        }, 1000);
      });

      const settlementLayer = map.current!.getStyle().layers?.find(
        (l) => l.id === "settlement-label"
      );

      if (settlementLayer) {
        map.current!.setLayoutProperty("settlement-label", "text-size", [
          "interpolate",
          ["linear"],
          ["zoom"],
          4, 10,
          8, 14,
          12, 18,
        ]);

        map.current!.setFilter("settlement-label", [
          "all",
          ["==", ["get", "iso_3166_1"], "PK"],
        ]);
      }
    });

    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      if (popupRootRef.current) {
        popupRootRef.current.unmount();
        popupRootRef.current = null;
      }
      if (delayTimeout.current) {
        clearTimeout(delayTimeout.current);
        delayTimeout.current = null;
      }
    };
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default MapView;