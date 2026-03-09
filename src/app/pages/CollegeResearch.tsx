import { useState } from "react";
import { Search, Plus, FileText, Users, Calendar, X } from "lucide-react";

interface Research {
  id: string;
  title: string;
  author: string;
  category: string;
  status: "ongoing" | "completed" | "published";
  startDate: string;
  description: string;
  collaborators: number;
}

const mockResearch: Research[] = [
  {
    id: "1",
    title: "Machine Learning Applications in Education",
    author: "Dr. Roberto Fernandez",
    category: "Artificial Intelligence",
    status: "ongoing",
    startDate: "2025-09-01",
    description: "Exploring the use of machine learning algorithms to personalize learning experiences for students",
    collaborators: 3,
  },
  {
    id: "2",
    title: "Blockchain Technology for Academic Records",
    author: "Dr. Carlos Martinez",
    category: "Blockchain",
    status: "completed",
    startDate: "2024-06-15",
    description: "Implementation of blockchain-based system for secure and transparent academic record management",
    collaborators: 5,
  },
  {
    id: "3",
    title: "Mobile App Development Frameworks Comparison",
    author: "Prof. Sofia Mendoza",
    category: "Mobile Development",
    status: "published",
    startDate: "2024-03-10",
    description: "Comparative study of modern mobile development frameworks and their performance metrics",
    collaborators: 2,
  },
  {
    id: "4",
    title: "Cybersecurity in IoT Devices",
    author: "Prof. Ana Reyes",
    category: "Cybersecurity",
    status: "ongoing",
    startDate: "2025-11-01",
    description: "Research on security vulnerabilities in Internet of Things devices and mitigation strategies",
    collaborators: 4,
  },
  {
    id: "5",
    title: "Cloud Computing Cost Optimization",
    author: "Dr. Roberto Fernandez",
    category: "Cloud Computing",
    status: "completed",
    startDate: "2024-08-20",
    description: "Analysis of cost optimization strategies for cloud-based applications in educational institutions",
    collaborators: 3,
  },
];

const statusColors = {
  ongoing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  published: "bg-purple-100 text-purple-700",
};

export function CollegeResearch() {
  const [research, setResearch] = useState<Research[]>(mockResearch);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Research, "id">>({
    title: "",
    author: "",
    category: "",
    status: "ongoing",
    startDate: "",
    description: "",
    collaborators: 0,
  });

  const filteredResearch = research.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddResearch = () => {
    const newResearch: Research = {
      ...formData,
      id: Date.now().toString(),
    };
    setResearch([...research, newResearch]);
    setShowAddModal(false);
    setFormData({
      title: "",
      author: "",
      category: "",
      status: "ongoing",
      startDate: "",
      description: "",
      collaborators: 0,
    });
  };

  const handleInputChange = (field: keyof Omit<Research, "id">, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            College Research
          </h1>
          <p className="text-gray-600">
            Browse and manage research projects and publications
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search research by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedStatus("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedStatus === "all"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus("ongoing")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedStatus === "ongoing"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setSelectedStatus("completed")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedStatus === "completed"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Completed
              </button>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Research
            </button>
          </div>
        </div>

        {/* Research Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResearch.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {item.category}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {item.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>Lead Researcher: {item.author}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{item.collaborators} collaborators</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Started: {item.startDate}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Research Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Research Project</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddResearch(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Research Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Machine Learning Applications in Education"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Lead Researcher *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Dr. Roberto Fernandez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Artificial Intelligence"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value as Research["status"])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Collaborators *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.collaborators || ""}
                  onChange={(e) => handleInputChange("collaborators", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Brief description of the research project"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Research
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}