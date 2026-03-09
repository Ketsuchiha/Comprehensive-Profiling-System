import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, X } from "lucide-react";
import { api } from "../utils/api";

interface Faculty {
  id: string;
  name: string;
  age: number;
  sex: string;
  email: string;
  position: string;
  yearsOfTeaching: number;
}

export function FacultyProfile() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Faculty, "id">>({
    name: "",
    age: 0,
    sex: "Male",
    email: "",
    position: "Instructor",
    yearsOfTeaching: 0,
  });

  const fetchFaculty = async () => {
    try {
      const data = await api.get<any[]>('/faculty');
      setFaculty(data.map(f => {
        const name = `${f.first_name || ''} ${f.last_name || ''}`.trim();
        let age = 0;
        if (f.birth_date) {
          const birth = new Date(f.birth_date);
          const today = new Date();
          age = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        }
        let yearsOfTeaching = 0;
        if (f.date_hired) {
          const hired = new Date(f.date_hired);
          const today = new Date();
          yearsOfTeaching = today.getFullYear() - hired.getFullYear();
          const m = today.getMonth() - hired.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < hired.getDate())) yearsOfTeaching--;
        }
        return {
          id: f.faculty_id,
          name,
          age,
          sex: f.gender || '',
          email: f.email || '',
          position: f.rank || f.employment_status || '',
          yearsOfTeaching,
        };
      }));
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
    }
  };

  useEffect(() => { fetchFaculty(); }, []);

  const filteredFaculty = faculty.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewFaculty = (member: Faculty) => {
    setSelectedFaculty(member);
    setShowModal(true);
  };

  const handleAddFaculty = async () => {
    try {
      const nameParts = formData.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      await api.post('/faculty', {
        first_name: firstName,
        last_name: lastName,
        gender: formData.sex,
        email: formData.email,
        rank: formData.position,
      });
      await fetchFaculty();
    } catch (err) {
      console.error('Failed to add faculty:', err);
    }
    setShowAddModal(false);
    setFormData({
      name: "",
      age: 0,
      sex: "Male",
      email: "",
      position: "Instructor",
      yearsOfTeaching: 0,
    });
  };

  const handleDeleteFaculty = async (id: string) => {
    if (confirm("Are you sure you want to delete this faculty member?")) {
      try {
        await api.delete(`/faculty/${id}`);
        await fetchFaculty();
      } catch (err) {
        console.error('Failed to delete faculty:', err);
      }
    }
  };

  const handleInputChange = (field: keyof Omit<Faculty, "id">, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Faculty Profiles
          </h1>
          <p className="text-gray-600">
            Manage and view all faculty information
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Faculty
            </button>
          </div>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-600">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleViewFaculty(member)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteFaculty(member.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-sm text-orange-600 mb-3">{member.position}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="text-gray-900">{member.age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sex:</span>
                  <span className="text-gray-900">{member.sex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="text-gray-900">{member.yearsOfTeaching} years</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 truncate">{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Modal */}
      {showModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Faculty Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-orange-600">
                    {selectedFaculty.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedFaculty.name}</h3>
                  <p className="text-orange-600">{selectedFaculty.position}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Age</label>
                <p className="text-gray-900 mt-1">{selectedFaculty.age}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Sex</label>
                <p className="text-gray-900 mt-1">{selectedFaculty.sex}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-gray-900 mt-1">{selectedFaculty.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Position</label>
                <p className="text-gray-900 mt-1">{selectedFaculty.position}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Years of Teaching</label>
                <p className="text-gray-900 mt-1">{selectedFaculty.yearsOfTeaching} years</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Faculty Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Faculty</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddFaculty(); }} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Dr. Juan dela Cruz"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Age *</label>
                <input
                  type="number"
                  required
                  min="20"
                  max="100"
                  value={formData.age || ""}
                  onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sex *</label>
                <select
                  required
                  value={formData.sex}
                  onChange={(e) => handleInputChange("sex", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="email@university.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Position *</label>
                <select
                  required
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Instructor">Instructor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Professor">Professor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Years of Teaching *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="50"
                  value={formData.yearsOfTeaching || ""}
                  onChange={(e) => handleInputChange("yearsOfTeaching", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="col-span-2 flex gap-3 mt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Faculty
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