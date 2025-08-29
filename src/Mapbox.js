import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoicmVlYmF5IiwiYSI6ImNtZXFxYzNtMzE2YXUya3I0d2Y4eHFoNnkifQ.h0U0sDWmBQhdGzjj7_hhHQ";

const App = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const islamabadCoords = [73.0551, 33.6426];

  const pakistanBounds = [
    [60.9, 23.7],
    [77.1, 37.1],
  ];

  const scalePolygon = (coordinates, factor = 1.08) => {
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

  const polygons = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Bunji EL", color: "red" },
        geometry: {
          type: "Polygon",
          coordinates: scalePolygon(
            [
              [
                [74.66768522900003, 35.610149946000035],
                [74.72140373900004, 35.61293201500007],
                [74.72084134500005, 35.64699293100006],
                [74.66575713600008, 35.64823350100005],
                [74.66768522900003, 35.610149946000035],
              ],
            ],
            10.08
          ),
        },
      },
      {
        type: "Feature",
        properties: { name: "Chilium EL", color: "red" },
        geometry: {
          type: "Polygon",
          coordinates: scalePolygon(
            [
              [
                [75.09986427700005, 35.04047829800004],
                [75.16078563700006, 35.029786020000074],
                [75.16393357400005, 35.04651167800006],
                [75.09542505800005, 35.05103800400008],
                [75.10006639200003, 35.082509284000025],
                [75.07713142500006, 35.08100688500008],
                [75.09986427700005, 35.04047829800004],
              ],
            ],
            10.08
          ),
        },
      },
      {
        type: "Feature",
        properties: {
          name: "Chiporsun Metal & Mining Project",
          color: "green",
        },
        geometry: {
          type: "Polygon",
          coordinates: scalePolygon(
            [
              [
                [74.32383960600004, 36.74649428500004],
                [74.36483886400003, 36.74121878600005],
                [74.37187466100005, 36.76669755200004],
                [74.34424128100005, 36.76962894700006],
                [74.32383960600004, 36.74649428500004],
              ],
            ],
            20
          ),
        },
      },
      {
        type: "Feature",
        properties: {
          name: "Muhammad Khel Copper & Mining Project",
          color: "green",
        },
        geometry: {
          type: "Polygon",
          coordinates: scalePolygon(
            [
              [
                [69.76305011700003, 32.98305663900004],
                [69.75483703800006, 32.983292720000065],
                [69.75251091000007, 32.863464675000046],
                [69.83874838100007, 32.862239069000054],
                [69.83875780800008, 32.86741310800005],
                [69.83999021800008, 32.89942433500005],
                [69.84093965800008, 32.94895176500006],
                [69.83121773200008, 32.94909290800007],
                [69.83155407700008, 32.96560160400003],
                [69.84125637000005, 32.965460748000055],
                [69.85071160300004, 32.96528754700006],
                [69.85127481500007, 32.988471197000024],
                [69.76321317800006, 32.989729011000065],
                [69.76305011700003, 32.98305663900004],
              ],
            ],
            3
          ),
        },
      },
      {
        type: "Feature",
        properties: { name: "EI 207", color: "red" },
        geometry: {
          type: "Polygon",
          coordinates: scalePolygon(
            [
              [
                [63.92999701100007, 29.169529442000055],
                [63.92586721400005, 29.19613681800007],
                [63.85473387800005, 29.193451011000036],
                [63.85593096000008, 29.051663951000023],
                [64.26120194500004, 29.059643151000046],
                [64.25107596500004, 29.162297102000025],
                [63.92999701100007, 29.169529442000055],
              ],
            ],
            3
          ),
        },
      },
      {
        type: "Feature",
        properties: { name: "EL-320", color: "red" },
        geometry: {
          type: "Polygon",
          coordinates: scalePolygon(
            [
              [
                [64.41463864700006, 29.533370453000032],
                [64.41749038500006, 29.459170752000034],
                [64.50227859500006, 29.46163487800004],
                [64.50166023500003, 29.47812381600005],
                [64.53935196300006, 29.479200251000066],
                [64.53996367100007, 29.462711110000043],
                [64.60591462700006, 29.464566473000048],
                [64.60231106100008, 29.563506422000046],
                [64.58344768400008, 29.562979363000068],
                [64.58495842900004, 29.52175376400004],
                [64.52839457400006, 29.52015584000003],
                [64.52685884200008, 29.561380684000028],
                [64.50799632700006, 29.560841958000026],
                [64.47593492200008, 29.56115816700003],
                [64.46710916800004, 29.554616517000056],
                [64.46536241500007, 29.54859984500007],
                [64.41463864700006, 29.533370453000032],
              ],
            ],
            3
          ),
        },
      },
      {
        type: "Feature",
        properties: { name: "NagarPakar Mining Project", color: "green" },
        geometry: {
          type: "Polygon",
          coordinates: scalePolygon(
            [
              [
                [70.78914904200008, 24.57268399000003],
                [70.77534430500003, 24.57237331700003],
                [70.78087972600008, 24.563220605000026],
                [70.79929842300004, 24.563614349000034],
                [70.80150508600008, 24.569174995000026],
                [70.79572057800004, 24.57141880900008],
                [70.79709067400006, 24.575956002000055],
                [70.78904168800005, 24.576684852000028],
                [70.78914904200008, 24.57268399000003],
              ],
            ],
            90
          ),
        },
      },
      {
        type: "Feature",
        properties: { name: "EL-101", color: "red" },
        geometry: {
          type: "Polygon",
          coordinates: scalePolygon(
            [
              [
                [69.76305011700003, 32.98305663900004],
                [69.75483703800006, 32.983292720000065],
                [69.75251091000007, 32.863464675000046],
                [69.83874838100007, 32.862239069000054],
                [69.83875780800008, 32.86741310800005],
                [69.83999021800008, 32.89942433500005],
                [69.84093965800008, 32.94895176500006],
                [69.83121773200008, 32.94909290800007],
                [69.83155407700008, 32.96560160400003],
                [69.84125637000005, 32.965460748000055],
                [69.85071160300004, 32.96528754700006],
                [69.85127481500007, 32.988471197000024],
                [69.76321317800006, 32.989729011000065],
                [69.76305011700003, 32.98305663900004],
              ],
            ],
            1
          ),
        },
      },
      {
        type: "Feature",
        properties: { name: "Nazbar Yasin Ghizer EL", color: "green" },
        geometry: {
          type: "Polygon",
          coordinates: scalePolygon(
            [
              [
                [73.17210597300004, 36.39986184000003],
                [73.23329407900007, 36.40003777100003],
                [73.23372633200006, 36.43412478700003],
                [73.17267796000004, 36.43110213800003],
                [73.17210597300004, 36.39986184000003],
              ],
            ],
            15
          ),
        },
      },
    ],
  };

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

  return (
    <>
      <div style={{ width: "100%", height: "100vh" }}>
        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="legend">
        <h3>Legend</h3>

        <div className="legend-item">
          <div className="box mining"></div>
          <span>Mining Lease</span>
        </div>

        <div className="legend-item">
          <div className="box exploration"></div>
          <span>Exploration Lease</span>
        </div>
      </div>
    </>
  );
};

export default App;
