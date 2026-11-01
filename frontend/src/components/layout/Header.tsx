import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Wrench,
  PlusCircle,
  Search,
  BarChart3,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const mobileNavLinkClass = (path: string) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  Campus<span className="text-indigo-600">Fix</span>
                </span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                  Smart Maintenance
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/" className={navLinkClass('/')}>
                Home
              </Link>
              <Link to="/complaint" className={navLinkClass('/complaint')}>
                <PlusCircle className="w-4 h-4" />
                Report Issue
              </Link>
              <Link to="/track" className={navLinkClass('/track')}>
                <Search className="w-4 h-4" />
                Track Status
              </Link>
              <Link to="/analytics" className={navLinkClass('/analytics')}>
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className={navLinkClass('/admin')}>
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Desktop Right Side Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {user.display_name}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
                  </div>
                  <Badge
                    variant={user.role === 'admin' ? 'critical' : user.role === 'analyst' ? 'info' : 'secondary'}
                    size="sm"
                  >
                    {user.role}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-slate-600 hover:text-rose-600 hover:border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button as={Link} to="/login" variant="ghost" size="sm">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
                <Button as={Link} to="/register" variant="primary" size="sm">
                  <UserPlus className="w-4 h-4" />
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass('/')}
          >
            Home
          </Link>
          <Link
            to="/complaint"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass('/complaint')}
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            Report Issue
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass('/track')}
          >
            <Search className="w-4 h-4 text-indigo-600" />
            Track Status
          </Link>
          <Link
            to="/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass('/analytics')}
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            Analytics
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass('/admin')}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
              Admin Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-sm font-semibold text-slate-800">{user.display_name}</span>
                  <Badge variant="secondary" size="sm">{user.role}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-rose-600"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  as={Link}
                  to="/login"
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
