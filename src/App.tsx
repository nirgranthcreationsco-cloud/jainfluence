import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './presentation/store/authStore';
import { OnboardingScreen } from './presentation/screens/OnboardingScreen';
import { LoginScreen } from './presentation/screens/LoginScreen';
import { SignupScreen } from './presentation/screens/SignupScreen';
import { ExploreScreen } from './presentation/screens/ExploreScreen';
import { CreatorsScreen } from './presentation/screens/CreatorsScreen';
import { ProfileScreen } from './presentation/screens/ProfileScreen';
import { CommunityScreen } from './presentation/screens/CommunityScreen';
import { OpportunitiesScreen } from './presentation/screens/OpportunitiesScreen';
import { NotificationsScreen } from './presentation/screens/NotificationsScreen';
import { HiringSummaryScreen } from './presentation/screens/HiringSummaryScreen';
import { NavBar } from './presentation/components/NavBar';
import { SplashScreen } from './presentation/screens/SplashScreen';

// App layout wrapper — handles auth state and routing guards
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitializing, initSession } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initSession();
  }, [initSession]);

  const isAuthRoute = ['/login', '/signup', '/onboarding'].includes(location.pathname);

  // While session is loading
  if (isInitializing) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
      </div>
    );
  }

  // Redirect logged-in users away from auth pages
  if (user && isAuthRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ flex: 1 }}>{children}</div>
      {/* NavBar shown to everyone — guests can browse */}
      {!isAuthRoute && location.pathname !== '/onboarding' && <NavBar />}
    </div>
  );
};

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Auth */}
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />

          {/* Main App — accessible to guests */}
          <Route path="/" element={<ExploreScreen />} />
          <Route path="/creators" element={<CreatorsScreen />} />
          <Route path="/community" element={<CommunityScreen />} />
          <Route path="/opportunities" element={<OpportunitiesScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/profile/:id" element={<ProfileScreen />} />

          {/* V2 — Marketplace */}
          <Route path="/notifications" element={<NotificationsScreen />} />
          <Route path="/hiring-summary" element={<HiringSummaryScreen />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
