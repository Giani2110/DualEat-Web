import type { UploadableFile } from "@/interface/global.dto";

const MAX_IMAGE_SIZE_MB = 3;
const MAX_VIDEO_SIZE_MB = 30;

const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/mov", "video/avi"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

export const pickMedia = (files: File[], type: "image" | "video"): UploadableFile[] => {
  const filesValid: UploadableFile[] = [];

  switch (type) {
    case "image": {
      const validFiles = files.filter(
        (f) =>
          IMAGE_TYPES.some((t) => f.type.startsWith(t)) &&
          f.size <= MAX_IMAGE_SIZE_BYTES
      );

      const allowedFiles = validFiles.slice(0, 10);

      const newImages: UploadableFile[] = allowedFiles.map((file) => ({
        file,
        uri: URL.createObjectURL(file),
      }));

      filesValid.push(...newImages);
      break;
    }

    case "video": {
      const validVideo = files.find(
        (f) =>
          VIDEO_TYPES.some((t) => f.type.startsWith(t)) &&
          f.size <= MAX_VIDEO_SIZE_BYTES
      );

      if (validVideo) {
        filesValid.push({
          file: validVideo,
          uri: URL.createObjectURL(validVideo),
        });
      }
      break;
    }
  }

  return filesValid;
};
