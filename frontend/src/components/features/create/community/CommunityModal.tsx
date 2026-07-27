import { useState } from "react";
import type {
  CommunityDTO,
  UploadableFile,
  UploadPayload,
} from "@/interface/global.dto";
import StepOne from "./StepOne";
import { ArrowLeft } from "lucide-react";
import Loader from "../../../ui/feedback/Loader";
import StepTwo from "./StepTwo";
import { useMutation } from "@tanstack/react-query";
import { create, getByName, upload } from "@/services/community.api";
import StepThree from "./StepThree";
import Modal from "@/components/modal/Modal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";

interface Props {
  onClose: () => void;
  user: { id: string; name: string; email: string };
}

export default function CommunityModal({ onClose }: Props) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [community, setCommunity] = useState<CommunityDTO>({
    name: "",
    description: "",
    image_url:
      "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg",
    banner_url:
      "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultBanner.jpg",
    tags: [] as string[],
  });

  const { mutate, error, isPending } = useMutation({
    mutationFn: async (payload: UploadPayload) => {
      try {
        const available = await getByName(community.name.trim());

        const list = Array.isArray(available?.data)
          ? available.data
          : available?.data
            ? [available.data]
            : [];

        const isTaken = list.some(
          (c: any) =>
            c.name.toLowerCase() === community.name.trim().toLowerCase(),
        );

        if (isTaken) {
          throw new Error("La comunidad ya existe");
        }

        const responseUpload = await upload(payload);

        if (!responseUpload?.success || !responseUpload?.data) {
          throw new Error("Error al subir las imágenes de la comunidad");
        }

        const urls = responseUpload.data;

        const payloadCommunity: CommunityDTO = {
          name: community.name,
          description: community.description,
          tags: community.tags,
          image_url: urls.image_url as string,
          banner_url: urls.banner_url as string,
        };

        const responseCreate = await create(payloadCommunity);

        if (!responseCreate?.success || !responseCreate?.data) {
          throw new Error(responseCreate.message || "Error al crear la comunidad");
        }

        return responseCreate;
      } catch (e: any) {
        throw e;
      }
    },

    onSuccess: (res) => {
      onClose();
      navigate(ROUTES.USER.COMMUNITY(res.data?.slug || ""));
    },
  });

  const handleNext = async () => {
    // TODO: Toast
    if (step !== 3) setStep((prev) => prev + 1);

    if (
      step === 3 &&
      community.tags.length > 0 &&
      community.name.trim().length > 0 &&
      community.description.trim().length > 0 &&
      community.image_url &&
      community.banner_url
    ) {
      try {
        const payload: UploadPayload = {
          image_url: community.image_url as UploadableFile,
          banner_url: community.banner_url as UploadableFile,
        };

        mutate(payload);
      } catch (e: any) {
        toast.error(e.message);
      }
    }
  };

  const handleBack = () => {
    if (step !== 1) setStep((prev) => prev - 1);
    if (step === 1) onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepOne community={community} setCommunity={setCommunity} />;
      case 2:
        return <StepTwo community={community} setCommunity={setCommunity} />;
      case 3:
        return (
          <StepThree
            error={error ?? null}
            community={community}
            setCommunity={setCommunity}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      className="flex flex-col bg-bg-semi-white p-6 noScroll overflow-y-auto rounded-xl w-[calc(100vw-50px)] md:max-w-[80vw] lg:max-w-[50vw] min-h-[60vh] max-h-[90vh] transition-all duration-300"
    >
      {renderStep()}

      <div className="flex justify-between flex-row flex-wrap pt-4">
        <div className="flex items-center gap-x-4">
          <div className="flex gap-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-[6px] h-[6px] rounded-full ${
                  step === i ? "bg-bg-red" : "bg-[#C4C4C4]"
                }`}
              />
            ))}
          </div>

          <span className="font-bold text-[14px] text-text-3">{`${step} de 3`}</span>
        </div>

        <div className="flex flex-row items-center flex-wrap gap-x-2">
          <div className="flex flex-row items-center gap-x-2">
            <button
              onClick={handleBack}
              className="flex items-center cursor-pointer justify-center gap-x-2 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2"
            >
              <ArrowLeft size={18} color="#2F2F2F" />
              <span className="font-bold text-[14px] text-text-3">
                {step === 1 ? "Cancelar" : "Atrás"}
              </span>
            </button>
          </div>

          <button
            disabled={
              community.tags.length < 3 ||
              (step === 3 &&
                (community.name.length < 3 ||
                  community.description.length < 10)) ||
              isPending
            }
            style={{ minWidth: step === 3 ? 150 : 0 }}
            className="flex items-center cursor-pointer justify-center gap-x-2 disabled:opacity-50 disabled:cursor-not-allowed bg-bg-yellow rounded-full px-4 py-2"
            onClick={handleNext}
          >
            {isPending ? (
              <Loader size={18} color="#2F2F2F" />
            ) : (
              <span className="font-bold text-sm text-center text-text-1">
                {step !== 3 ? "Siguiente" : "Crear comunidad"}
              </span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
