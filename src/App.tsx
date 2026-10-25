import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { PageLoader } from './components/ui/Misc';
import { LandingPage } from './pages/LandingPage';

// Everything except the landing page is code-split; the game route pulls in Phaser on demand.
const EventPage = lazy(() => import('./pages/EventPage'));
const VoucherPage = lazy(() => import('./pages/VoucherPage'));
const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout'));
const OverviewPage = lazy(() => import('./pages/dashboard/OverviewPage'));
const EventsPage = lazy(() => import('./pages/dashboard/EventsPage'));
const EventEditorPage = lazy(() => import('./pages/dashboard/EventEditorPage'));
const VouchersPage = lazy(() => import('./pages/dashboard/VouchersPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo/:slug" element={<EventPage />} />
          <Route path="/e/:slug" element={<EventPage />} />
          <Route path="/voucher/:code" element={<VoucherPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/new" element={<EventEditorPage />} />
            <Route path="events/:id" element={<EventEditorPage />} />
            <Route path="vouchers" element={<VouchersPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
