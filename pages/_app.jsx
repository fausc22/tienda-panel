import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { PedidosProvider } from '../context/PedidosContext';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <AuthProvider>
      <PedidosProvider>
      <AnimatePresence mode="wait" initial={false}>
        <div key={router.route}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
          
          {/* Configuración global de notificaciones */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#22c55e',
                  color: 'white',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#22c55e',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#ef4444',
                  color: 'white',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#ef4444',
                },
              },
              loading: {
                style: {
                  background: '#3b82f6',
                  color: 'white',
                },
              },
            }}
          />
        </div>
      </AnimatePresence>
      </PedidosProvider>
    </AuthProvider>
  );
}

export default MyApp;