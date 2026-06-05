import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './core/design-system/index.css'
import App from './App.tsx'
import { ToastProvider } from './core/context/ToastContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
