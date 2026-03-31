import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  BookOpen 
} from "lucide-react";
import { api } from "../utils/api";
import buildingImage from "../../assets/b65a68daf197ee46f7b02d7da02ee101a668ac79.png";

const recentActivities = [
  { title: "New student enrolled", time: "2 hours ago", type: "student" },
  { title: "Research paper submitted", time: "5 hours ago", type: "research" },
  { title: "Faculty meeting scheduled", time: "1 day ago", type: "event" },
  { title: "Syllabus updated for CS101", time: "2 days ago", type: "instrument" },
];

export function Dashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [facultyCount, setFacultyCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [researchCount, setResearchCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [students, faculty, events, research] = await Promise.all([
          api.get<any[]>('/students').catch((err) => { console.error('Failed to fetch students:', err); return []; }),
          api.get<any[]>('/faculty').catch((err) => { console.error('Failed to fetch faculty:', err); return []; }),
          api.get<any[]>('/events').catch((err) => { console.error('Failed to fetch events:', err); return []; }),
          api.get<any[]>('/research').catch((err) => { console.error('Failed to fetch research:', err); return []; }),
        ]);
        setStudentCount(Array.isArray(students) ? students.length : 0);
        setFacultyCount(Array.isArray(faculty) ? faculty.length : 0);
        setEventCount(Array.isArray(events) ? events.length : 0);
        setResearchCount(Array.isArray(research) ? research.length : 0);
      } catch (err) {
        console.error('Failed to fetch dashboard counts:', err);
      }
    };
    fetchCounts();
  }, []);

  const stats = [
    { name: "Total Students", value: studentCount.toLocaleString(), icon: GraduationCap, color: "bg-blue-500" },
    { name: "Faculty Members", value: facultyCount.toLocaleString(), icon: Users, color: "bg-green-500" },
    { name: "Upcoming Events", value: eventCount.toLocaleString(), icon: Calendar, color: "bg-purple-500" },
    { name: "Research Projects", value: researchCount.toLocaleString(), icon: BookOpen, color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with background image */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={buildingImage} 
          alt="University Building" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/60">
          <div className="container mx-auto px-8 h-full flex items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome to CCS Profiling System
              </h1>
              <p className="text-xl text-gray-200">
                College of Computing Studies - Comprehensive Profilling System
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activities and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activities
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              System Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Active Courses</span>
                <span className="text-sm font-semibold text-gray-900">42</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Scheduled Classes</span>
                <span className="text-sm font-semibold text-gray-900">156</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Pending Submissions</span>
                <span className="text-sm font-semibold text-gray-900">23</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Completed Research</span>
                <span className="text-sm font-semibold text-gray-900">18</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
