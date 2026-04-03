import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Calendar, 
  Clock, 
  BookOpen, 
  FileText,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoImage from "../../assets/70c26a9cf9f6ef2d16948997d7c954b67149d16d.png";
import buildingImage from "../../assets/b65a68daf197ee46f7b02d7da02ee101a668ac79.png";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Student Profile", href: "/students", icon: GraduationCap },
  { name: "Faculty Profile", href: "/faculty", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Scheduling", href: "/scheduling", icon: Clock },
  { name: "College Research", href: "/research", icon: BookOpen },
  { name: "Instruments", href: "/instruments", icon: FileText },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="CCS Logo" className="w-12 h-12" />
              <div>
                <p className="font-semibold text-gray-900">CCS</p>
                <p className="text-xs text-gray-600">Profiling System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info and Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}