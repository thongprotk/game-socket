import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getUserInfo, loginGoogleMutation } from "./google-callback";
import { useEffect } from "react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formLogin, setFormLogin] = useState(true);
  const [formRegister, setFormRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    try {
      console.log(formData);
      const response = await axios.post(
        "http://localhost:3000/auth/api/register",
        formData
      );
      console.log(response.data);
      alert("Đăng ký thành công");
      setFormLogin(true);
      setFormRegister(false);
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };
  const handleFormLogin = () => {
    setFormLogin(true);
    setFormRegister(false);
  };
  const handleFormRegister = () => {
    setFormLogin(false);
    setFormRegister(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/auth/api/login",
        {
          email,
          password,
        }
      );
      const token = response.data.access_token;
      // Redirect to profile page after successful login
      if (!token) {
        alert("Login failed. Please try again.");
        return;
      }
      localStorage.setItem("access_token", token);
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed. Please try again.");
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      setLoading(true);
      getUserInfo(code)
        .then((token) => {
          // Lưu token và redirect
          console.log(token);
          localStorage.setItem("access_token", token);
          navigate("/");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  return (
    <div className="login-container">
      {formLogin ? (
        <>
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
            <div className="register-link">
              <a onClick={handleFormRegister}>Register</a>
            </div>
            <button type="submit">Login</button>
            <div className="google-login">
              <button onClick={loginGoogleMutation}>Login with Google</button>
            </div>
          </form>{" "}
        </>
      ) : (
        <>
          <div className="register-link">
            <a onClick={handleFormLogin}>Login</a>
          </div>
          <h2>Register</h2>
          <form className="register-form" onSubmit={handleSubmitRegister}>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={formData.username}
              name="username"
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              name="email"
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={formData.password}
              name="password"
              onChange={handleChange}
            />
            <button type="submit">Đăng ký</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Auth;
