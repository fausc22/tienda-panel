import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { normalizeRoute, buildAssetPath } from '../utils/pathHelper';
import Head from 'next/head';

const HomePage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('✅ User authenticated, redirecting to /inicio');
        router.replace(normalizeRoute('/inicio'));
      } else {
        console.log('🔒 User not authenticated, redirecting to /login');
        router.replace(normalizeRoute('/login'));
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Pantalla de carga mientras se resuelve la redirección
  return (
    <>
      <Head>
        <title>Panel Admin - PuntoSur</title>
        <meta name="description" content="Panel de administración de PuntoSur" />
        <link rel="icon" href="https://vps-5234411-x.dattaweb.com/api/images/favicon-panel.ico" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Logo o icono */}
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </div>

          {/* Spinner de carga */}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          
          {/* Texto de carga */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">
              Panel Admin - PuntoSur
            </h2>
            <p className="text-gray-600">
              {isLoading ? 'Verificando sesión...' : 'Redirigiendo...'}
            </p>
          </div>

          {/* Puntos de carga animados */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;