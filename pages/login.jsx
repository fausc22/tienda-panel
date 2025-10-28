import Head from 'next/head';
import Login from '../components/auth/Login';

const LoginPage = () => {
  return (
    <>
      <Head>
        <title>Iniciar Sesión - Panel Admin PuntoSur</title>
        <meta name="description" content="Iniciar sesión en el panel de administración de PuntoSur" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="https://vps-5234411-x.dattaweb.com/api/images/favicon-panel.ico" />
      </Head>
      
      <Login />
    </>
  );
};

export default LoginPage;