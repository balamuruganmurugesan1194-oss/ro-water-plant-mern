import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="login">
      <div className="login-card" style={{ textAlign: "center" }}>
        <h2>404</h2>
        <p>Page not found.</p>
        <Link className="primary" to="/dashboard">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
