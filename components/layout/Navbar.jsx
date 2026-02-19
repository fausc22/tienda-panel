// components/layout/Navbar.jsx - Navegación principal responsiva
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { 
  HomeIcon, 
  CubeIcon, 
  DocumentTextIcon, 
  CogIcon, 
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Opciones del menú base
  const allMenuItems = [
    {
      name: 'Inicio',
      href: '/inicio',
      icon: HomeIcon,
      description: 'Panel principal',
      roles: ['admin', 'kiosco'] // Todos los roles pueden ver Inicio
    },
    {
      name: 'Productos',
      href: '/productos',
      icon: CubeIcon,
      description: 'Gestión de inventario',
      roles: ['admin'] // Solo admin
    },
    {
      name: 'Página',
      href: '/pagina',
      icon: DocumentTextIcon,
      description: 'Configuración web',
      roles: ['admin'] // Solo admin
    },
    {
      name: 'Estadísticas',
      href: '/estadisticas',
      icon: ChartBarIcon,
      description: 'Reportes y métricas',
      roles: ['admin'] // Solo admin
    },
    {
      name: 'Usuarios',
      href: '/usuarios',
      icon: UserGroupIcon,
      description: 'Gestión de usuarios',
      roles: ['admin'] // Solo admin
    }
  ];

  // Filtrar menú según el rol del usuario
  const menuItems = allMenuItems.filter(item => {
    const userRol = user?.rol?.toLowerCase() || 'admin';
    return item.roles.includes(userRol);
  });

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path) => {
    return router.pathname === path;
  };

  return (
    <>
      {/* Navbar principal - Desktop */}
      <nav className="bg-white shadow-lg border-b border-gray-200 relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo y título */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">PS</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-800">PuntoSur</h1>
                  <p className="text-xs text-gray-500">Panel Admin</p>
                </div>
              </div>
            </div>

            {/* Menú principal - Desktop */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      title={item.description}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Información del usuario y logout - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Usuario */}
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <UserIcon className="h-4 w-4" />
                <span className="font-medium">{user?.nombre || user?.username}</span>
              </div>

              {/* Botón logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                title="Cerrar sesión"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span>Salir</span>
              </button>
            </div>

            {/* Botón menú móvil */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md text-gray-600 hover:text-gray-900 transition-colors duration-200"
                aria-label="Abrir menú"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden bg-white border-t border-gray-200`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            
            {/* Información del usuario móvil */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {user?.nombre || user?.username}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user?.rol === 'admin' ? 'Administrador' : 'Kiosco'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enlaces del menú móvil */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </Link>
              );
            })}

            {/* Botón logout móvil */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 mt-4 border-t border-gray-200 pt-4"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay para cerrar menú móvil */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
};

export default Navbar;