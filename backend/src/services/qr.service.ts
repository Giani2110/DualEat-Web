import { PrismaClient } from '@prisma/client';
import qrcode from 'qrcode';
import { QrResponse } from '../interfaces/qr.interfaces';

const prisma = new PrismaClient();

export const generateQrForLocal = async (localId: number): Promise<QrResponse> => {
  // 1. Buscar el local en la base de datos para validar su existencia.
  const local = await prisma.local.findUnique({
    where: { id: localId },
  });

  if (!local) {
    throw new Error('Local no encontrado');
  }

  // 2. Construir la URL a la que el QR redirigirá.
  const urlDelMenu = `http://localhost:5000/menu/${localId}`;

  // 3. Generar el código QR como un Data URL.
  const qrCodeDataUrl = await qrcode.toDataURL(urlDelMenu);

  // 4. Devolver la respuesta formateada.
  return {
    qrCodeDataUrl,
    message: 'Código QR generado exitosamente',
  };
};