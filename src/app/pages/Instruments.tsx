import { useState, useEffect, useRef } from "react";
import { FileText, Download, Upload, Plus, Search, X, Trash2 } from "lucide-react";
import { api } from "../utils/api";

interface Instrument {
  id: string;
  title: string;
  type: "syllabus" | "conclusion" | "lesson";
  courseCode: string;
  instructor: string;
  uploadDate: string;
  fileSize: string;
  fileUrl: string;
  academicYear?: string;
  semester?: string;
  facultyId?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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
  const PAGE_SIZE = 10;
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [subjects, setSubjects] = useState<Array<{ subject_code: string; subject_name: string }>>([]);
  const [facultyOptions, setFacultyOptions] = useState<Array<{ faculty_id: string; first_name: string; last_name: string; specialization?: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<Instrument | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Omit<Instrument, "id">>({
    title: "",
    type: "syllabus",
    courseCode: "",
    instructor: "",
    uploadDate: new Date().toISOString().split('T')[0],
    fileSize: "",
  });

  const toInstrumentFromCombinedRow = (row: any, resolveFileUrl: (value: string | null | undefined) => string): Instrument => ({
    id: String(row.item_id || row.id),
    title: row.title || '',
    type: (row.item_type || row.type || 'lesson') as Instrument['type'],
    courseCode: row.subject_code || row.course_code || '',
    instructor: `${row.faculty_first_name || ''} ${row.faculty_last_name || ''}`.trim(),
    uploadDate: row.created_at ? String(row.created_at).split('T')[0] : '',
    fileSize: 'N/A',
    fileUrl: resolveFileUrl(row.file_url || row.fileUrl),
    academicYear: row.academic_year || undefined,
    semester: row.semester || undefined,
    facultyId: row.faculty_id || undefined,
  });

  const applyClientPagination = (rows: Instrument[]) => {
    const offset = (currentPage - 1) * PAGE_SIZE;
    const pagedRows = rows.slice(offset, offset + PAGE_SIZE);
    setInstruments(pagedRows);
    setPagination({
      page: currentPage,
      limit: PAGE_SIZE,
      total: rows.length,
      totalPages: Math.max(1, Math.ceil(rows.length / PAGE_SIZE)),
    });
  };

  const fetchInstruments = async () => {
    try {
      const backendBaseUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
      const resolveFileUrl = (value: string | null | undefined) => {
        if (!value) return '';
        if (value.startsWith('http://') || value.startsWith('https://')) return value;
        if (value.startsWith('/uploads/')) return `${backendBaseUrl}${value}`;
        return '';
      };

      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE),
      });
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (selectedType !== 'all') params.set('type', selectedType);

      let response: any;
      try {
        response = await api.get<any[] | { data: any[]; pagination?: PaginationMeta }>(`/instruments?${params.toString()}`);
      } catch (primaryError) {
        // Backward compatibility for servers that only expose /instruments/syllabus and /instruments/lessons.
        const [syllabiRows, lessonRows] = await Promise.all([
          api.get<any[]>('/instruments/syllabus').catch(() => []),
          api.get<any[]>('/instruments/lessons').catch(() => []),
        ]);

        const combined = [
          ...syllabiRows.map((row) => ({
            item_id: row.syllabus_id,
            item_type: 'syllabus',
            title: `${row.subject_name || row.subject_code || 'Untitled'} Syllabus`,
            subject_code: row.subject_code,
            faculty_first_name: row.faculty_first_name,
            faculty_last_name: row.faculty_last_name,
            created_at: row.created_at,
            file_url: row.references_biblio,
          })),
          ...lessonRows.map((row) => ({
            item_id: row.lesson_id,
            item_type: 'lesson',
            title: row.title || `Lesson ${row.lesson_id}`,
            subject_code: row.subject_code,
            faculty_first_name: row.faculty_first_name,
            faculty_last_name: row.faculty_last_name,
            created_at: row.created_at,
            file_url: row.file_path || row.external_url,
          })),
        ];

        const filtered = combined.filter((row) => {
          if (selectedType !== 'all' && row.item_type !== selectedType) return false;
          if (!searchQuery.trim()) return true;

          const query = searchQuery.trim().toLowerCase();
          const title = String(row.title || '').toLowerCase();
          const subjectCode = String(row.subject_code || '').toLowerCase();
          const instructor = `${row.faculty_first_name || ''} ${row.faculty_last_name || ''}`.toLowerCase();
          return title.includes(query) || subjectCode.includes(query) || instructor.includes(query);
        });

        filtered.sort((a, b) => {
          const left = new Date(a.created_at || 0).getTime();
          const right = new Date(b.created_at || 0).getTime();
          return right - left;
        });

        const mapped = filtered.map((row) => toInstrumentFromCombinedRow(row, resolveFileUrl));
        applyClientPagination(mapped);
        return;
      }

      const isLegacyResponse = Array.isArray(response);
      const allRows = isLegacyResponse ? response : (response.data || []);
      const legacyOffset = (currentPage - 1) * PAGE_SIZE;
      const rows = isLegacyResponse
        ? allRows.slice(legacyOffset, legacyOffset + PAGE_SIZE)
        : allRows;
      const meta = isLegacyResponse
        ? {
          page: currentPage,
          limit: PAGE_SIZE,
          total: allRows.length,
          totalPages: Math.max(1, Math.ceil(allRows.length / PAGE_SIZE)),
        }
        : (response.pagination || {
          page: currentPage,
          limit: PAGE_SIZE,
          total: allRows.length,
          totalPages: 1,
        });

      setInstruments(rows.map((row) => toInstrumentFromCombinedRow(row, resolveFileUrl)));
      setPagination({
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: Math.max(1, meta.totalPages),
      });
    } catch (err) {
      console.error('Failed to fetch instruments:', err);
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, [currentPage, searchQuery, selectedType]);

  useEffect(() => {
    api.get<Array<{ subject_code: string; subject_name: string }>>('/subjects')
      .then(setSubjects)
      .catch((err) => console.error('Failed to fetch subjects:', err));

    api.get<Array<{ faculty_id: string; first_name: string; last_name: string; specialization?: string }>>('/faculty')
      .then(setFacultyOptions)
      .catch((err) => console.error('Failed to fetch faculty:', err));
  }, []);

  const handleAddInstrument = async () => {
    setSubmitError('');
    const normalizedCourseCode = formData.courseCode.trim().toUpperCase();
    if (!normalizedCourseCode) {
      setSubmitError('Course code is required');
      return;
    }

    try {
      const endpoint = formData.type === 'syllabus'
        ? '/instruments/syllabus'
        : '/instruments/lessons';

      const selectedSubject = subjects.find((subject) => subject.subject_code === normalizedCourseCode);

      const payload = formData.type === 'syllabus'
        ? {
          title: formData.title,
          subject_code: normalizedCourseCode,
          subject_name: selectedSubject?.subject_name || formData.title,
          faculty_id: formData.instructor || undefined,
          course_description: selectedFileName || null,
          file_name: selectedFile?.name,
          mime_type: selectedFile?.type || undefined,
          file_data_base64: selectedFile
            ? await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ''));
              reader.onerror = () => reject(new Error('Failed to read selected file'));
              reader.readAsDataURL(selectedFile);
            })
            : undefined,
        }
        : {
          title: formData.title,
          subject_code: normalizedCourseCode,
          file_path: selectedFileName || null,
          file_name: selectedFile?.name,
          mime_type: selectedFile?.type || undefined,
          file_data_base64: selectedFile
            ? await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ''));
              reader.onerror = () => reject(new Error('Failed to read selected file'));
              reader.readAsDataURL(selectedFile);
            })
            : undefined,
        };

      await api.post(endpoint, {
        ...payload,
      });
      await fetchInstruments();
      setShowAddModal(false);
      setFormData({
        title: "",
        type: "syllabus",
        courseCode: "",
        instructor: "",
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: "",
      });
      setSelectedFileName('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to add instrument:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to add instrument');
    }
  };

  const handleFileSelection = (file: File | null) => {
    if (!file) {
      setSelectedFileName('');
      setSelectedFile(null);
      return;
    }

    const maxFileSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxFileSizeBytes) {
      setSubmitError('File is too large. Maximum supported size is 10 MB.');
      setSelectedFileName('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSubmitError('');
    setSelectedFile(file);
    setSelectedFileName(file.name);
    const sizeMb = file.size / (1024 * 1024);
    setFormData((prev) => ({ ...prev, fileSize: `${sizeMb.toFixed(2)} MB` }));
  };

  const handleViewDocument = (fileUrl: string) => {
    if (!fileUrl) {
      setSubmitError('No uploaded file is attached to this item.');
      return;
    }

    const isOfficeDoc = /\.(doc|docx)(\?|$)/i.test(fileUrl);
    if (isOfficeDoc) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInputChange = (field: keyof Omit<Instrument, "id">, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openDeleteModal = (item: Instrument) => {
    setDeleteError('');
    setPendingDeleteItem(item);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteError('');
    setPendingDeleteItem(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteItem) return;

    const endpoint = pendingDeleteItem.type === 'syllabus'
      ? `/instruments/syllabus/${encodeURIComponent(pendingDeleteItem.id)}`
      : pendingDeleteItem.type === 'lesson'
        ? `/instruments/lessons/${encodeURIComponent(pendingDeleteItem.id)}`
        : null;

    if (!endpoint) {
      setDeleteError('Delete is currently supported for syllabus and lesson documents only.');
      return;
    }

    try {
      await api.delete(endpoint);
      await fetchInstruments();
      closeDeleteModal();
    } catch (err) {
      console.error('Failed to delete instrument:', err);
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete instrument');
    }
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
                {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Syllabi on Page</p>
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
                <p className="text-sm text-gray-600 mb-1">Lessons on Page</p>
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
                <p className="text-sm text-gray-600 mb-1">Conclusions on Page</p>
                <p className="text-3xl font-bold text-green-600">
                  {instruments.filter(i => i.type === "conclusion").length}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>
      </div>
      <br></br>
        {/* Actions Bar */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or course code..."
                value={searchQuery}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchQuery(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setSelectedType("all");
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "all"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setSelectedType("syllabus");
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "syllabus"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Syllabus
              </button>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setSelectedType("lesson");
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "lesson"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Lesson
              </button>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setSelectedType("conclusion");
                }}
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
            {instruments.map((item) => (
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
                        {item.fileUrl ? (
                          <button
                            type="button"
                            onClick={() => handleViewDocument(item.fileUrl)}
                            className="text-left text-orange-700 hover:text-orange-800 hover:underline"
                            title="Open uploaded file"
                          >
                            {item.title}
                          </button>
                        ) : (
                          item.title
                        )}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{item.fileSize}</span>
                        </div>
                        <div>
                          <span>Instructor: {item.instructor || 'N/A'}</span>
                        </div>
                        {item.academicYear && (
                          <div>
                            <span>AY: {item.academicYear}</span>
                          </div>
                        )}
                        {item.semester && (
                          <div>
                            <span>Sem: {item.semester}</span>
                          </div>
                        )}
                        <div>
                          {item.fileUrl ? (
                            <button
                              type="button"
                              onClick={() => handleViewDocument(item.fileUrl)}
                              className="text-blue-700 hover:text-blue-800 hover:underline"
                              title="View uploaded file"
                            >
                              Uploaded: {item.uploadDate}
                            </button>
                          ) : (
                            <span>Uploaded: {item.uploadDate} (No file)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openDeleteModal(item)}
                      disabled={item.type === 'conclusion'}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      title={item.type === 'conclusion' ? 'Delete is not supported for conclusion documents' : 'Delete document'}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleViewDocument(item.fileUrl)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View uploaded file"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewDocument(item.fileUrl)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Open uploaded file"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} instruments)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((previous) => Math.min(pagination.totalPages, previous + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
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
            {submitError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            )}
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
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    list="instrument-course-code-options"
                    required
                    value={formData.courseCode}
                    onChange={(e) => handleInputChange("courseCode", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Type or select course code"
                  />
                  <datalist id="instrument-course-code-options">
                    {subjects.map((subject) => (
                      <option key={subject.subject_code} value={subject.subject_code}>
                        {subject.subject_code} - {subject.subject_name}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Instructor *</label>
                <select
                  required
                  value={formData.instructor}
                  onChange={(e) => handleInputChange("instructor", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select instructor</option>
                  {facultyOptions.map((faculty) => (
                    <option key={faculty.faculty_id} value={faculty.faculty_id}>
                      {faculty.first_name} {faculty.last_name} ({faculty.specialization || 'No expertise set'})
                    </option>
                  ))}
                </select>
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
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (MAX. 10MB)</p>
                  {selectedFileName && (
                    <p className="text-xs text-orange-700 mt-2">Selected: {selectedFileName}</p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFileSelection(e.target.files?.[0] || null)}
                />
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && pendingDeleteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900">Delete Document</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <span className="font-semibold text-gray-900">{pendingDeleteItem.title}</span>? This action cannot be undone.
            </p>
            {deleteError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}