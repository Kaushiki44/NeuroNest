import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineViewGrid, 
  HiOutlineDocumentText, 
  HiOutlinePencilAlt, 
  HiOutlineGlobeAlt,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineLogout
} from 'react-icons/hi';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HiOutlineViewGrid },
    { name: 'Manage Blogs', path: '/manage-blogs', icon: HiOutlineDocumentText },
    { name: 'New Blog', path: '/posts/new', icon: HiOutlinePencilAlt },
    { name: 'Browse Blogs', path: '/explore', icon: HiOutlineGlobeAlt },
  ];

  if (!user) return null;

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo-container">
          <span className="sidebar-logo-icon">⬡</span>
          {!isCollapsed && <span className="sidebar-brand">NeuroNest</span>}
        </Link>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="sidebar-link-icon" />
              {!isCollapsed && <span className="sidebar-link-text">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
      </button>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{user?.name}</span>
              <span className="sidebar-user-email">{user?.email}</span>
              <span className="sidebar-user-role">ADMIN</span>
            </div>
          )}
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          <HiOutlineLogout className="sidebar-link-icon" />
          {!isCollapsed && <span className="sidebar-link-text">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
