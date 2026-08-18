import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './core/design-system/index.css'
import App from './App.tsx'
import { AppProviders } from './core/context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
