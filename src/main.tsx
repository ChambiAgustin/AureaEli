import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './core/design-system/index.css'
import App from './App.tsx'
import { AppProviders } from './core/context'
import { ErrorBoundary } from './shared/components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
)

