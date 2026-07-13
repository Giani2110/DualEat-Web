import type { CommunityDTO, UploadableFile } from "@/interface/global.dto";
import { useRef, type Dispatch, type SetStateAction } from "react";
import bgFood from "@assets/images/background-food-2.webp";
import { pickMedia } from "@/utils/media";
import { Image } from "lucide-react";

interface StepProps {
  community: CommunityDTO;
  setCommunity: Dispatch<SetStateAction<CommunityDTO>>;
}

export default function StepTwo({ community, setCommunity }: StepProps) {
  const handleFiles = (files: File[], type: "image_url" | "banner_url") => {
    const media = pickMedia(files, "image");
    if (media.length === 0) return;
    else {
      setCommunity({ ...community, [type]: media[0] });
    }
  };

  const imageRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  return (
    <section className="flex flex-row flex-1 gap-4">
      <aside className="flex flex-col justify-center h-full flex-1 gap-y-3">
        <h1 className="font-bold text-xl text-text-3">
          Personaliza tu comunidad
        </h1>
        <p className="font-outfit-light text-sm text-text-4">
          Agrega una imagen y un banner para tu comunidad así los usuarios
          podrán identificarte mejor
        </p>

        <div className="flex flex-col gap-y-6">
          <button
            onClick={() => {
              bannerRef.current?.click();
            }}
            className="p-2 border border-gray-200 cursor-pointer hover:scale-[1.02] transition-all duration-200 flex flex-col gap-y-2 rounded-lg"
          >
            <img
              src={
                (community.banner_url &&
                  (community.banner_url as UploadableFile).uri) ||
                "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultBanner.jpg"
              }
              className="w-full h-10 rounded-t-[20px] object-cover"
            />

            <div className="flex-1 gap-x-2 items-center flex flex-row">
              <Image size={14} color="#2F2F2F" />

              <p className="text-sm text-text-3">
                {(community?.banner_url as UploadableFile)?.file?.name ||
                  "Agregar banner"}
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              imageRef.current?.click();
            }}
            className="p-2 border border-gray-200 cursor-pointer hover:scale-[1.02] transition-all duration-200 rounded-lg flex items-center flex-row gap-x-4"
          >
            <img
              src={
                (community.image_url &&
                  (community.image_url as UploadableFile).uri) ||
                "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"
              }
              className="w-8 h-8 rounded-full object-cover"
            />

            <div className="flex-1 gap-x-2 items-center flex flex-row">
              <Image size={14} color="#2F2F2F" />
              <p className="text-sm text-text-3">
                {(community?.image_url as UploadableFile)?.file?.name ||
                  "Agregar icono de la comunidad"}
              </p>
            </div>
          </button>
          <input
            type="file"
            ref={bannerRef}
            accept="image/jpeg, image/png, image/webp, image/jpg"
            className="hidden"
            onChange={(e) =>
              handleFiles(Array.from(e.target.files as FileList), "banner_url")
            }
          />
          <input
            type="file"
            ref={imageRef}
            accept="image/jpeg, image/png, image/webp, image/jpg"
            className="hidden"
            onChange={(e) =>
              handleFiles(Array.from(e.target.files as FileList), "image_url")
            }
          />
        </div>
      </aside>

      <section className="flex flex-col flex-1 hidden lg:flex">
        <img
          className="w-full h-full object-cover rounded-xl"
          loading="lazy"
          src={bgFood}
          alt="Background image"
        />
      </section>
    </section>
  );
}
