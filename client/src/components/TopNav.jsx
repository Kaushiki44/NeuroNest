import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMoon, HiOutlineSun, HiOutlineBell } from 'react-icons/hi';
import './TopNav.css';

const TopNav = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="topnav">
      <div className="topnav-spacer"></div>
      
      <div className="topnav-actions">
        <button className="topnav-icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {isDark ? <HiOutlineSun /> : <HiOutlineMoon />}
        </button>
        <button className="topnav-icon-btn" title="Notifications">
          <HiOutlineBell />
        </button>
        <div className="topnav-profile">
          <div className="topnav-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
