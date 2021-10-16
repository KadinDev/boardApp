// esse _app que vai ficar renderizando todas as páginas
// se eu quiser compartilhar um mesmo algo para todas as páginas terei que colocar por aqui

import { AppProps } from 'next/app';

import '../styles/global.scss';
import { Header } from '../components/Header';

//colocar por toda a aplicação pq o paypal vai estar englobado em todas as pages
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// import o Provider, renomeio ele de NextAuthProvider.
// o provider é para compartilhar as informações do user em toda a aplicação
import { Provider as NextAuthProvider } from 'next-auth/client';

const initialOptions = {
  "client-id": "AZC0Gl59kkIhlMu1cvndwAJPodWWV1yLKu2tfWZF5UGuemZpXWW_ziXpFZ8_Kl5d_u60L5VsQ8LjG-jJ",
  currency: "BRL",
  intent: 'capture'
}

// aqui já estou tipando  : AppProps
function MyApp({ Component, pageProps } : AppProps  ) {

  return (
    <NextAuthProvider 
      // propriedade chamada session, que é a propriedade da sessão que vai estar dentro
      // das páginas
      session={pageProps.session} 
    >
      <PayPalScriptProvider
      options={initialOptions}
      >
        <Header />
        <Component {...pageProps} 
        // Component serão as páginas da aplicação
        />
      </PayPalScriptProvider>

    </NextAuthProvider>
  )

}

export default MyApp
