import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { HRMSProvider, useHRMS } from './context/HRMSContext';

import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import EmployeeDashboard from './pages/Dashboard/EmployeeDashboard';
import Attendance from './pages/Attendance/Attendance';
import LeavePage from './pages/Leave/LeavePage';
import Payroll from './pages/Payroll/Payroll';
import Profile from './pages/Profile/Profile';

import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Search,
  Settings,
  HelpCircle,
  Home
} from 'lucide-react';

function ProtectedRoute({ children }) {
  const { currentUser } = useHRMS();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function MainLayout() {
  const { currentUser, logout } = useHRMS();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...(currentUser?.role === 'Employee' ? [{ name: 'Attendance', href: '/attendance', icon: Clock }] : []),
    { name: 'Time Off', href: '/leaves', icon: CalendarDays },
    { name: 'Payroll', href: '/payroll', icon: CreditCard },
    { name: 'My Profile', href: '/profile', icon: User },
  ];

  const currentPage = navigation.find(item => item.href === location.pathname)?.name || 'Dashboard';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--odoo-bg)' }}>
      {/* ===== ODOO TOP NAVBAR ===== */}
      <nav className="h-[46px] flex items-center justify-between px-3 shrink-0 no-print" style={{ background: 'var(--odoo-nav)', color: '#fff' }}>
        {/* Left side: Menu toggle + Brand + Nav links */}
        <div className="flex items-center gap-1">
          {/* Hamburger for mobile */}
          <button
            className="lg:hidden p-1.5 rounded hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors mr-1">
            <div className="h-7 w-7 rounded flex items-center justify-center font-black text-sm" style={{ background: 'var(--odoo-purple)' }}>
              A
            </div>
            <span className="font-bold text-[15px] hidden sm:block tracking-tight">Adamas</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side: Search + User menu */}
        <div className="flex items-center gap-2">
          {/* Notification */}
          <button className="relative p-1.5 rounded hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full" style={{ background: 'var(--odoo-teal)' }}></span>
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ background: 'var(--odoo-purple)' }}>
                {currentUser?.name.charAt(0)}
              </div>
              <span className="text-[13px] font-medium hidden sm:block">{currentUser?.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-white/50" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border z-50 py-1 odoo-scale-in" style={{ borderColor: 'var(--odoo-border)' }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--odoo-border-light)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--odoo-text)' }}>{currentUser?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--odoo-text-muted)' }}>{currentUser?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    style={{ color: 'var(--odoo-text)' }}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" style={{ color: 'var(--odoo-text-muted)' }} /> My Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 transition-colors text-red-600"
                  >
                    <LogOut className="h-4 w-4" /> Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-[46px] left-0 right-0 z-40 bg-white border-b shadow-lg lg:hidden odoo-slide-in" style={{ borderColor: 'var(--odoo-border)' }}>
            <div className="p-2 space-y-0.5">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    style={isActive ? { background: 'var(--odoo-purple)', color: '#fff' } : { color: 'var(--odoo-text)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ===== BREADCRUMB BAR ===== */}
      <div className="h-[40px] flex items-center px-4 bg-white border-b no-print" style={{ borderColor: 'var(--odoo-border-light)' }}>
        <div className="flex items-center gap-1.5 text-sm">
          <Home className="h-3.5 w-3.5" style={{ color: 'var(--odoo-text-muted)' }} />
          <span style={{ color: 'var(--odoo-text-muted)' }}>/</span>
          <span className="font-medium" style={{ color: 'var(--odoo-purple)' }}>{currentPage}</span>
        </div>
      </div>

      {/* ===== PAGE CONTENT ===== */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto p-4 md:p-6">
          <Routes>
            <Route path="/dashboard" element={
              currentUser?.role === 'Admin' ? <AdminDashboard /> : <EmployeeDashboard />
            } />
            {currentUser?.role === 'Employee' && (
              <Route path="/attendance" element={<Attendance />} />
            )}
            <Route path="/leaves" element={<LeavePage />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function MainApp() {
  const { currentUser } = useHRMS();
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          currentUser ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="/signup" element={
          currentUser ? <Navigate to="/dashboard" replace /> : <Signup />
        } />
        <Route path="/*" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <HRMSProvider>
      <MainApp />
    </HRMSProvider>
  );
}
