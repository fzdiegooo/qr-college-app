'use client';

import { useAuthData, useUser, useAuthToken } from '@/hooks';

export default function AuthDebugComponent() {
  const { authData, isAuthenticated, isLoading, error } = useAuthData();
  const { 
    user, 
    userId, 
    userEmail, 
    userRole, 
    isEmailVerified, 
    lastSignIn 
  } = useUser();
  const { 
    accessToken, 
    refreshToken, 
    expiresAt, 
    expiresIn 
  } = useAuthToken();

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p>Cargando datos de autenticación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">
        <p>Usuario no autenticado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-100 text-green-700 rounded-lg">
        <h3 className="font-bold text-lg mb-2">✅ Usuario Autenticado</h3>
      </div>

      {/* Información del Usuario */}
      <div className="p-4 bg-white border rounded-lg shadow">
        <h4 className="font-semibold text-gray-800 mb-3">👤 Información del Usuario</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-600">ID:</span>
            <p className="text-gray-900 font-mono">{userId}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Email:</span>
            <p className="text-gray-900">{userEmail}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Rol:</span>
            <p className="text-gray-900">{userRole}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Email Verificado:</span>
            <p className={`font-medium ${isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
              {isEmailVerified ? 'Sí' : 'No'}
            </p>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-gray-600">Último Login:</span>
            <p className="text-gray-900">
              {lastSignIn ? lastSignIn.toLocaleString('es-ES') : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Información del Token */}
      <div className="p-4 bg-white border rounded-lg shadow">
        <h4 className="font-semibold text-gray-800 mb-3">🔑 Información del Token</h4>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-gray-600">Expira en:</span>
            <p className="text-gray-900">{expiresIn} segundos</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Expira el:</span>
            <p className="text-gray-900">
              {expiresAt ? expiresAt.toLocaleString('es-ES') : 'N/A'}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Access Token (primeros 50 chars):</span>
            <p className="text-gray-900 font-mono text-xs bg-gray-100 p-2 rounded break-all">
              {accessToken ? `${accessToken.substring(0, 50)}...` : 'N/A'}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Refresh Token:</span>
            <p className="text-gray-900 font-mono text-xs bg-gray-100 p-2 rounded">
              {refreshToken || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Datos RAW completos */}
      <details className="bg-white border rounded-lg shadow">
        <summary className="p-4 cursor-pointer font-semibold text-gray-800 hover:bg-gray-50">
          🔍 Ver datos completos (JSON)
        </summary>
        <div className="p-4 border-t">
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
            {JSON.stringify(authData, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}