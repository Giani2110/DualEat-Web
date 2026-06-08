export const getCroppedImg = (
  imageSrc: string,
  pixelCrop: any,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("No se pudo obtener el contexto 2D del canvas"));
        return;
      }

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );

      // Devuelve la imagen recortada en formato base64 (o usa canvas.toBlob() si necesitas un Blob/File)
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas vacío"));
          return;
        }
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg");
    };

    image.onerror = (error) => reject(error);
  });
};
