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
import Cards from './pages/Cards';
import CardGuide from './pages/CardGuide';
import RacesPage from './pages/RacesPage';
import Ranking from './pages/Ranking';
import Reglas from './pages/Reglas';
import EnglishEntry from './pages/EnglishEntry';
import AdminCards from './pages/AdminCards';
import FlashNewsAdmin from './pages/FlashNewsAdmin';
import AdminAiLogs from './pages/AdminAiLogs';
import AdminAuctions from './pages/AdminAuctions';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminChat from './pages/AdminChat';

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
      <Route path="/cards" element={<Cards />} />
      <Route path="/guiacartas" element={<CardGuide />} />
      <Route path="/races" element={<RacesPage />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/reglas" element={<Reglas />} />
      <Route path="/en" element={<EnglishEntry />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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