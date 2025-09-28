import { useState } from 'react';
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

type PhotographerView = 'home' | 'bookings' | 'messages' | 'profile' | 'edit-profile' | 'change-password';

export function PhotographerApp({ onBack }: PhotographerAppProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<PhotographerView>('home');

  if (!isAuthenticated) {
    return <PhotographerAuth onLogin={() => setIsAuthenticated(true)} onBack={onBack} />;
  }

  const handleNavigate = (section: string) => {
    console.log('PhotographerApp handleNavigate:', section);
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
        onBack();
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
          { label: 'Chỉnh sửa' }
        ];
      case 'change-password':
        return [
          { label: 'Hồ sơ', href: '#' },
          { label: 'Đổi mật khẩu' }
        ];
      default:
        return [];
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <PhotographerHome onNavigate={setCurrentView} />;
      case 'bookings':
        return <PhotographerBookings onNavigate={setCurrentView} />;
      case 'messages':
        return <PhotographerChat onBack={() => setCurrentView('home')} />;
      case 'profile':
        return <PhotographerProfile onNavigate={setCurrentView} />;
      case 'edit-profile':
        return <PhotographerEditProfile onBack={() => setCurrentView('profile')} />;
      case 'change-password':
        return <PhotographerChangePassword onBack={() => setCurrentView('profile')} />;
      default:
        return <PhotographerHome onNavigate={setCurrentView} />;
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
    >
      {renderContent()}
    </AppLayoutWithSidebar>
  );
}