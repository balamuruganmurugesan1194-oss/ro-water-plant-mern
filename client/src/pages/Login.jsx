import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Droplets } from "lucide-react";
import { API } from "../api/client";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If the user was redirected here from a protected route, send them
  // back there after a successful login. Otherwise default to dashboard.
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("admin@rowater.local");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      login(response.data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form onSubmit={submit} className="login-card">
        <div className="brand center">
          <Droplets size={34} />
          <span>RO Plant</span>
        </div>

        <h2>Sign in</h2>

        <p>Water plant accounting & sales</p>

        {error && <div className="error">{error}</div>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <small>Demo: admin@rowater.local / Admin@123</small>
      </form>
    </div>
  );
}

export default Login;
