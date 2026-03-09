import { useState } from "react";
import { Search, Plus, Edit, Trash2, Eye, X } from "lucide-react";

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  civilStatus: string;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyContactNumber: string;
}

const mockStudents: Student[] = [
  {
    id: "1",
    studentId: "2021-00001",
    firstName: "Juan",
    middleName: "Santos",
    lastName: "dela Cruz",
    dateOfBirth: "2004-05-15",
    sex: "Male",
    civilStatus: "Single",
    contactNumber: "+63 912 345 6789",
    email: "juan.delacruz@student.edu",
    address: "123 Main St, Cabuyao City",
    emergencyContact: "Maria dela Cruz",
    emergencyContactNumber: "+63 912 345 6788",
  },
  {
    id: "2",
    studentId: "2021-00002",
    firstName: "Maria",
    middleName: "Garcia",
    lastName: "Santos",
    dateOfBirth: "2005-08-22",
    sex: "Female",
    civilStatus: "Single",
    contactNumber: "+63 923 456 7890",
    email: "maria.santos@student.edu",
    address: "456 Rizal Ave, Cabuyao City",
    emergencyContact: "Jose Santos",
    emergencyContactNumber: "+63 923 456 7891",
  },
  {
    id: "3",
    studentId: "2020-00015",
    firstName: "Pedro",
    middleName: "Ramos",
    lastName: "Garcia",
    dateOfBirth: "2003-12-10",
    sex: "Male",
    civilStatus: "Single",
    contactNumber: "+63 934 567 8901",
    email: "pedro.garcia@student.edu",
    address: "789 Luna St, Cabuyao City",
    emergencyContact: "Ana Garcia",
    emergencyContactNumber: "+63 934 567 8902",
  },
];

export function StudentProfile() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Student, "id">>({
    studentId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    sex: "Male",
    civilStatus: "Single",
    contactNumber: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyContactNumber: "",
  });

  const filteredStudents = students.filter((student) =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleAddStudent = () => {
    const newStudent: Student = {
      ...formData,
      id: Date.now().toString(),
    };
    setStudents([...students, newStudent]);
    setShowAddModal(false);
    setFormData({
      studentId: "",
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      sex: "Male",
      civilStatus: "Single",
      contactNumber: "",
      email: "",
      address: "",
      emergencyContact: "",
      emergencyContactNumber: "",
    });
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleInputChange = (field: keyof Omit<Student, "id">, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Profiles
          </h1>
          <p className="text-gray-600">
            Manage and view all student information
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or student ID..."
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
              Add Student
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sex
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.firstName} {student.middleName} {student.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.sex}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.contactNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-600">Student ID</label>
                <p className="text-gray-900 mt-1">{selectedStudent.studentId}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">First Name</label>
                <p className="text-gray-900 mt-1">{selectedStudent.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Middle Name</label>
                <p className="text-gray-900 mt-1">{selectedStudent.middleName}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Last Name</label>
                <p className="text-gray-900 mt-1">{selectedStudent.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Date of Birth</label>
                <p className="text-gray-900 mt-1">{selectedStudent.dateOfBirth}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Sex</label>
                <p className="text-gray-900 mt-1">{selectedStudent.sex}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Civil Status</label>
                <p className="text-gray-900 mt-1">{selectedStudent.civilStatus}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Contact Number</label>
                <p className="text-gray-900 mt-1">{selectedStudent.contactNumber}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-gray-900 mt-1">{selectedStudent.email}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-semibold text-gray-600">Address</label>
                <p className="text-gray-900 mt-1">{selectedStudent.address}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Emergency Contact</label>
                <p className="text-gray-900 mt-1">{selectedStudent.emergencyContact}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Emergency Contact Number</label>
                <p className="text-gray-900 mt-1">{selectedStudent.emergencyContactNumber}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Student</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddStudent(); }} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Student ID *</label>
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => handleInputChange("studentId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 2021-00001"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange("middleName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Civil Status *</label>
                <select
                  required
                  value={formData.civilStatus}
                  onChange={(e) => handleInputChange("civilStatus", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="+63 912 345 6789"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="email@example.com"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Address *</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Emergency Contact *</label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Emergency Contact Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.emergencyContactNumber}
                  onChange={(e) => handleInputChange("emergencyContactNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="+63 912 345 6789"
                />
              </div>
              <div className="col-span-2 flex gap-3 mt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Student
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