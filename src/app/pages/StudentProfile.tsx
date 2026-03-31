import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, X } from "lucide-react";
import { api } from "../utils/api";

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  program: string;
  yearLevel: string;
  section: string;
  courseCodes: string[];
  dateOfBirth: string;
  sex: string;
  civilStatus: string;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyContactNumber: string;
  nationality: string;
  religion: string;
}

export function StudentProfile() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Array<{ subject_code: string; subject_name: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Student, "id">>({
    studentId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    program: "",
    yearLevel: "",
    section: "",
    courseCodes: [],
    dateOfBirth: "",
    sex: "Male",
    civilStatus: "Single",
    contactNumber: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyContactNumber: "",
    nationality: "",
    religion: "",
  });

  const fetchStudents = async () => {
    try {
      const data = await api.get<any[]>('/students');
      setStudents(data.map(s => ({
        id: s.student_id,
        studentId: s.student_id,
        firstName: s.first_name,
        middleName: s.middle_name || '',
        lastName: s.last_name,
        program: s.program || '',
        yearLevel: s.year_level ? String(s.year_level) : '',
        section: s.section || '',
        courseCodes: Array.isArray(s.courses) ? s.courses.map((c: { subject_code: string }) => c.subject_code) : [],
        dateOfBirth: s.birth_date ? s.birth_date.split('T')[0] : '',
        sex: s.sex || '',
        civilStatus: s.civil_status || '',
        contactNumber: s.contact_number || '',
        email: s.email || '',
        address: s.address || '',
        emergencyContact: s.emergency_contact || '',
        emergencyContactNumber: s.emergency_contact_num || '',
        nationality: s.nationality || '',
        religion: s.religion || '',
      })));
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await api.get<Array<{ subject_code: string; subject_name: string }>>('/subjects');
      setSubjects(data);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
  }, []);

  const filteredStudents = students.filter((student) =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleAddStudent = async () => {
    try {
      await api.post('/students', {
        student_id: formData.studentId,
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        birth_date: formData.dateOfBirth,
        sex: formData.sex,
        civil_status: formData.civilStatus,
        contact_number: formData.contactNumber,
        email: formData.email,
        address: formData.address,
        emergency_contact: formData.emergencyContact,
        emergency_contact_num: formData.emergencyContactNumber,
        nationality: formData.nationality,
        religion: formData.religion,
        academic: {
          program: formData.program || null,
          year_level: formData.yearLevel ? Number(formData.yearLevel) : null,
          section: formData.section || null,
          enrollment_status: 'Enrolled',
        },
        course_codes: formData.courseCodes,
      });
      await fetchStudents();
    } catch (err) {
      console.error('Failed to add student:', err);
    }
    setShowAddModal(false);
    setFormData({
      studentId: "",
      firstName: "",
      middleName: "",
      lastName: "",
      program: "",
      yearLevel: "",
      section: "",
      courseCodes: [],
      dateOfBirth: "",
      sex: "Male",
      civilStatus: "Single",
      contactNumber: "",
      email: "",
      address: "",
      emergencyContact: "",
      emergencyContactNumber: "",
      nationality: "",
      religion: "",
    });
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await api.delete(`/students/${id}`);
        await fetchStudents();
      } catch (err) {
        console.error('Failed to delete student:', err);
      }
    }
  };

  const handleInputChange = (field: keyof Omit<Student, "id">, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCourseToggle = (subjectCode: string) => {
    setFormData((prev) => {
      const exists = prev.courseCodes.includes(subjectCode);
      return {
        ...prev,
        courseCodes: exists
          ? prev.courseCodes.filter((code) => code !== subjectCode)
          : [...prev.courseCodes, subjectCode],
      };
    });
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
                    Section
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
                      {student.section || '-'}
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
                <label className="text-sm font-semibold text-gray-600">Program</label>
                <p className="text-gray-900 mt-1">{selectedStudent.program || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Year and Section</label>
                <p className="text-gray-900 mt-1">{selectedStudent.yearLevel || '-'} / {selectedStudent.section || '-'}</p>
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
              <div>
                <label className="text-sm font-semibold text-gray-600">Nationality</label>
                <p className="text-gray-900 mt-1">{selectedStudent.nationality || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Religion</label>
                <p className="text-gray-900 mt-1">{selectedStudent.religion || '-'}</p>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Program</label>
                <input
                  type="text"
                  value={formData.program}
                  onChange={(e) => handleInputChange("program", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., BSCS"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Year Level</label>
                <select
                  value={formData.yearLevel}
                  onChange={(e) => handleInputChange("yearLevel", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select year</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => handleInputChange("section", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., CS-2A"
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
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned Courses</label>
                <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-300 p-3">
                  {subjects.length === 0 && (
                    <p className="text-sm text-gray-500">No subjects found. Add subjects first.</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {subjects.map((subject) => (
                      <label key={subject.subject_code} className="flex items-start gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.courseCodes.includes(subject.subject_code)}
                          onChange={() => handleCourseToggle(subject.subject_code)}
                          className="mt-0.5"
                        />
                        <span>{subject.subject_code} - {subject.subject_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange("nationality", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Filipino"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Religion</label>
                <input
                  type="text"
                  value={formData.religion}
                  onChange={(e) => handleInputChange("religion", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Roman Catholic"
                />
              </div>
              <div className="col-span-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
                <p>Auto-generated password: {(formData.lastName?.trim()?.[0] || 'X').toUpperCase()}{formData.dateOfBirth || 'YYYY-MM-DD'}</p>
                <p className="mt-1 text-xs">Temporary password only. Require account owner to change password after first login.</p>
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
