import { useState } from "react";
import { FileText, Download, Upload, Plus, Search, X } from "lucide-react";

interface Instrument {
  id: string;
  title: string;
  type: "syllabus" | "conclusion" | "lesson";
  courseCode: string;
  instructor: string;
  uploadDate: string;
  fileSize: string;
}

const mockInstruments: Instrument[] = [
  {
    id: "1",
    title: "CS101 Course Syllabus - First Semester",
    type: "syllabus",
    courseCode: "CS101",
    instructor: "Prof. Ana Reyes",
    uploadDate: "2026-01-15",
    fileSize: "2.4 MB",
  },
  {
    id: "2",
    title: "Week 5: Data Structures - Arrays and Lists",
    type: "lesson",
    courseCode: "CS102",
    instructor: "Dr. Roberto Fernandez",
    uploadDate: "2026-02-10",
    fileSize: "1.8 MB",
  },
  {
    id: "3",
    title: "Database Design Project - Conclusion Report",
    type: "conclusion",
    courseCode: "CS201",
    instructor: "Dr. Carlos Martinez",
    uploadDate: "2026-02-28",
    fileSize: "3.2 MB",
  },
  {
    id: "4",
    title: "CS301 Web Development Syllabus",
    type: "syllabus",
    courseCode: "CS301",
    instructor: "Prof. Sofia Mendoza",
    uploadDate: "2026-01-20",
    fileSize: "2.1 MB",
  },
  {
    id: "5",
    title: "Week 8: Algorithm Analysis - Sorting Techniques",
    type: "lesson",
    courseCode: "CS202",
    instructor: "Dr. Roberto Fernandez",
    uploadDate: "2026-02-15",
    fileSize: "2.7 MB",
  },
  {
    id: "6",
    title: "Software Engineering Capstone - Final Conclusion",
    type: "conclusion",
    courseCode: "CS401",
    instructor: "Dr. Carlos Martinez",
    uploadDate: "2026-03-01",
    fileSize: "4.5 MB",
  },
];

const typeColors = {
  syllabus: "bg-blue-100 text-blue-700",
  conclusion: "bg-green-100 text-green-700",
  lesson: "bg-purple-100 text-purple-700",
};

const typeIcons = {
  syllabus: "📋",
  conclusion: "📊",
  lesson: "📖",
};

export function Instruments() {
  const [instruments, setInstruments] = useState<Instrument[]>(mockInstruments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Instrument, "id">>({
    title: "",
    type: "syllabus",
    courseCode: "",
    instructor: "",
    uploadDate: new Date().toISOString().split('T')[0],
    fileSize: "",
  });

  const filteredInstruments = instruments.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAddInstrument = () => {
    const newInstrument: Instrument = {
      ...formData,
      id: Date.now().toString(),
    };
    setInstruments([...instruments, newInstrument]);
    setShowAddModal(false);
    setFormData({
      title: "",
      type: "syllabus",
      courseCode: "",
      instructor: "",
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: "",
    });
  };

  const handleInputChange = (field: keyof Omit<Instrument, "id">, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Instruments</h1>
          <p className="text-gray-600">
            Manage syllabi, lesson plans, and conclusion reports
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or course code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "all"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedType("syllabus")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "syllabus"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Syllabus
              </button>
              <button
                onClick={() => setSelectedType("lesson")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "lesson"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Lesson
              </button>
              <button
                onClick={() => setSelectedType("conclusion")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "conclusion"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Conclusion
              </button>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload File
            </button>
          </div>
        </div>

        {/* Instruments List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredInstruments.map((item) => (
              <div
                key={item.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">{typeIcons[item.type]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[item.type]}`}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {item.courseCode}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{item.fileSize}</span>
                        </div>
                        <div>
                          <span>Instructor: {item.instructor}</span>
                        </div>
                        <div>
                          <span>Uploaded: {item.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Syllabi</p>
                <p className="text-3xl font-bold text-blue-600">
                  {instruments.filter(i => i.type === "syllabus").length}
                </p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Lessons</p>
                <p className="text-3xl font-bold text-purple-600">
                  {instruments.filter(i => i.type === "lesson").length}
                </p>
              </div>
              <div className="text-4xl">📖</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Conclusions</p>
                <p className="text-3xl font-bold text-green-600">
                  {instruments.filter(i => i.type === "conclusion").length}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Instrument Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upload New Document</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddInstrument(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., CS101 Course Syllabus - First Semester"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Document Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value as Instrument["type"])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="syllabus">Syllabus</option>
                    <option value="lesson">Lesson</option>
                    <option value="conclusion">Conclusion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.courseCode}
                    onChange={(e) => handleInputChange("courseCode", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., CS101"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Instructor *</label>
                <input
                  type="text"
                  required
                  value={formData.instructor}
                  onChange={(e) => handleInputChange("instructor", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Prof. Ana Reyes"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">File Size *</label>
                <input
                  type="text"
                  required
                  value={formData.fileSize}
                  onChange={(e) => handleInputChange("fileSize", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 2.4 MB"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Upload File *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (MAX. 10MB)</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Upload Document
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