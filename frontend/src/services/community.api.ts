import { axiosInterceptor } from "@api/interceptor/axios-interceptor";
import type { Response, CommunityMember, Community } from "@/interface/global";
import type { CommunityDTO, UploadPayload } from "@/interface/global.dto";
import { handleApiError } from "@/utils/apiErrorHandler";

import toast from "react-hot-toast";

// --- 1. OBTENER COMUNIDADES DEL USUARIO ---
// ===================================
export const getUserCommunities = async (): Promise<
  Response<CommunityMember[]>
> => {
  try {
    const response = await axiosInterceptor.get("/community/user");

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 2. OBTENER COMUNIDAD POR NOMBRE ---
// ===================================
export const getByName = async (name: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/community/name`, {
      params: { name },
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 3. OBTENER COMUNIDAD POR SLUG ---
// ===================================
export const getBySlug = async (slug: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/community/${slug}`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 4. UNIRSE O ABANDONAR UNA COMUNIDAD ---
// ===================================
export const joinLeave = async (
  community_id: string,
  join: boolean,
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.post(`/community/join-leave`, {
      community_id,
      join,
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

// --- 5. CREAR UNA COMUNIDAD ---
// ===================================
export const create = async (
  community: CommunityDTO,
): Promise<Response<Community>> => {
  try {
    const response = await toast.promise(
      axiosInterceptor.post(`/community/create`, { community }),
      {
        loading: "Creando comunidad...",
        success: (res) => res.data.message || "Comunidad creada exitosamente",
        error: (err) =>
          err.response?.data?.message || "Error al crear comunidad",
      },
    );

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 6. SUBIR IMAGENES DE LA COMUNIDAD ---
// ===================================
export const upload = async (
  payload: UploadPayload,
): Promise<Response<{ banner_url: string; image_url: string }>> => {
  try {
    const formData = new FormData();

    if (payload.banner_url) {
      formData.append("banner_url", payload.banner_url.file);
    }

    if (payload.image_url) {
      formData.append("image_url", payload.image_url.file);
    }

    const response = await axiosInterceptor.post(
      "/community/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.urls,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 7. OBTENER COMUNIDADES POR CATEGORÍA ---
// ===================================
export const getByCategorySkeleton = async (
  category_id: number,
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(
      `/community/category/${category_id}`,
    );

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};
