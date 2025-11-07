import { axiosInterceptor } from "@interceptor/axios-interceptor";
import toast from "react-hot-toast";

import type { Posts, Response, ResponseWithPagination } from "@interface/global";

import axios from "axios";

/** CREATE COMMUNITY */
export const createCommunity = async (
  name: string,
  description: string,
  bannerFile: File | null,
  iconFile: File | null,
  visibility: string,
  selectedTags: number[],
  creatorId: string
): Promise<Response | null> => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("visibility", visibility);
    formData.append("creatorId", creatorId);
    formData.append("selectedTags", JSON.stringify(selectedTags));
    if (bannerFile) formData.append("banner", bannerFile);
    if (iconFile) formData.append("icon", iconFile);

    const response = await toast.promise(
      axiosInterceptor.post("/community/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
      {
        loading: "Creando comunidad...",
        success: (res) => res.data.message || "Comunidad creada exitosamente",
        error: (err) =>
          err.response?.data?.message || "Error al crear comunidad",
      }
    );
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      toast.error(err.response?.data?.message || "Error al crear comunidad");
    } else {
      toast.error("Error desconocido");
    }
    return null;
  }
};

/** GET COMMUNITY (by slug) */
export const getCommunityBySlug = async (
  slug: string
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/community/", {
      params: { slug },
    });

    console.log(response.data);
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener comunidad");
    }
    return null;
  }
};

/** GET COMMUNITY (by tag_url) */
export const getCommunityByTag = async (
  tagId: number
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get(`/community/communities/tag`, {
      params: { tagId },
    });
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener comunidad");
    }
    return null;
  }
};

/** JOIN COMMUNITY */
export const joinCommunity = async (
  community_id: string
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.post("/community/join", {
      community_id,
    });

    if (response.data.success === true) {
      toast.success(response.data.message);
    }

    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      toast.error(err.response?.data?.message);
    }
    return null;
  }
};

/** LEAVE COMMUNITY */
export const leaveCommunity = async (
  community_id: string
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.post("/community/leave", {
      community_id,
    });

    if (response.data.success === true) {
      toast.success(response.data.message);
    }

    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener comunidad");
    }
    return null;
  }
};

/** GET USER COMMUNITIES */
export const getUserCommunities = async (): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/community/user");

    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener comunidad");
    }
    return null;
  }
};

/** GET COMMUNITY POSTS */
export const getCommunityPosts = async (
  page: number,
  communityId: string,
): Promise<ResponseWithPagination<Posts>> => { 
  try {
    const { data } = await axiosInterceptor.get("/community/posts", {
      params: { page, communityId },
    });
    return data; // No es necesario el 'as' si la API siempre devuelve el tipo correcto
  } catch (err) {
    console.error("Error al obtener posts de la comunidad:", err);
    throw err; 
  }
};

export const getRecommendedCommunities = async (
  user_id: string
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/community/recommended", {
      params: { user_id },
    });
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener comunidad");
    }
    return null;
  }
};

export const getPopularCommunities = async (): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/community/popular");
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener comunidad");
    }
    return null;
  }
};

export const getTrendingCommunities = async (): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/community/trending");
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener comunidad");
    }
    return null;
  }
};
