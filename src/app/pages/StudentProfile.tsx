import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { api } from "../utils/api";
import { useNavigate } from "react-router";

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  program: string;
  yearLevel: string;
  section: string;
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
  skills: string;
}

export function StudentProfile() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

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
        skills: s.skills || '',
      })));
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const normalizedSearch = searchQuery.toLowerCase().trim();
    const normalizedSkillFilter = skillFilter.toLowerCase().trim();

    const matchesSearch =
      !normalizedSearch ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(normalizedSearch) ||
      student.studentId.toLowerCase().includes(normalizedSearch);

    const matchesSkill =
      !normalizedSkillFilter ||
      student.skills
        .toLowerCase()
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
        .some((skill) => skill.includes(normalizedSkillFilter));

    return matchesSearch && matchesSkill;
  });

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
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or student ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Filter by skill (e.g., Basketball)"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSkillFilter("Basketball")}
                  className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-200"
                >
                  Basketball
                </button>
                <button
                  type="button"
                  onClick={() => setSkillFilter("Programming")}
                  className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-200"
                >
                  Programming
                </button>
                {skillFilter && (
                  <button
                    type="button"
                    onClick={() => setSkillFilter("")}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                  >
                    Clear Skill Filter
                  </button>
                )}
              </div>
            </div>
            <button 
              onClick={() => navigate('/students/new')}
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
                    Skills
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
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-[220px]">
                      <p className="truncate">{student.skills || '-'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/students/${student.id}`)}
                          title="View student"
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/students/${student.id}/edit`)}
                          title="Edit student"
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(student.id)}
                          title="Delete student"
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
    </div>
  );
}
