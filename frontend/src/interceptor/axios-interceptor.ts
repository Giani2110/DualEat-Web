import axios from "axios";
import { appConfig } from "../config/AplicationConfig";

export const axiosInterceptor = axios.create({
  baseURL: appConfig.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});