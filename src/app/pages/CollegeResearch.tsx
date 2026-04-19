import { useState, useEffect } from "react";
import { Search, Plus, FileText, Users, Calendar, X } from "lucide-react";
import { api } from "../utils/api";

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

const statusColors = {
  ongoing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  published: "bg-purple-100 text-purple-700",
};

function mapResearchStatus(status: string): Research["status"] {
  switch (status) {
    case "Ongoing": return "ongoing";
    case "Completed": return "completed";
    case "Published": return "published";
    default: return "ongoing";
  }
}

export function CollegeResearch() {
  const [research, setResearch] = useState<Research[]>([]);
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

  const fetchResearch = async () => {
    try {
      const data = await api.get<any[]>('/research');
      setResearch(data.map(r => ({
        id: String(r.project_id),
        title: r.title || '',
        author: r.funding_source || 'N/A',
        category: r.research_type || '',
        status: mapResearchStatus(r.status),
        startDate: r.start_date ? r.start_date.split('T')[0] : '',
        description: r.abstract || '',
        collaborators: r.member_count || 0,
      })));
    } catch (err) {
      console.error('Failed to fetch research:', err);
    }
  };

  useEffect(() => { fetchResearch(); }, []);

  const filteredResearch = research.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddResearch = async () => {
    try {
      const reverseStatusMap: Record<string, string> = {
        ongoing: "Ongoing",
        completed: "Completed",
        published: "Published",
      };
      await api.post('/research', {
        title: formData.title,
        abstract: formData.description,
        research_type: formData.category,
        status: reverseStatusMap[formData.status] || 'Ongoing',
        start_date: formData.startDate,
        funding_source: formData.author,
      });
      await fetchResearch();
    } catch (err) {
      console.error('Failed to add research:', err);
    }
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
                title="Close research form"
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
                  title="Research title"
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
                    title="Lead researcher"
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
                    title="Category"
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
                    title="Research status"
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
                    title="Start date"
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
                  title="Number of collaborators"
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