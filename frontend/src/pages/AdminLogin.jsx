import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      // Clear customer session
      localStorage.removeItem("dumHouseToken");
      localStorage.removeItem("dumHouseUser");

      // Save admin session separately
      localStorage.setItem("dumHouseAdminToken", data.token);
      localStorage.setItem(
        "dumHouseAdmin",
        JSON.stringify(data.admin)
      );

      navigate("/admin");
    } catch (error) {
      console.error("Admin login error:", error);
      setError(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        {/* HEADER */}
        <div className="admin-login-header">

          <div className="admin-login-logo">
            DH
          </div>

          <h1>Admin Login</h1>

          <p>
            Sign in to manage Dum House
          </p>

        </div>


        {/* ERROR */}
        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}


        {/* FORM */}
        <form
          className="admin-login-form"
          onSubmit={handleLogin}
        >

          {/* EMAIL */}
          <div className="admin-login-field">

            <label>
              Email Address
            </label>

            <div className="admin-login-input-wrapper">

              <input
                type="email"
                className="admin-login-input"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                autoComplete="username"
              />

            </div>

          </div>


          {/* PASSWORD */}
          <div className="admin-login-field">

            <label>
              Password
            </label>

            <div className="admin-login-input-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="admin-login-input admin-password-input"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>

            </div>

          </div>


          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>


        {/* FOOTER */}
        <div className="admin-login-footer">
          Dum House Admin Panel
        </div>

      </div>

    </div>
  );
}