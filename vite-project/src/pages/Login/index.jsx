import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/auth/api/login", {
        email,
        password,
      });
      const token = response.data.access_token;
      // Redirect to profile page after successful login
      if (!token) {
        alert("Login failed. Please try again.");
        return;
      }
      localStorage.setItem("token", token);
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };
  const handleRegister = () => {
    navigate("/register");
  };
  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <div className="google-login">
          <button onClick={handleRegister}>Register</button>
          <button onClick={handleGoogleLogin}>Login with Google</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
