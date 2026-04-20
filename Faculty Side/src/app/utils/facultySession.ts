import { api } from './api';

type SessionUser = {
  refId?: string;
  email?: string;
};

type FacultyListItem = {
  faculty_id: string;
  email?: string | null;
};

type FacultyListResponse = FacultyListItem[] | { data?: FacultyListItem[] };

type FacultyRecord = {
  faculty_id: string;
};

function getRows(payload: FacultyListResponse): FacultyListItem[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

export async function resolveFacultyId(user: SessionUser | null): Promise<string> {
  if (!user) throw new Error('No active faculty session.');

  const refId = (user.refId || '').trim();
  const email = (user.email || '').trim().toLowerCase();

  if (refId) {
    try {
      const record = await api.get<FacultyRecord>(`/faculty/${encodeURIComponent(refId)}`);
      if (record?.faculty_id) return record.faculty_id;
    } catch {
      // Fall through to lookup by search.
    }
  }

  const searchTerm = email || refId;
  if (!searchTerm) throw new Error('Faculty identifier is missing from your account session.');

  const list = await api.get<FacultyListResponse>(`/faculty?search=${encodeURIComponent(searchTerm)}`);
  const rows = getRows(list);

  const exactByEmail = rows.find((row) => (row.email || '').trim().toLowerCase() === email);
  const candidate = exactByEmail || rows[0];

  if (!candidate?.faculty_id) {
    throw new Error('Faculty profile not found. Please contact the Dean/Admin to verify your account mapping.');
  }

  return candidate.faculty_id;
}
