import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import PagePinchZoom from './components/PagePinchZoom';
import Home from './pages/Home';

// Solo la portada (Home) va en el bloque principal; el resto de páginas se descargan al visitarlas.
const Cards = lazy(() => import('./pages/Cards'));
const CardGuide = lazy(() => import('./pages/CardGuide'));
const RacesPage = lazy(() => import('./pages/RacesPage'));
const Ranking = lazy(() => import('./pages/Ranking'));
const Reglas = lazy(() => import('./pages/Reglas'));
const EnglishEntry = lazy(() => import('./pages/EnglishEntry'));
const AdminCards = lazy(() => import('./pages/AdminCards'));
const FlashNewsAdmin = lazy(() => import('./pages/FlashNewsAdmin'));
const AdminAiLogs = lazy(() => import('./pages/AdminAiLogs'));
const AdminAuctions = lazy(() => import('./pages/AdminAuctions'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminChat = lazy(() => import('./pages/AdminChat'));
const AdminPlayers = lazy(() => import('./pages/AdminPlayers'));
const AdminHeroStats = lazy(() => import('./pages/AdminHeroStats'));
const AdminNetwork = lazy(() => import('./pages/AdminNetwork'));

const PageFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0e0a16' }}>
    <div className="w-8 h-8 border-4 border-[#3c3158] border-t-[#FFD24A] rounded-full animate-spin"></div>
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0e0a16' }}>
        <div className="w-8 h-8 border-4 border-[#3c3158] border-t-[#FFD24A] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<PageFallback />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminCards />} />
      <Route path="/admin/news" element={<FlashNewsAdmin />} />
      <Route path="/admin/ia" element={<AdminAiLogs />} />
      <Route path="/admin/subastas" element={<AdminAuctions />} />
      <Route path="/admin/chat" element={<AdminChat />} />
      <Route path="/admin/jugadores" element={<AdminPlayers />} />
      <Route path="/admin/estadisticas-heroes" element={<AdminHeroStats />} />
      <Route path="/admin/red" element={<AdminNetwork />} />
      <Route path="/cards" element={<Cards />} />
      <Route path="/guiacartas" element={<CardGuide />} />
      <Route path="/races" element={<RacesPage />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/reglas" element={<Reglas />} />
      <Route path="/en" element={<EnglishEntry />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <PagePinchZoom />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App