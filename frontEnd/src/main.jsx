import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import "@mantine/core/styles.css";
import "./css/global.css"
import { MantineProvider } from '@mantine/core';

import App from './App.jsx'
import { theme } from './theme/theme.js';


createRoot(
  document.getElementById('root')
).render(
  <StrictMode>
    <MantineProvider
      theme={theme}
      defaultColorScheme="light"
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>
);
