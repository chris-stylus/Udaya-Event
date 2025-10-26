import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Role } from './types';
import { LoginScreen } from './screens/LoginScreen';
import AdminDashboard from './screens/AdminDashboard';
import StudentWallet from './screens/StudentWallet';
import StallView from './screens/StallView';
import { Header } from './components/Header';

const AppContent = () => {
  const { loggedInUser } = useApp();

  const renderContent = () => {
    if (!loggedInUser) {
      return <LoginScreen />;
    }

    let view;
    switch (loggedInUser.role) {
      case Role.Admin:
        view = <AdminDashboard />;
        break;
      case Role.Student:
        view = <StudentWallet />;
        break;
      case Role.Stall:
        view = <StallView />;
        break;
      default:
        view = <div>Error: Unknown role.</div>;
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header />
            <main className="flex-grow">
                {view}
            </main>
        </div>
    );
  };
  
  return renderContent();
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;