import React from "react";
import MapView from "./components/MapView";
import Legend from "./components/Legend";
import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

const App = () => {
  return (
    <>
      <MapView />
      <Legend />
    </>
  );
};

export default App;
