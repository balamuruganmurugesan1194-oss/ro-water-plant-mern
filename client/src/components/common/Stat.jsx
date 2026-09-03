import React from "react";

const Stat = ({ title, value }) => (
  <div className="stat">
    <span>{title}</span>
    <strong>{value}</strong>
  </div>
);

export default Stat;
