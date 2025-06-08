import axios from "axios";
const API_URL_LOGIN_GG = "http://localhost:3000/auth/google";

export const loginGoogleMutation = async () => {
  const redirectUri = "http://localhost:5173/auth";
  const res = await axios.get(`${API_URL_LOGIN_GG}`, {
    params: {
      redirectUri: redirectUri,
    },
  });
  const redirectURL = res.data._url;
  return (window.location.href = redirectURL);
};
export const getUserInfo = async (code) => {
  const redirectUri = "http://localhost:5173/auth";
  const res = await axios.get(`${API_URL_LOGIN_GG}`, {
    params: {
      code: code,
      redirectUri: redirectUri,
    },
  });
  const data = res.data.data.access_token;
  return data;
};
