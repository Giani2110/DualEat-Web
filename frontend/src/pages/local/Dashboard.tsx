import QrGenerator from '../../components/dashboard/QrGenerator';

const Dashboard = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">Dashboard del Local</h1>
        <p className="mt-2 text-lg text-gray-600">
          Bienvenido al panel de control de tu local gastronómico.
        </p>
      </header>
      
      <main className="max-w-4xl mx-auto">
        <section className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Generador de Código QR</h2>
          <p className="text-gray-600 mb-6">
            Este es tu código QR personal. Escanéalo para ver tu menú digital.
          </p>
          <div className="border-t border-gray-200 pt-6">
            <QrGenerator />
          </div>
        </section>
        
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Otras Funcionalidades</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Gestión del Menú (próximamente)</li>
            <li>Estadísticas de Venta (próximamente)</li>
            <li>Reseñas de Clientes (próximamente)</li>
          </ul>
        </section>
      </main>
      
      <footer className="text-center mt-10 text-gray-500 text-sm">
        <p>&copy; 2024 DualEat. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Dashboard;