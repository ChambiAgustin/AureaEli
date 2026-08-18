import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from './MainLayout';

// Carga perezosa (React.lazy) para optimización de bundles (Code Splitting por ruta)
const HomePage = React.lazy(() => import('../../features/home/HomePage'));
const CatalogPage = React.lazy(() => import('../../features/catalog/CatalogPage'));
const RitualsPage = React.lazy(() => import('../../features/rituals/RitualsPage'));
const ProfilePage = React.lazy(() => import('../../features/profile/ProfilePage'));
const CheckoutFlow = React.lazy(() => import('../../features/checkout/CheckoutFlow'));
const AdminPage = React.lazy(() =>
  import('../../features/admin/AdminPage').then((module) => ({
    default: module.AdminPage || module.default,
  }))
);
const NotFoundPage = React.lazy(() => import('../../features/not-found/NotFoundPage'));

/**
 * AppRouter
 * Enrutador principal de la aplicación basado en react-router-dom.
 * Configura las rutas del templo, rutas protegidas con ProtectedRoute y captura 404 sensorial.
 */
export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="rituales" element={<RitualsPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="checkout" element={<CheckoutFlow />} />
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
