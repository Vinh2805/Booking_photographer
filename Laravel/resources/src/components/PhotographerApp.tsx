import { useState, useEffect } from 'react';
import { PhotographerAuth } from './photographer/PhotographerAuth';
import { PhotographerHome } from './photographer/PhotographerHome';
import { PhotographerBookings } from './photographer/PhotographerBookings';
import { PhotographerChat } from './photographer/PhotographerChat';
import { PhotographerProfile } from './photographer/PhotographerProfile';
import { PhotographerEditProfile } from './photographer/PhotographerEditProfile';
import { PhotographerChangePassword } from './photographer/PhotographerChangePassword';
import { AppLayoutWithSidebar } from './AppLayoutWithSidebar';

interface PhotographerAppProps {
  onBack: () => void;
}

type PhotographerView =
  | 'home'
  | 'bookings'
  | 'messages'
  | 'profile'
  | 'edit-profile'
  | 'change-password';

export function PhotographerApp({ onBack }: PhotographerAppProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<PhotographerView>('home');

  // ✅ Lấy user từ localStorage nếu đã login
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_info');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setIsAuthenticated(false);
    onBack();
  };

  if (!isAuthenticated) {
    return (
      <PhotographerAuth
        onLogin={() => {
          const userData = localStorage.getItem('user_info');
          if (userData) setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }}
        onBack={onBack}
      />
    );
  }

  const handleNavigate = (section: string) => {
    switch (section) {
      case 'home':
        setCurrentView('home');
        break;
      case 'bookings':
        setCurrentView('bookings');
        break;
      case 'messages':
        setCurrentView('messages');
        break;
      case 'profile':
        setCurrentView('profile');
        break;
      case 'settings':
        setCurrentView('profile');
        break;
      case 'logout':
        handleLogout(); // ✅ thực sự logout
        break;
      default:
        break;
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'home':
        return 'Tổng quan';
      case 'bookings':
        return 'Buổi chụp';
      case 'messages':
        return 'Tin nhắn';
      case 'profile':
        return 'Hồ sơ';
      case 'edit-profile':
        return 'Chỉnh sửa hồ sơ';
      case 'change-password':
        return 'Đổi mật khẩu';
      default:
        return 'Momentia Pro';
    }
  };

  const getBreadcrumbs = () => {
    switch (currentView) {
      case 'edit-profile':
        return [
          { label: 'Hồ sơ', href: '#' },
          { label: 'Chỉnh sửa' },
        ];
      case 'change-password':
        return [
          { label: 'Hồ sơ', href: '#' },
          { label: 'Đổi mật khẩu' },
        ];
      default:
        return [];
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <PhotographerHome user={user} onNavigate={setCurrentView} />;
      case 'bookings':
        return <PhotographerBookings user={user} onNavigate={setCurrentView} />;
      case 'messages':
        return <PhotographerChat user={user} onBack={() => setCurrentView('home')} />;
      case 'profile':
        return <PhotographerProfile user={user} onNavigate={setCurrentView} />;
      case 'edit-profile':
        return <PhotographerEditProfile user={user} onBack={() => setCurrentView('profile')} />;
      case 'change-password':
        return <PhotographerChangePassword user={user} onBack={() => setCurrentView('profile')} />;
      default:
        return <PhotographerHome user={user} onNavigate={setCurrentView} />;
    }
  };

  return (
    <AppLayoutWithSidebar
      onNavigate={handleNavigate}
      onBack={onBack}
      title={getPageTitle()}
      breadcrumbs={getBreadcrumbs()}
      userRole="photographer"
      currentView={currentView}
      user={user} // ✅ truyền xuống Sidebar
    >
      {renderContent()}
    </AppLayoutWithSidebar>
  );
}
