import { PrismaClient } from "@prisma/client";
import qrcode from "qrcode";
import { QrResponse } from "../../../interfaces/qr.interfaces";

const prisma = new PrismaClient();

export const generateQrForLocal = async (
  localId: string
): Promise<QrResponse> => {
  // 1. Buscar el local en la base de datos para validar su existencia y obtener su nombre.
  const local = await prisma.local.findUnique({
    where: { id: localId },
  });

  if (!local) {
    throw new Error("Local no encontrado");
  } // 2. Sanitizar el nombre del local para usarlo en una URL.
  // Reemplazamos los espacios con guiones bajos y removemos caracteres especiales.

  const sanitizedLocalName = local.name
    .trim()
    .toLowerCase()
    .replace(/ /g, "_")
    .replace(/[^a-z0-9_]/g, ""); // 3. Construir la nueva URL con el nombre del local sanitizado.

  const urlDelMenu = `http://localhost:5000/menu/${sanitizedLocalName}`; // 4. Generar el código QR como un Data URL.

  const qrCodeDataUrl = await qrcode.toDataURL(urlDelMenu); // 5. Devolver la respuesta formateada.

  return {
    qrCodeDataUrl,
    message: "Código QR generado exitosamente",
  };
};
