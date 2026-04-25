import { useState } from "react";
import { Eye, EyeOff, Building, MapPin, Info } from "lucide-react";
import toast from "react-hot-toast";
import AuthSection from "@/components/public/auth/AuthSection";
import { ROUTES } from "@/api/constants/constants";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { getDeviceId } from "@/utils/device";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const RegisterLocal = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    // Step 1: User Auth Data
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    // Step 2: Local Setup Data
    const [userName, setUserName] = useState<string>("");
    const [localName, setLocalName] = useState<string>("");
    const [localAddress, setLocalAddress] = useState<string>("");
    const [localDescription, setLocalDescription] = useState<string>("");
    const [localType, setLocalType] = useState<string>("Restaurante");

    const [isPendingMode, setIsPendingMode] = useState<boolean>(false);

    const { register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const tempToken = queryParams.get("tempToken");

    const handleStep1 = async () => {
        const deviceId = await getDeviceId();

        if (!email || !password || !confirmPassword) {
            toast.error("Por favor, completa todos los campos.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }

        try {
            const responseData = await register(email.trim(), password.trim(), deviceId);

            if (responseData?.success && responseData.next_step) {
                navigate(`/signup/locals${responseData.next_step}`);
            }
        } catch (e: any) {
            console.log("Error al registrar:", e);
            toast.error(e.response?.data?.message || "Error al conectar con el servidor.");
        }
    };

    const handleStep2 = async () => {
        if (!userName || !localName || !localAddress) {
            toast.error("Por favor, completa los campos requeridos.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/complete-local-profile`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tempToken,
                    userName: userName.trim(),
                    localName: localName.trim(),
                    localAddress: localAddress.trim(),
                    localDescription: localDescription.trim(),
                    localType: localType.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Error al completar el perfil del local");
            }

            toast.success("¡Local registrado exitosamente!");
            setIsPendingMode(true);
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "No se pudo conectar con el servidor.");
        }
    };

    if (isPendingMode) {
        return (
            <AuthSection
                flex="flex"
                color="bg-yellow"
                title="Registro Exitoso"
                subtitle="El local se encuentra en revisión."
                children2={
                    <div className="mt-4 flex flex-col justify-center gap-3 w-full text-center items-center">
                        <Link to={ROUTES.PUBLIC.HOME} className="text4 hover:text-red-500 underline font-bold px-4 py-2">
                            Volver al Inicio
                        </Link>
                    </div>
                }
                background="right-background"
                Dform="Dform-right"
                items="items-end text-right"
            >
                <div className="flex flex-col gap-4 text-left">
                    <p className="text-[16px] text4 leading-relaxed bg-white/50 p-4 rounded-xl border border-gray-100">
                        Hemos registrado su comercio de forma correcta. Actualmente se encuentra con el estado <strong className="text-red-600">Pendiente de Aprobación</strong>.
                        <br /><br />
                        Un administrador de DualEat revisará su solicitud pronto. Podrá iniciar sesión una vez que el estado de su local pase a ser aprobado y activo.
                    </p>
                </div>
            </AuthSection>
        );
    }

    if (tempToken) {
        return (
            <AuthSection
                flex="flex"
                color="bg-yellow"
                title="Configura tu Local"
                subtitle="Agrega los detalles de tu negocio para empezar"
                children2={null}
                background="right-background"
                Dform="Dform-right"
                items="items-end text-right"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleStep2();
                    }}
                    className="flex flex-col gap-5 text-left"
                >
                    <div>
                        <p className="font-medium text-[15px] mb-2 text5">Tu Nombre Completo *</p>
                        <input
                            required
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Ej. Juan Pérez"
                            className="w-full px-4 py-[10px] text5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#E5A657] outline-none"
                        />
                    </div>

                    <div>
                        <p className="font-medium text-[15px] mb-2 text5">Nombre del Local *</p>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                value={localName}
                                onChange={(e) => setLocalName(e.target.value)}
                                placeholder="Ej. Pizzería Don Mario"
                                className="w-full px-4 py-[10px] pl-11 text5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#E5A657] outline-none"
                            />
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                    </div>

                    <div>
                        <p className="font-medium text-[15px] mb-2 text5">Dirección del Local *</p>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                value={localAddress}
                                onChange={(e) => setLocalAddress(e.target.value)}
                                placeholder="Ej. Av. Siempre Viva 123"
                                className="w-full px-4 py-[10px] pl-11 text5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#E5A657] outline-none"
                            />
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                    </div>

                    <div>
                        <p className="font-medium text-[15px] mb-2 text5">Tipo de Negocio</p>
                        <select
                            value={localType}
                            onChange={(e) => setLocalType(e.target.value)}
                            className="w-full px-4 py-[10px] text5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#E5A657] outline-none"
                        >
                            <option value="Restaurante">Restaurante</option>
                            <option value="Cafetería">Cafetería</option>
                            <option value="Bar">Bar</option>
                            <option value="Heladería">Heladería</option>
                            <option value="Pizzería">Pizzería</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>

                    <div>
                        <p className="font-medium text-[15px] mb-2 text5">Descripción Corta</p>
                        <div className="relative">
                            <textarea
                                value={localDescription}
                                onChange={(e) => setLocalDescription(e.target.value)}
                                placeholder="¿Qué hace especial a tu local?"
                                rows={2}
                                className="w-full px-4 py-[10px] pl-11 text5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#E5A657] outline-none resize-none"
                            />
                            <Info className="absolute left-3 top-6 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                    </div>

                    <div className="mb-2 mt-2">
                        <button
                            type="submit"
                            className="Dosis-Bold w-full mb-3 text-[15px] cursor-pointer bg-yellow text-white py-[10px] px-4 rounded-lg hover:bg-gray-900 transition-colors font-medium"
                        >
                            Finalizar Registro →
                        </button>
                    </div>
                </form>
            </AuthSection>
        );
    }

    return (
        <AuthSection
            flex="flex"
            color="bg-yellow"
            title="Registra tu Local"
            subtitle="Crea tu cuenta de administrador comercial para gestionar tu restaurante"
            children2={
                <div className="text-center text-[15px] flex items-center justify-center mt-6 gap-3">
                    <span className="text4">¿Buscas comida?</span>
                    <Link
                        to={ROUTES.AUTH.REGISTER}
                        className="text5 underline cursor-pointer hover:text-red-600 font-bold"
                    >
                        Regístrate como usuario
                    </Link>
                </div>
            }
            background="right-background"
            Dform="Dform-right"
            items="items-end text-right"
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleStep1();
                }}
                className="flex flex-col gap-6"
            >
                <div className="mt-3">
                    <p className="font-medium text-[15px] mb-2 text5 text-left">Email del Administrador</p>
                    <div className="relative">
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            className="w-full px-4 py-[10px] text5 border border-gray-300 rounded-lg focus:ring-1 focus:border-transparent focus:ring-[#E5A657] outline-none"
                        />
                    </div>
                </div>

                <div>
                    <p className="font-medium text-[15px] mb-2 text5 text-left">Contraseña</p>
                    <div className="relative">
                        <input
                            required
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-[10px] text5 border border-gray-300 rounded-lg focus:ring-1 focus:border-transparent focus:ring-[#E5A657] outline-none pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div>
                    <p className="font-medium text-[15px] mb-2 text5 text-left">Confirmar contraseña</p>
                    <div className="relative">
                        <input
                            required
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite tu contraseña"
                            className="w-full px-4 py-[10px] text5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#E5A657] text-[15px] outline-none pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="mb-2 mt-4">
                    <button
                        type="submit"
                        className="Dosis-Bold w-full mb-3 text-[15px] cursor-pointer bg-yellow text-white py-[10px] px-4 rounded-lg hover:bg-gray-900 transition-colors font-medium"
                    >
                        Continuar →
                    </button>
                </div>
            </form>
        </AuthSection>
    );
};

export default RegisterLocal;
