import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

function Unauthorized() {
  return (
    <div className="login">
      <div className="login-card" style={{ textAlign: "center" }}>
        <ShieldAlert size={40} />
        <h2>Access denied</h2>
        <p>You don't have permission to view this page.</p>
        <Link className="primary" to="/dashboard">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;
