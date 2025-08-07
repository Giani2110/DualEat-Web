import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";

import DownloadSectionBG from "../../components/DownloadSectionBG";

// Define la interfaz para el estado del formulario para un tipado estricto
interface FormData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessLocation: string;
  visitTime: string; // Si este campo no va en el formulario, considera eliminarlo de la interfaz y del estado
  message: string;
  newsletter: boolean;
}

const LandingBusiness: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessLocation: "",
    visitTime: "",
    message: "",
    newsletter: false,
  });

  // Tipado para el evento de cambio de input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Tipado para el evento de envío del formulario
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Aquí es donde normalmente enviarías formData a una API
  };

  return (
    <div className="min-h-screen bgLanding">
      {/* Main Content - Business Form */}
      <main className="max-w-[70%] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:pt-[180px] md:pb-[130px] grid lg:grid-cols-2 gap-12">
        {/* Left Column - Form Info */}
        <div className="space-y-8 max-w-[90%]">
          <div className="transform hover:scale-101 transition-transform duration-300 flex flex-col space-y-5">
            <h1 className="text-[45px] font-bold leading-tight">
              Sumá tu negocio a <span className="text-[#b53325]">DualEat</span>
            </h1>
            <p className="text4 text-[15px] leading-loose">
              Si buscás potenciar tu negocio, llegar a nuevos clientes y
              aumentar tus ventas, sumate a DualEat. Nuestra app te permite
              digitalizar tu menú, recibir valoraciones reales, promocionar tus
              platos y formar parte de una comunidad gastronómica activa.
            </p>
          </div>

          <div className="bg-white h-[100px] cursor-pointer p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-[-2px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red rounded flex items-center justify-center hover:bg-red-600 transition-colors duration-200">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text5">Por mail</p>
                <p className="text-sm text4">contacto@dualeat.com</p>
              </div>
            </div>
          </div>

          <div className="bg-white h-[100px] cursor-pointer p-6 rounded-lg shadow-sm  hover:shadow-lg transition-all duration-300 transform hover:-translate-y-[-2px]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow rounded flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text5">Chatea con nosotros</p>
                <p className="text-sm text4">Lun a Viernes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="bg-white p-8 rounded-lg min-h-[800px] w-full shadow-sm hover:shadow-xl transition-all duration-300">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 h-full flex flex-col justify-evenly"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="tu@mail.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre del Local
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="Nombre del negocio"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="businessLocation"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Lugar del local
                </label>
                <input
                  type="text"
                  id="businessLocation"
                  name="businessLocation"
                  value={formData.businessLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Ubicación del negocio"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Teléfono de contacto"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-3 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="Contanos sobre tu negocio..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="newsletter"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleInputChange}
                className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500 transition-all duration-200"
              />
              <label
                htmlFor="newsletter"
                className="text-sm font-medium text-gray-700"
              >
                Deseo recibir información de DualEat
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-red text-white py-2 cursor-pointer px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-102 hover:shadow-lg"
            >
              Enviar
            </button>
          </form>
        </div>
      </main>
      {/* Sección Inferior - Parte específica de LandingBusiness */}
      <section className="mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden mb-10">
        <DownloadSectionBG
          background="bg-gradient-to-b from-[#232526] to-[#414345]"
          background2="bg-yellow"
        />
      </section>
    </div>
  );
};

export default LandingBusiness;
