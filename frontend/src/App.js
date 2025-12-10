import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoaderProvider } from './context/LoaderContext';
import { 
  LoadingScreen, 
  ErrorBoundary, 
  BottomNav, 
  InstallPrompt 
} from './components/common';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const HomePage = lazy(() => import('./pages/dashboard/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));
const OTPVerificationPage = lazy(() => import('./pages/auth/OTPVerificationPage'));
const CheckEmailPage = lazy(() => import('./pages/auth/CheckEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const MarketplacePage = lazy(() => import('./pages/marketplace/MarketplacePage'));
const ListingDetailPage = lazy(() => import('./pages/listing/ListingDetailPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const ActivityPage = lazy(() => import('./pages/activity/ActivityPage'));
const KYCPage = lazy(() => import('./pages/kyc/KYCPage'));
const ReferralsPage = lazy(() => import('./pages/referrals/ReferralsPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const MyPostsPage = lazy(() => import('./pages/trading/MyPostsPage'));
const BidsPage = lazy(() => import('./pages/trading/BidsPage'));
const PortfolioPage = lazy(() => import('./pages/portfolio/PortfolioPage'));
const HistoryPage = lazy(() => import('./pages/history/HistoryPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Legal pages
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/legal/CookiePolicy'));
const HelpSupport = lazy(() => import('./pages/legal/HelpSupport'));

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Suspense fallback handles loading
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
}

// Public Route wrapper (redirect to landing if not authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Suspense fallback handles loading
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Layout with bottom navigation
function AppLayout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Landing page - public */}
          <Route path="/welcome" element={<LandingPage />} />
          
          {/* Public website pages - no auth required */}
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* Protected routes with bottom nav */}
          <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><AppLayout><MarketplacePage /></AppLayout></ProtectedRoute>} />
          <Route path="/listing/:id" element={<ProtectedRoute><AppLayout><ListingDetailPage /></AppLayout></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><AppLayout><ActivityPage /></AppLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
          
          {/* Additional protected routes - all with bottom nav */}
          <Route path="/kyc" element={<ProtectedRoute><AppLayout><KYCPage /></AppLayout></ProtectedRoute>} />
          <Route path="/referrals" element={<ProtectedRoute><AppLayout><ReferralsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><AppLayout><NotificationsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/my-posts" element={<ProtectedRoute><AppLayout><MyPostsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/bids" element={<ProtectedRoute><AppLayout><BidsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><AppLayout><PortfolioPage /></AppLayout></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><AppLayout><HistoryPage /></AppLayout></ProtectedRoute>} />

          {/* Legal pages - public */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/help" element={<HelpSupport />} />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LoaderProvider>
          <AppRoutes />
          <InstallPrompt />
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
              },
            }}
          />
        </LoaderProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
