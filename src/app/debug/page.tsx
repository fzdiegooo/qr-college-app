import AuthDebugComponent from '@/components/AuthDebugComponent';

export default function DebugPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🔧 Página de Debug - Autenticación
        </h1>
        <p className="text-gray-600">
          Información detallada sobre el estado de autenticación del usuario
        </p>
      </div>
      
      <AuthDebugComponent />
    </div>
  );
}