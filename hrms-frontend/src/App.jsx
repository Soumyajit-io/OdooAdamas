import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { HRMSProvider, useHRMS } from './context/HRMSContext';

// Import Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import EmployeeDashboard from './pages/Dashboard/EmployeeDashboard';
import Attendance from './pages/Attendance/Attendance';
import LeavePage from './pages/Leave/LeavePage';
import Payroll from './pages/Payroll/Payroll';
import Profile from './pages/Profile/Profile';

// Import Icons
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
  Briefcase
} from 'lucide-react';

function ProtectedRoute({ children }) {
  const { currentUser } = useHRMS();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function MainLayout() {
  const { currentUser, logout } = useHRMS();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...(currentUser?.role === 'Employee' ? [{ name: 'Attendance', href: '/attendance', icon: Clock }] : []),
    { name: 'Leaves', href: '/leaves', icon: CalendarDays },
    { name: 'Payroll', href: '/payroll', icon: CreditCard },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-white tracking-wide">Adamas HRMS</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white uppercase">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-white truncate text-sm">{currentUser?.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-500 hover:text-slate-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">
              {navigation.find(item => item.href === location.pathname)?.name || 'HRMS'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button className="text-slate-400 hover:text-slate-600 relative p-1 rounded-full hover:bg-slate-100 transition-colors">
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <Bell className="h-5 w-5" />
            </button>

            <div className="h-8 w-px bg-slate-200"></div>

            {/* Quick Profile */}
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
              <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm uppercase">
                {currentUser?.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{currentUser?.name}</span>
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
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
        </main>
      </div>
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
