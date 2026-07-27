import type { ContentType, Response, VoteType } from "@/interface/global";
import { handleApiError } from "@/utils/apiErrorHandler";
import { axiosInterceptor } from "@api/interceptor/axios-interceptor";

// --- 1. CREAR UN VOTO ---
// ===================================
export const createVote = async (
  type: VoteType,
  content_id: string,
  content_type: ContentType,
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.post("/vote/create", {
      type,
      content_id,
      content_type,
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};
