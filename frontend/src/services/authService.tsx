import { axiosInterceptor } from "../interceptor/axios-interceptor";

export const login = async (email: string, password: string) => {
  const response = await axiosInterceptor.post("/auth/login", {
    email,
    password,
  });

  const { success, message, token, user } = response.data;

  return {
    success,
    message,
    data: { token, user }, // te permite mantener la estructura esperada
  };
};
