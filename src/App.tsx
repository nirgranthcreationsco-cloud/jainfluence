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
import { NavBar } from './presentation/components/NavBar';
import { SplashScreen } from './presentation/screens/SplashScreen';

// Protected layout wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, hasCompletedOnboarding, isInitializing, initSession } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initSession();
  }, [initSession]);

  const isAuthRoute = ['/login', '/signup', '/onboarding'].includes(location.pathname);

  // If session is still loading
  if (isInitializing) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
      </div>
    );
  }

  // Redirect to Onboarding
  if (!hasCompletedOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to Login if not logged in and not on auth page
  if (hasCompletedOnboarding && !user && !isAuthRoute) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if logged in and trying to access auth pages
  if (user && isAuthRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ flex: 1 }}>{children}</div>
      {user && !isAuthRoute && <NavBar />}
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
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/" element={<ExploreScreen />} />
          <Route path="/creators" element={<CreatorsScreen />} />
          <Route path="/community" element={<CommunityScreen />} />
          <Route path="/opportunities" element={<OpportunitiesScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/profile/:id" element={<ProfileScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
