import React from 'react';
import { AppRouter } from './core/router';

/**
 * App
 * Punto de entrada principal de componentes en Aurea Elizabeth.
 * Delega la gestión de vistas y layout persistente a AppRouter.
 */
export function App() {
  return <AppRouter />;
}

export default App;
