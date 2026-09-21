import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageThemeProvider } from './context/LanguageThemeContext';
import { registerInspectorOfflineRuntime } from './offline/registerOffline';
import './index.css';

registerInspectorOfflineRuntime();

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-app', 'inspector');
  document.body.setAttribute('data-app', 'inspector');
  document.documentElement.style.setProperty('background-color', '#0b1220', 'important');
  document.body.style.setProperty('background-color', '#0b1220', 'important');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageThemeProvider>
      <App isMobileOnly={true} />
    </LanguageThemeProvider>
  </StrictMode>,
);
