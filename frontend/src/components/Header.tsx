import { memo } from 'react';
import { User } from '../types';
import { useAuthStore } from '../store/authStore';
import { LogOut, User as UserIcon } from 'lucide-react';

type HeaderProps = {
  user: User | null;
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'text-red-600 bg-red-100';
    case 'NIKITA':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-green-600 bg-green-100';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'Админ';
    case 'NIKITA':
      return 'Никита';
    default:
      return 'Выживший';
  }
};

const Header = memo(({ user }: HeaderProps) => {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Кликаем гусей
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 font-medium">{user.username}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Выйти</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
