import { axiosInterceptor } from "../interceptor/axios-interceptor";

import axios from "axios";

interface ResponseVote<T = unknown> {
  success: boolean;
  data?: T;
  status: number;
}

export const createVote = async (
    voteType: string,
    content_id: string,
    content_type: string

): Promise<ResponseVote | null> => {
    try {
        const { data } = await axiosInterceptor.post("/vote/create", {
            voteType,
            content_id,
            content_type
        });

        console.log(data);
        return data as ResponseVote;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            console.log(err.response?.data?.message || "Error al obtener recetas");
        }
        return null;
    }
}
