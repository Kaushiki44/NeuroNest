import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import Navbar from './Navbar'; // The old one for unauth
import './Layout.css';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="app-unauth-layout">
        <Navbar />
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <div className="main-content-wrapper">
        <TopNav />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
