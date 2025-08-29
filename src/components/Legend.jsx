import React from "react";


const Legend = () => {
  return (
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
  );
};

export default Legend;
