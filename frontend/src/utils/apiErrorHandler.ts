import { isAxiosError } from "axios";

import toast from "react-hot-toast";

export interface ApiErrorResponse {
  success: boolean;
  status: number;
  message: string;
}

export const handleApiError = (err: unknown): ApiErrorResponse => {
  if (isAxiosError(err)) {
    if (err.code === "ECONNABORTED") {
      toast.error("La solicitud tardó demasiado en responder.");
      return {
        success: false,
        status: 408,
        message: "La solicitud tardó demasiado en responder.",
      };
    }

    if (err.response) {
      return {
        success: err.response.data?.success ?? false,
        status: err.response.status,
        message: err.response.data?.message || "Error procesando la solicitud.",
      };
    }
  }

  return {
    success: false,
    status: 500,
    message: "Error inesperado procesando la solicitud.",
  };
};
