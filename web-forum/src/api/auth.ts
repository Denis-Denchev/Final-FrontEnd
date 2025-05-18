// src/api/auth.ts
import axios from "axios";

const API_URL = "https://db-api.alpha-panda.eu/api/v1";

export const register = async (data: any) => {
  const res = await axios.post(`${API_URL}/user/register`, data);
  return res.data;
};

export const login = async (username: string, password: string) => {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  return axios.post(`${API_URL}/user/login`, params);
};
