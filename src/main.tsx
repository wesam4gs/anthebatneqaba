import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageThemeProvider } from './context/LanguageThemeContext';
import { registerInspectorOfflineRuntime } from './offline/registerOffline';
import './index.css';

registerInspectorOfflineRuntime();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageThemeProvider>
      <App />
    </LanguageThemeProvider>
  </StrictMode>,
);
