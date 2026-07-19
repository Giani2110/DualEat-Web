import axios from "axios";
import { axiosInterceptor } from "@api/interceptor/axios-interceptor";

import { useState, useEffect } from "react";

import { X, Eye, EyeOff } from "lucide-react";
import Loader from "@/components/ui/feedback/Loader";
import OtpInput from "@/components/ui/inputs/OtpInput";

import { ROUTES } from "@/api/constants/constants";
import { useNavigate } from "react-router-dom";
import { Fingerprint, Mail, RectangleEllipsis } from "lucide-react";

import "@assets/scss/public/auth.scss";
import { AnimatedGridPattern } from "@/components/ui/feedback/animated-grid-pattern";

const ResetPassword = () => {
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [success, setSuccess] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleBack = () => {
    setCode("");
    setStep("email");
  };

  const handleSendCode = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await axiosInterceptor.post("/auth/password_reset", {
        email,
      });

      if (response.data?.success) {
        setStep("code");
      } else {
        setError("No se pudo enviar el código. Intenta nuevamente.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Error desconocido");
      } else {
        setError("Error al enviar el código");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);

    try {
      const response = await axiosInterceptor.post("/auth/password_reset", {
        email,
      });
      if (!response.data?.success) {
        setError("No se pudo reenviar el código. Intenta nuevamente.");
      } else {
        setResendCooldown(60); // ⏱ inicia cooldown
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Error desconocido");
      } else {
        setError("Error al reenviar el código");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCode = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await axiosInterceptor.post(
        "/auth/password_reset/validate-code",
        {
          email,
          code,
        },
      );

      if (response.data?.success === true) {
        setStep("password");
      } else {
        setError("Código invalido");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message);
      } else {
        setError("Error al validar el código");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }

      const response = await axiosInterceptor.post(
        "/auth/password_reset/reset",
        {
          email,
          newPassword,
        },
      );

      if (response.data?.success) {
        setSuccess(true);

        setTimeout(() => {
          navigate(ROUTES.AUTH.LOGIN);
        }, 3000);
      } else {
        setError("Error al restablecer la contraseña");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message);
      } else {
        setError("Error al restablecer la contraseña");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex-1 flex items-center justify-center relative">
      <AnimatedGridPattern className="bg-black" />

      <div className="z-10 max-w-[600px] h-[650px] w-full flex flex-col justify-center items-center mt-20 bg-black border border-gray-700 rounded-[20px] px-8 py-10">
        <div className="flex items-center mb-6">
          <X
            size={22}
            className="absolute top-5 left-5 text-white cursor-pointer"
            onClick={() => navigate(ROUTES.AUTH.LOGIN)}
          />

          {step === "email" ? (
            <div className="w-[50px] flex items-center justify-center h-[50px] bg-bg-red rounded-[10px]">
              <Fingerprint size={25} color="#fff" />
            </div>
          ) : step === "code" ? (
            <div className="w-[50px] flex items-center justify-center h-[50px] bg-bg-yellow rounded-[10px]">
              <Mail size={25} color="#fff" />
            </div>
          ) : (
            step === "password" && (
              <div className="w-[50px] flex items-center justify-center h-[50px]  bg-bg-red  rounded-[10px]">
                <RectangleEllipsis size={25} color="#fff" />
              </div>
            )
          )}
        </div>
        {step === "email" && (
          <form
            className="flex flex-col h-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCode();
            }}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <h2 className="text-2xl text-text-1 font-bold mb-2">
                  Restablecer contraseña
                </h2>
                <p className="text-text-2/50 text-sm">
                  ¿Olvidaste tu contraseña? No te preocupes. Ingresá el correo
                  electrónico que usás para iniciar sesión y te enviaremos un
                  código para ayudarte a restablecerla.
                </p>

                <div className="relative mt-8">
                  <input
                    type="email"
                    id="email"
                    placeholder="Correo electrónico"
                    className="peer w-full border text-text-1 px-4 pb-3 pt-7 rounded-[5px] border-gray-700 placeholder-transparent focus:outline-none focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-4 text-[#707070] cursor-text transition-all duration-300 ${
                      email
                        ? "top-1 text-sm text-blue-500"
                        : "top-5 text-[16px] peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
                    }`}
                  >
                    Correo electrónico
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={!email}
                className={`w-full font-bold py-3 rounded-[50px] transition
                    ${
                      !email
                        ? "bg-bg-red brightness-50 cursor-not-allowed text-white/90"
                        : "bg-bg-red cursor-pointer text-white hover:bg-bg-red"
                    }`}
              >
                {loading ? <Loader color="white" size={10} /> : "Enviar código"}
              </button>
            </div>
          </form>
        )}

        {step === "code" && (
          <>
            <form
              className="flex flex-col mx-[50px] h-full"
              onSubmit={(e) => {
                e.preventDefault();
                handleValidateCode();
              }}
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h2 className="text-[31px] text2 font-bold mb-2">
                    Te enviamos un código
                  </h2>
                  <p className="text4 text-[15px] leading-[21px] my-5">
                    Enviamos un código de confirmación a
                    <span className="font-bold text1 ms-1">{email}</span>.
                  </p>
                  <p className="text4 text-[15px] leading-[21px]">
                    Consulta tu correo para obtener tu código de confirmación.
                    Si tienes que solicitar un código nuevo, vuelve y realiza la
                    solicitud nuevamente.
                  </p>

                  {/* OtpInput component */}
                  <div className="relative mt-8">
                    <label className="block text-center text-sm mb-4 text-[#707070]">
                      Introduce el código de 6 dígitos
                    </label>
                    <OtpInput length={6} value={code} onChange={setCode} />
                  </div>

                  <p className="text4 text-[15px] leading-[21px] text-center mt-5">
                    ¿No recibiste el correo?
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className={`font-bold text2 ms-1 cursor-pointer underline underline-offset-1 ${
                        resendCooldown > 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={resendCooldown > 0 || loading}
                    >
                      {resendCooldown > 0
                        ? `Reenviar disponible en ${resendCooldown}s`
                        : "Haz clic para reenviarlo."}
                    </button>
                  </p>
                </div>

                {!code ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text1 border border-[#e5a657] hover:bg-[#e5a657] hover:brightness-95 w-full font-bold py-3 cursor-pointer rounded-[20px] transition-all duration-300"
                  >
                    {loading ? <Loader color="white" size={10} /> : "Atrás"}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-red border border-[#888888] text1 hover:brightness-90 w-full font-bold py-3 cursor-pointer rounded-[50px] transition-all duration-300"
                  >
                    {loading ? (
                      <Loader color="white" size={10} />
                    ) : (
                      "Validar código"
                    )}
                  </button>
                )}
              </div>
            </form>
          </>
        )}

        {step === "password" && (
          <>
            <form
              className="flex flex-col mx-[50px] h-full"
              onSubmit={(e) => {
                e.preventDefault();
                handleResetPassword();
              }}
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h2 className="text-[31px] text2 font-bold mb-2">
                    Elige una contraseña nueva
                  </h2>
                  <p className="text4 text-[15px] leading-[21px]">
                    Asegurate de que tu contraseña tenga al menos 8 caracteres o
                    más. Intenta que incluya números, letras o signos especiales
                    para que sea una{" "}
                    <span className="text-red">contraseña segura.</span>
                  </p>
                  <p className="text4 text-[15px] leading-[21px] mt-4">
                    Una vez que cambies tu contraseña, se cerraran todas tus
                    sesiones abiertas.
                  </p>

                  <div className="relative mt-8">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Introduce una contraseña nueva"
                      minLength={8}
                      className="peer w-full border text1 px-4 pb-3 pt-7 rounded-[5px] border-gray-700 placeholder-transparent focus:outline-none focus:border-blue-500"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <label
                      htmlFor="password"
                      className={`absolute left-4 text-[#707070] cursor-text transition-all duration-300 ${
                        newPassword
                          ? "top-1 text-sm text-blue-500"
                          : "top-5 text-[16px] peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
                      }`}
                    >
                      Introduce una contraseña nueva
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="relative mt-4">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      placeholder="Confirma tu contraseña"
                      minLength={8}
                      className="peer w-full border text1 px-4 pb-3 pt-7 rounded-[5px] border-gray-700 placeholder-transparent focus:outline-none focus:border-blue-500"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <label
                      htmlFor="confirmPassword"
                      className={`absolute left-4 text-[#707070] transition-all duration-300 ${
                        confirmPassword
                          ? "top-1 text-sm text-blue-500"
                          : "top-5 text-[16px] peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
                      }`}
                    >
                      Confirma tu contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full bg-bg-red text-text-1 font-bold py-3 cursor-pointer rounded-[50px]`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader color="white" size={20} />
                      {success ? (
                        <span className="ml-2">Contraseña cambiada</span>
                      ) : (
                        <span className="ml-2">Cambiando contraseña</span>
                      )}
                    </div>
                  ) : (
                    "Cambiar contraseña"
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {error && <p className="text-[#F03536] mt-4 text-sm">{error}</p>}
      </div>
    </main>
  );
};

export default ResetPassword;
