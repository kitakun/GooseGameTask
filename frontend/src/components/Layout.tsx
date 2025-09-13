import { memo } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Header from './Header';

const Layout = memo(() => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
