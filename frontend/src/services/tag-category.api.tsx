import { axiosInterceptor } from "../interceptor/axios-interceptor";
import type { Response } from "../interface/global";

import axios from "axios";

export const getCategoriesTag = async (): Promise<Response | null> => {
    try {
        const response = await axiosInterceptor.get("/tags-categories/");
        return response.data as Response;
    
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            console.log(err.response?.data?.message || "Error al obtener categorias");
        }
        return null;
    }
};