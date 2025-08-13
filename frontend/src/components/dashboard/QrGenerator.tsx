import { useState, useEffect } from 'react';

const QrGenerator = () => {
  // Simulamos la obtención del ID del local desde el contexto de autenticación
  const localId = 1; 

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Usamos useEffect para generar el QR automáticamente al cargar el componente
  useEffect(() => {
    const fetchQrCode = async () => {
      setLoading(true);
      setError('');
      setQrCodeUrl('');

      try {
        const response = await fetch(`http://localhost:3000/api/qr/${localId}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setQrCodeUrl(data.qrCodeDataUrl);
      } catch (err: any) {
        setError('No se pudo generar el código QR. Intenta de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQrCode();
  }, [localId]); // Se ejecutará cuando localId cambie (en un entorno real)

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {loading && (
        <p className="text-gray-600">Generando código QR para el Local {localId}...</p>
      )}

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      {qrCodeUrl && (
        <div className="mt-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Código QR de tu local</h2>
          <img 
            src={qrCodeUrl} 
            alt={`Código QR del local ${localId}`} 
            className="w-48 h-48 border border-gray-300 p-2 rounded-md" 
          />
          <a
            href={qrCodeUrl}
            download={`qr-local-${localId}.png`}
            className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Descargar QR
          </a>
        </div>
      )}
    </div>
  );
};

export default QrGenerator;