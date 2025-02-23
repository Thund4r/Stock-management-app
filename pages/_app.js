import '@styles/globals.css'
import '@mantine/core/styles.css'; 
import '@mantine/dates/styles.css';
import { MantineProvider } from '@mantine/core';

function Application({ Component, pageProps }) {
  return (

    <MantineProvider>
      <Component {...pageProps} />
    </MantineProvider>

  );
}

export default Application
