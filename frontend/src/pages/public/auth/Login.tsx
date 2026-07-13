import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@hooks/useAuth";
import { ROUTES } from "@/api/constants/constants";
import AuthSection from "@/components/features/auth/AuthSection";

import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

import toast from "react-hot-toast";
import { getDeviceId } from "@/utils/device";
import Loader from "@/components/ui/feedback/Loader";

const turnstileOptions = {
  theme: "light" as const,
  size: "invisible" as const,
  execution: "execute" as const,
  appearance: "interaction-only" as const,
};

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const recaptchaRef = useRef<TurnstileInstance>(null);

  const turnstileCallbacks = useRef({
    onSuccess: (_token: string) => {},
    onError: (_e: any) => {},
    onExpire: () => {},
  });

  useEffect(() => {
    turnstileCallbacks.current = {
      onSuccess: (token: string) => {
        performLogin(token);
      },
      onError: (e: any) => {
        console.log(e);
        toast.error("Error validando seguridad. Intenta de nuevo.");
      },
      onExpire: () => {
        recaptchaRef.current?.reset();
      },
    };
  });

  const handleSuccess = useCallback(
    (token: string) => turnstileCallbacks.current.onSuccess(token),
    [],
  );
  const handleError = useCallback(
    (e: any) => turnstileCallbacks.current.onError(e),
    [],
  );
  const handleExpire = useCallback(
    () => turnstileCallbacks.current.onExpire(),
    [],
  );

  const { login } = useAuth();

  const handlePasswordSubmit = async () => {
    recaptchaRef.current?.execute();
  };

  const performLogin = async (token: string) => {
    setLoading(true);
    try {
      const deviceId = await getDeviceId();
      const response = await login(
        email.trim(),
        password.trim(),
        rememberMe,
        token,
        deviceId,
      );

      if (response?.success && response.user) {
        recaptchaRef.current?.reset();

        const { user } = response;

        console.log(response);

        if (user.role === "ADMIN") {
          navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
        } else if (user.is_business) {
          if (user.subscription_status === "ACTIVE") {
            navigate(ROUTES.LOCAL.DASHBOARD, { replace: true });
          } else {
            navigate(ROUTES.LOCAL.MENU, { replace: true });
          }
        } else {
          navigate(ROUTES.USER.DASHBOARD, { replace: true });
        }
      }
    } catch (e: any) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSection
      flex="right"
      title="Bienvenido de nuevo"
      subtitle="Ingresa a tu cuenta y conecta con tu comida, como nunca antes"
      children2={
        <div className="text-center text-base flex items-center justify-center gap-x-2">
          <span className="text-text-4">¿No tienes cuenta?</span>
          <Link
            to={ROUTES.AUTH.REGISTER}
            className="text-text-3 underline cursor-pointer hover:text-[#B53325] font-bold"
          >
            Regístrate
          </Link>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handlePasswordSubmit();
        }}
        className="flex flex-col gap-y-4"
      >
        <div className="space-y-2">
          <div className="font-medium text-sm text-text-3">Email</div>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-4 py-[10px] text-text-5 border border-gray-300 rounded-sm focus:ring-1 focus:ring-[#B2B2B2] focus:border-transparent outline-none"
          />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-y-2">
            <div className="font-medium text-sm text-text-3">
              Contraseña
            </div>

            <div className="flex flex-row items-center justify-between border border-gray-300 rounded-sm focus:ring-1 focus:ring-[#B2B2B2] focus:border-transparent px-4">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-text-5 py-[10px] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Turnstile
            ref={recaptchaRef}
            siteKey="0x4AAAAAACny8xDMqyxHHXxu"
            options={turnstileOptions}
            onSuccess={handleSuccess}
            onError={handleError}
            onExpire={handleExpire}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <input
              aria-label="Recuérdame"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4.5 h-4.5 cursor-pointer border-gray-300 rounded focus:ring-[#B53325]"
            />
            <span className="text-sm text-text-5">Recuérdame</span>
          </div>

          <Link
            to={ROUTES.AUTH.RESET_PASSWORD}
            className="text-text-5 font-medium text-sm cursor-pointer hover:underline  transition-transform"
          >
            ¿Olvidé mi contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex gap-x-2 items-center justify-center text-text-1 text-sm cursor-pointer bg-bg-red py-3 rounded-sm font-bold"
        >
          {loading ? "Iniciando sesión" : "Iniciar Sesión"}
          {loading && <Loader size={16} color="currentColor" />}
        </button>
      </form>
    </AuthSection>
  );
};

export default Login;
