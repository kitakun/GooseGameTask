import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import RoundsPage from './pages/RoundsPage.tsx';
import RoundPage from './pages/RoundPage.tsx';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner.tsx';

const App = () => {
  const { user, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/rounds" replace /> : <LoginPage />} 
          />
          <Route 
            path="/" 
            element={user ? <Layout /> : <Navigate to="/login" replace />} 
          >
            <Route index element={<Navigate to="/rounds" replace />} />
            <Route path="rounds" element={<RoundsPage />} />
            <Route path="rounds/:id" element={<RoundPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
