import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePublicPage } from '../../hooks/useAuthRedirect';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastShown = useRef(false);
  
  const { login, error, clearError } = useAuth();
  const { isLoading } = usePublicPage('/inicio');

  // Limpiar errores cuando se monta el componente - SOLO UNA VEZ
  useEffect(() => {
    clearError();
    toastShown.current = false;
  }, []); // Dependencias vacías

  // Mostrar error si existe - EVITAR DOBLES TOASTS
  useEffect(() => {
    if (error && !toastShown.current) {
      toast.error(error);
      toastShown.current = true;
    }
    if (!error) {
      toastShown.current = false;
    }
  }, [error]);

  // Memoizar la función handleChange para evitar re-creaciones
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      clearError();
      toastShown.current = false;
    }
  }, [error, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        toast.success(result.message);
        // La redirección se maneja automáticamente por el hook usePublicPage
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error inesperado durante el login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            
            {/* Panel izquierdo - Formulario */}
            <div className="flex-1 p-6 sm:p-8 lg:p-12 flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Iniciar Sesión
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Bienvenido! Por favor, inicie sesión para continuar.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Usuario
                    </label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="Ingrese su usuario"
                      value={formData.username}
                      onChange={handleChange}
                      variant="bordered"
                      size="lg"
                      isRequired
                      radius="lg"
                      className="w-full"
                      classNames={{
                        base: "max-w-full",
                        mainWrapper: "h-full",
                        input: [
                          "bg-white",
                          "text-black",
                          "placeholder:text-gray-500",
                          "text-base sm:text-lg",
                          "px-4 py-3"
                        ],
                        innerWrapper: "bg-white",
                        inputWrapper: [
                          "bg-white",
                          "border-gray-300",
                          "hover:border-blue-400",
                          "group-data-[focused=true]:border-blue-500",
                          "group-data-[focused=true]:ring-2",
                          "group-data-[focused=true]:ring-blue-200",
                          "!cursor-text",
                          "shadow-sm",
                          "hover:shadow-md",
                          "transition-all",
                          "duration-200",
                          "min-h-[56px] sm:min-h-[60px]"
                        ]
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <Input
                      id="password"
                      name="password"
                      placeholder="Ingrese su contraseña"
                      value={formData.password}
                      onChange={handleChange}
                      variant="bordered"
                      size="lg"
                      isRequired
                      radius="lg"
                      type={isVisible ? "text" : "password"}
                      className="w-full"
                      classNames={{
                        base: "max-w-full",
                        mainWrapper: "h-full",
                        input: [
                          "bg-white",
                          "text-black",
                          "placeholder:text-gray-500",
                          "text-base sm:text-lg",
                          "px-4 py-3"
                        ],
                        innerWrapper: "bg-white",
                        inputWrapper: [
                          "bg-white",
                          "border-gray-300",
                          "hover:border-blue-400",
                          "group-data-[focused=true]:border-blue-500",
                          "group-data-[focused=true]:ring-2",
                          "group-data-[focused=true]:ring-blue-200",
                          "!cursor-text",
                          "shadow-sm",
                          "hover:shadow-md",
                          "transition-all",
                          "duration-200",
                          "min-h-[56px] sm:min-h-[60px]"
                        ]
                      }}
                      endContent={
                        <button
                          className="focus:outline-none p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                          type="button"
                          onClick={toggleVisibility}
                          aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {isVisible ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                          )}
                        </button>
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    radius="lg"
                    className="w-full font-semibold text-base sm:text-lg h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </div>
            </div>

            {/* Panel derecho - Imagen y branding */}
            <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden flex flex-col justify-center min-h-[300px] lg:min-h-auto">
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                  ¡Bienvenido!
                </h2>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-6 text-blue-100">
                  Somos PuntoSur
                </h3>
                <p className="text-blue-100 text-base sm:text-lg lg:text-xl leading-relaxed">
                  Panel de administración para gestionar tu tienda online. 
                  Controla pedidos, productos, ofertas y mucho más desde un solo lugar.
                </p>
              </div>
              
              {/* Elementos decorativos responsivos */}
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-blue-500 rounded-full opacity-20 -translate-y-16 sm:-translate-y-24 lg:-translate-y-32 translate-x-16 sm:translate-x-24 lg:translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 bg-blue-500 rounded-full opacity-20 translate-y-12 sm:translate-y-18 lg:translate-y-24 -translate-x-12 sm:-translate-x-18 lg:-translate-x-24"></div>
              
              {/* Elemento decorativo adicional para móvil */}
              <div className="absolute top-1/2 right-4 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-blue-400 rounded-full opacity-10 lg:hidden"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;