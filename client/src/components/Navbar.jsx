import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePlusCircle, HiOutlineViewGrid, HiOutlineLogout, HiOutlineLogin } from 'react-icons/hi';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">⬡</span>
          <span className="navbar-title">NeuroNest</span>
        </Link>

        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link" id="nav-dashboard">
                <HiOutlineViewGrid />
                <span>Dashboard</span>
              </Link>
              <Link to="/posts/new" className="nav-link nav-link-accent" id="nav-new-post">
                <HiOutlinePlusCircle />
                <span>New Post</span>
              </Link>
              <div className="nav-divider" />
              <div className="nav-user">
                <div className="nav-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="nav-user-name">{user?.name}</span>
              </div>
              <button onClick={handleLogout} className="nav-link nav-link-logout" id="nav-logout">
                <HiOutlineLogout />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" id="nav-login">
                <HiOutlineLogin />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
