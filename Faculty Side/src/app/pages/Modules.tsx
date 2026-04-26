import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { BookOpen, FileText, Download, ExternalLink, Layers3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

type FacultyLoadRecord = {
  load_id?: number | null;
  schedule_id?: number | null;
  subject_code: string | null;
  subject_name: string | null;
  subject_units?: number | null;
  section: string | null;
  semester: string | null;
  academic_year: string | null;
  teaching_units: number | null;
};

type ModuleLesson = {
  lesson_id: number;
  topic_id: number;
  title: string;
  content_type: string | null;
  file_path: string | null;
  external_url: string | null;
  is_published: number | null;
  published_at: string | null;
  created_at: string | null;
};

type ModuleTopic = {
  topic_id: number;
  syllabus_id: number;
  week_number: number | null;
  topic_title: string;
  description: string | null;
  teaching_method: string | null;
  assessment: string | null;
  lessons: ModuleLesson[];
};

type SubjectModule = {
  syllabus_id: number;
  subject_code: string | null;
  subject_name: string | null;
  faculty_id: string;
  semester: string | null;
  academic_year: string | null;
  course_description: string | null;
  course_outcomes: string | null;
  grading_system: string | null;
  references_biblio: string | null;
  approved_by: string | null;
  is_approved: number;
  created_at: string | null;
  topics: ModuleTopic[];
};

type FacultyModulesResponse = {
  subject_code_filter: string | null;
  assigned_subjects: FacultyLoadRecord[];
  modules: SubjectModule[];
  warnings: string[];
};

function toResourceHref(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `/${trimmed}`;
}

function maybeResource(value: string | null): { href: string | null; text: string } {
  if (!value) return { href: null, text: "None" };
  const href = toResourceHref(value);
  return { href, text: value };
}

export default function Modules() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<FacultyLoadRecord[]>([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [modules, setModules] = useState<SubjectModule[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.refId) {
      setLoadingSubjects(false);
      setError("No faculty ID found for this session.");
      return;
    }

    let isMounted = true;
    setLoadingSubjects(true);

    api
      .get<FacultyLoadRecord[]>(`/faculty/${encodeURIComponent(user.refId)}/schedules`)
      .then((rows) => {
        if (!isMounted) return;
        const deduped = Array.from(
          new Map(
            (rows || [])
              .filter((row) => row.subject_code)
              .map((row) => [String(row.subject_code), row])
          ).values()
        );

        setSubjects(deduped);

        if (!selectedSubjectCode) {
          const firstSubjectCode = deduped.find((item) => item.subject_code)?.subject_code;
          if (firstSubjectCode) {
            setSelectedSubjectCode(firstSubjectCode);
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load teaching subjects.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoadingSubjects(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.refId]);

  useEffect(() => {
    if (!user?.refId || !selectedSubjectCode) {
      setModules([]);
      setWarnings([]);
      return;
    }

    let isMounted = true;
    setLoadingModules(true);
    setError("");

    api
      .get<FacultyModulesResponse>(
        `/faculty/${encodeURIComponent(user.refId)}/modules?subject_code=${encodeURIComponent(selectedSubjectCode)}`
      )
      .then((response) => {
        if (!isMounted) return;
        setModules(response.modules || []);
        setWarnings(response.warnings || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setModules([]);
        setWarnings([]);
        setError(err instanceof Error ? err.message : "Failed to load subject modules.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoadingModules(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.refId, selectedSubjectCode]);

  const totalTopics = useMemo(
    () => modules.reduce((sum, moduleItem) => sum + moduleItem.topics.length, 0),
    [modules]
  );

  const totalLessons = useMemo(
    () =>
      modules.reduce(
        (sum, moduleItem) => sum + moduleItem.topics.reduce((topicSum, topic) => topicSum + topic.lessons.length, 0),
        0
      ),
    [modules]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Subject Modules</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select a subject from your teaching load to view downloadable modules and lesson resources.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {warnings.map((warning) => (
        <div key={warning} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {warning}
        </div>
      ))}

      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Select Teaching Subject</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loadingSubjects ? (
            <p className="text-sm text-gray-500">Loading your subjects...</p>
          ) : subjects.length === 0 ? (
            <p className="text-sm text-gray-500">No subjects are currently assigned to your teaching load.</p>
          ) : (
            <div className="max-w-lg space-y-3">
              <label htmlFor="subject-filter" className="mb-2 block text-sm font-medium text-gray-700">
                Subject
              </label>
              <select
                id="subject-filter"
                value={selectedSubjectCode}
                onChange={(event) => setSelectedSubjectCode(event.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {subjects
                  .filter((subject) => !!subject.subject_code)
                  .map((subject) => (
                    <option key={`${subject.subject_code}`} value={subject.subject_code || ""}>
                      {subject.subject_name || subject.subject_code} ({subject.subject_code})
                    </option>
                  ))}
              </select>
              <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
                Need to add a new module/syllabus for this subject?
                <Link to="/authored-syllabi" className="ml-2 font-semibold underline hover:text-orange-900">
                  Add in Authored Syllabi
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Syllabi</p>
                <p className="mt-1 text-3xl font-semibold text-orange-600">{modules.length}</p>
              </div>
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Topics</p>
                <p className="mt-1 text-3xl font-semibold text-amber-600">{totalTopics}</p>
              </div>
              <Layers3 className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Lesson Files</p>
                <p className="mt-1 text-3xl font-semibold text-orange-600">{totalLessons}</p>
              </div>
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Module Content</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {loadingModules ? (
            <p className="text-sm text-gray-500">Loading module resources...</p>
          ) : modules.length === 0 ? (
            <p className="text-sm text-gray-500">No syllabus module found for the selected subject.</p>
          ) : (
            modules.map((moduleItem) => {
              const reference = maybeResource(moduleItem.references_biblio);

              return (
                <div key={moduleItem.syllabus_id} className="rounded-xl border border-gray-200 p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {moduleItem.subject_name || moduleItem.subject_code || "Subject Module"}
                      </h3>
                      <p className="text-sm text-gray-500">Syllabus #{moduleItem.syllabus_id}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {moduleItem.subject_code && <Badge variant="outline">{moduleItem.subject_code}</Badge>}
                      {moduleItem.semester && <Badge variant="outline">{moduleItem.semester}</Badge>}
                      {moduleItem.academic_year && <Badge variant="outline">{moduleItem.academic_year}</Badge>}
                      <Badge className={moduleItem.is_approved ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                        {moduleItem.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                  </div>

                  {moduleItem.course_description && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Course Description</p>
                      <p className="mt-1 text-sm text-gray-700">{moduleItem.course_description}</p>
                    </div>
                  )}

                  {moduleItem.course_outcomes && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Course Outcomes</p>
                      <p className="mt-1 text-sm text-gray-700">{moduleItem.course_outcomes}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">References / Main Module File</p>
                    {reference.href ? (
                      <a
                        href={reference.href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-orange-700 hover:text-orange-800"
                      >
                        Open reference
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-gray-700">{reference.text}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Weekly Topics and Lessons</p>
                    {moduleItem.topics.length === 0 ? (
                      <p className="text-sm text-gray-500">No topics added to this syllabus yet.</p>
                    ) : (
                      moduleItem.topics.map((topic) => (
                        <div key={topic.topic_id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium text-gray-900">
                              {topic.week_number ? `Week ${topic.week_number}: ` : ""}
                              {topic.topic_title}
                            </p>
                            {topic.assessment && <Badge variant="outline">{topic.assessment}</Badge>}
                          </div>

                          {topic.description && <p className="mt-1 text-sm text-gray-700">{topic.description}</p>}

                          <div className="mt-3 space-y-2">
                            {topic.lessons.length === 0 ? (
                              <p className="text-xs text-gray-500">No lessons uploaded for this topic.</p>
                            ) : (
                              topic.lessons.map((lesson) => {
                                const fileHref = toResourceHref(lesson.file_path);
                                const externalHref = toResourceHref(lesson.external_url);

                                return (
                                  <div key={lesson.lesson_id} className="rounded-md border border-gray-200 bg-white p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                          {lesson.content_type && <Badge variant="outline">{lesson.content_type}</Badge>}
                                          <Badge className={lesson.is_published ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}>
                                            {lesson.is_published ? "Published" : "Draft"}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        {fileHref && (
                                          <a
                                            href={fileHref}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-100"
                                          >
                                            <Download className="h-3.5 w-3.5" />
                                            File
                                          </a>
                                        )}
                                        {externalHref && (
                                          <a
                                            href={externalHref}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                                          >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            Link
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
