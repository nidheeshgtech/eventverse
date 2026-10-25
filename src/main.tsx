import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { env } from './config/env';
import { prefersReducedMotion } from './hooks/useReducedMotion';
import { ToastProvider } from './components/ui/Toast';
import './styles/index.css';

if (!prefersReducedMotion()) document.documentElement.classList.add('js-motion');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={env.basePath || undefined} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
