import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { islamabadCoords } from "../data/constants";
import { polygons } from "../data/polygons";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
const MapView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [71, 30],
      zoom: 4.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      map.current.addSource("country-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });

      map.current.addLayer({
        id: "pakistan-fill",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: ["==", ["get", "iso_3166_1_alpha_3"], "PAK"],
        paint: {
          "fill-color": "white",
          "fill-opacity": 0,
        },
      });

      map.current.addLayer({
        id: "pakistan-outline",
        type: "line",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: ["==", ["get", "iso_3166_1_alpha_3"], "PAK"],
        paint: {
          "line-color": "black",
          "line-width": 2,
        },
      });

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

      map.current.addLayer({
        id: "polygon-labels",
        type: "symbol",
        source: "polygons",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 0.1,
          "text-offset": [0, 0.1],
          "text-anchor": "top",
        },
      });

      map.current.on("click", "polygon-fill", (e) => {
        const name = e.features[0].properties.name;
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`<h3>📍 ${name}</h3>`)
          .addTo(map.current);
      });

      map.current.on("mouseenter", "polygon-fill", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "polygon-fill", () => {
        map.current.getCanvas().style.cursor = "";
      });

      new mapboxgl.Marker({ color: "blue" })
        .setLngLat(islamabadCoords)
        .setPopup(
          new mapboxgl.Popup().setHTML("<b>My Location</b><br/>I-9/2 Islamabad")
        )
        .addTo(map.current);

      const bounds = new mapboxgl.LngLatBounds();
      polygons.features.forEach((feature) =>
        feature.geometry.coordinates[0].forEach((coord) => bounds.extend(coord))
      );
      bounds.extend(islamabadCoords);
      map.current.fitBounds(bounds, { padding: 50 });
    });
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default MapView;
