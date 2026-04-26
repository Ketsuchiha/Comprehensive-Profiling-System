import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { 
  LayoutDashboard, 
  User, 
  GraduationCap, 
  BookOpen, 
  Trophy,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logoImage from "../../assets/ccs-logo.png";
import buildingImage from "../../assets/b65a68daf197ee46f7b02d7da02ee101a668ac79.png";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.email || "Student";
  const displayRefId = user?.refId || "N/A";
  const initials = displayName
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() || "")
    .join("") || "ST";

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Academic", href: "/academic-profile", icon: GraduationCap },
    { name: "Records", href: "/academic-records", icon: BookOpen },
    { name: "Activities", href: "/activities", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          {/* Logo/Brand */}
          <div className="flex h-20 shrink-0 items-center gap-3 border-b border-gray-200">
            <img src={logoImage} alt="CCS Logo" className="w-12 h-12" />
            <div>
              <h1 className="font-semibold text-gray-900">CCS Student</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                            isActive
                              ? "bg-orange-500 text-white shadow-sm"
                              : "text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                          }`}
                        >
                          <item.icon
                            className={`h-5 w-5 shrink-0 ${
                              isActive ? "text-white" : "text-gray-400 group-hover:text-orange-600"
                            }`}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              {/* User Profile at Bottom */}
              <li className="mt-auto">
                <div className="flex items-center gap-3 px-3 py-3 border-t border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500">{displayRefId}</p>
                  </div>
                </div>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full mt-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <div className="flex-1 flex items-center gap-2">
            <img src={logoImage} alt="CCS Logo" className="w-8 h-8" />
            <h1 className="font-semibold text-gray-900">CCS Student</h1>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 bg-gray-900/80 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white" onClick={(e) => e.stopPropagation()}>
              <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200 gap-3">
                <img src={logoImage} alt="CCS Logo" className="w-10 h-10" />
                <div>
                  <h1 className="font-semibold text-gray-900">CCS Student</h1>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              </div>
              <nav className="flex flex-1 flex-col px-6 py-4">
                <ul role="list" className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                            isActive
                              ? "bg-orange-500 text-white"
                              : "text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                          }`}
                        >
                          <item.icon
                            className={`h-5 w-5 shrink-0 ${
                              isActive ? "text-white" : "text-gray-400 group-hover:text-orange-600"
                            }`}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <button
                  onClick={handleLogout}
                  className="mt-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="relative flex min-h-screen flex-col px-4 py-6 sm:px-6 lg:px-8">
          <img
            src={buildingImage}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.04]"
          />
          <div className="flex-1">
            <Outlet />
          </div>
          <footer className="mt-8 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
            All rights reserved 2026
          </footer>
        </div>
      </main>
    </div>
  );
}