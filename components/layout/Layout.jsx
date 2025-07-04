// components/layout/Layout.jsx - Layout principal con navbar
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Páginas que no requieren navbar (login, index)
  const pagesWithoutNavbar = ['/', '/login'];
  const showNavbar = isAuthenticated && !pagesWithoutNavbar.includes(router.pathname);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar condicional */}
      {showNavbar && <Navbar />}
      
      {/* Contenido principal */}
      <main className={showNavbar ? 'pt-0' : ''}>
        {children}
      </main>
    </div>
  );
};

export default Layout;