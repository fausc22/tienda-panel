// pages/usuarios.jsx - Página de gestión de usuarios
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useProtectedPage } from '../hooks/useAuthRedirect';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

// Hooks
import { useUsuarios } from '../hooks/usuarios/useUsuarios';

// Componentes
import TablaUsuarios from '../components/usuarios/TablaUsuarios';
import ModalCrearUsuario from '../components/usuarios/ModalCrearUsuario';
import ModalEditarPassword from '../components/usuarios/ModalEditarPassword';
import ModalEliminarUsuario from '../components/usuarios/ModalEliminarUsuario';

function UsuariosContent() {
  // Hook de autenticación y protección - Solo admin puede acceder
  const { isLoading: authLoading } = useProtectedPage(['admin']);
  const { user } = useAuth();

  // Estados para modales
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditarPassword, setMostrarModalEditarPassword] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Hook de gestión de usuarios
  const {
    usuarios,
    loading,
    cargarUsuarios,
    crearUsuario,
    actualizarPassword,
    eliminarUsuario
  } = useUsuarios();

  // Cargar usuarios al montar
  useEffect(() => {
    if (!authLoading && user) {
      cargarUsuarios();
    }
  }, [user, authLoading, cargarUsuarios]);

  // Handlers
  const handleCrearUsuario = () => {
    setUsuarioSeleccionado(null);
    setMostrarModalCrear(true);
  };

  const handleEditarPassword = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarModalEditarPassword(true);
  };

  const handleEliminarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarModalEliminar(true);
  };

  const handleConfirmarCrear = async (datosUsuario) => {
    const exito = await crearUsuario(datosUsuario);
    if (exito) {
      setMostrarModalCrear(false);
      await cargarUsuarios();
    }
  };

  const handleConfirmarEditarPassword = async (password) => {
    if (!usuarioSeleccionado) return;
    
    const exito = await actualizarPassword(usuarioSeleccionado.id, password);
    if (exito) {
      setMostrarModalEditarPassword(false);
      setUsuarioSeleccionado(null);
      await cargarUsuarios();
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!usuarioSeleccionado) return;
    
    const exito = await eliminarUsuario(usuarioSeleccionado.id);
    if (exito) {
      setMostrarModalEliminar(false);
      setUsuarioSeleccionado(null);
      await cargarUsuarios();
    }
  };

  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4">
      <Head>
        <title>USUARIOS | PANEL ADMIN - PUNTOSUR</title>
        <meta name="description" content="Gestión de usuarios del panel - PuntoSur" />
      </Head>
      
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                Gestión de Usuarios
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {getSaludo()}, {user?.nombre || user?.username}. Administra los usuarios del panel
              </p>
            </div>
            
            <button
              onClick={handleCrearUsuario}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <TablaUsuarios
            usuarios={usuarios}
            loading={loading}
            onEditarPassword={handleEditarPassword}
            onEliminar={handleEliminarUsuario}
          />
        </div>
      </div>

      {/* MODALES */}
      {mostrarModalCrear && (
        <ModalCrearUsuario
          mostrar={mostrarModalCrear}
          onCerrar={() => setMostrarModalCrear(false)}
          onConfirmar={handleConfirmarCrear}
        />
      )}

      {mostrarModalEditarPassword && usuarioSeleccionado && (
        <ModalEditarPassword
          mostrar={mostrarModalEditarPassword}
          usuario={usuarioSeleccionado}
          onCerrar={() => {
            setMostrarModalEditarPassword(false);
            setUsuarioSeleccionado(null);
          }}
          onConfirmar={handleConfirmarEditarPassword}
        />
      )}

      {mostrarModalEliminar && usuarioSeleccionado && (
        <ModalEliminarUsuario
          mostrar={mostrarModalEliminar}
          usuario={usuarioSeleccionado}
          onCerrar={() => {
            setMostrarModalEliminar(false);
            setUsuarioSeleccionado(null);
          }}
          onConfirmar={handleConfirmarEliminar}
        />
      )}
    </div>
  );
}

export default function UsuariosPage() {
  return <UsuariosContent />;
}

