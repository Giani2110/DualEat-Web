import { useState, useEffect, useContext } from 'react';
import { Download, QrCode, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../../context/auth/AuthContext';
import '../../assets/scss/users/users.scss';

interface QrResponse {
  qrCodeDataUrl: string;
  message: string;
}

const LocalQR = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [localId, setLocalId] = useState<number | null>(null);
  const [localName, setLocalName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    const fetchUserLocal = async () => {
      if (!user) {
        setLoading(false);
        setError('Usuario no autenticado');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/users/${user.id}/local`);
        if (!res.ok) throw new Error('No se pudo obtener el local para este usuario.');

        const data = await res.json();
        if (data?.id) {
          setLocalId(data.id);
          setLocalName(data.name);
        } else {
          setError('No se encontró un local asociado a este usuario.');
        }
      } catch (err) {
        console.error(err);
        setError('Error al obtener el local del usuario.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserLocal();
  }, [user, API_BASE]);

  useEffect(() => {
    const fetchQrCode = async () => {
      if (!localId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/qr/${localId}`);
        if (!response.ok) throw new Error('Error al cargar el código QR.');

        const data: QrResponse = await response.json();
        setQrDataUrl(data.qrCodeDataUrl);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el código QR. Intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchQrCode();
  }, [localId, API_BASE]);

  const downloadQr = (format: 'png' | 'jpg') => {
    if (!qrDataUrl || !localName) {
      setError('No se pudo generar el nombre del archivo.');
      return;
    }
    const sanitizedLocalName = localName.trim().toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `menu_${sanitizedLocalName}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="text-center text-white p-8">Cargando código QR...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-4 bg-gray-800 rounded-xl">
        <AlertTriangle className="inline mr-2" />
        {error}
      </div>
    );
  }

  if (!localId) {
    return <div className="text-center text-gray-400 p-8">No se encontró un local asociado.</div>;
  }

  return (
    <div className="bgFood2 min-h-screen text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold pt-12 text-white mb-2">Gestión de QR</h1>
            <p className="text-gray-400">
              Descarga y comparte tu código QR para que tus clientes accedan al menú.
            </p>
          </div>
        </header>

        <section className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-lg border border-gray-700 mb-8 flex flex-col items-center text-center">
          <QrCode className="w-16 h-16 text-blue-400 mb-4" />
          <h3 className="text-2xl font-semibold text-white mb-2">Tu Código QR Personalizado</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-lg">
            Este código QR único enlaza directamente al menú digital de tu local.
            Puedes imprimirlo para que tus clientes lo escaneen fácilmente.
          </p>

          <div className="bg-white p-4 rounded-xl shadow-inner mb-6">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Código QR del menú" className="w-64 h-64 mx-auto" />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-200 rounded-xl text-gray-500">
                <p>Generando QR...</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
                onClick={() => downloadQr('png')}
                disabled={!qrDataUrl}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors 
                            bg-gray-900 hover:bg-gray-700 text-white 
                            disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                <Download size={20} />
                <span>Descargar PNG</span>
                </button>

                <button
                onClick={() => downloadQr('jpg')}
                disabled={!qrDataUrl}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors 
                            bg-gray-900 hover:bg-gray-700 text-white 
                            disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                <Download size={20} />
                <span>Descargar JPG</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LocalQR;