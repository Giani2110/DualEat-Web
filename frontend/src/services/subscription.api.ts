import { axiosInterceptor } from "@api/interceptor/axios-interceptor";
import { handleApiError } from "@/utils/apiErrorHandler";

export const createUserCheckout = async (
  plan: "COMMUNITY_USER_MONTHLY" | "COMMUNITY_USER_ANNUAL",
): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> => {
  try {
    const response = await axiosInterceptor.post(
      "/subscription/user-checkout",
      {
        plan,
      },
    );
    return response.data;
  } catch (err: any) {
    return handleApiError(err);
  }
};
