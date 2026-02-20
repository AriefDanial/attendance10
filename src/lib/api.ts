const API = import.meta.env.VITE_API_URL ?? '/api'

export interface Staff {
  id: string
  name: string
  email: string
  department: string
  role: string
  employeeId: string
}

export interface AttendanceRecord {
  id: string
  staffId: string
  date: string
  checkIn: string
  checkOut: string | null
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function fetchStaff(): Promise<Staff[]> {
  return request<Staff[]>('/staff')
}

export async function fetchStaffById(id: string): Promise<Staff | undefined> {
  try {
    return await request<Staff>(`/staff/${id}`)
  } catch {
    return undefined
  }
}

export async function createStaff(body: Omit<Staff, 'id'>): Promise<Staff> {
  return request<Staff>('/staff', { method: 'POST', body: JSON.stringify(body) })
}

export async function updateStaff(id: string, body: Partial<Omit<Staff, 'id'>>): Promise<Staff> {
  return request<Staff>(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function deleteStaff(id: string): Promise<void> {
  return request(`/staff/${id}`, { method: 'DELETE' })
}

export async function fetchTodayRecords(): Promise<AttendanceRecord[]> {
  return request<AttendanceRecord[]>('/attendance/today')
}

export async function fetchRecords(params?: { from?: string; to?: string; staffId?: string }): Promise<AttendanceRecord[]> {
  const q = new URLSearchParams()
  if (params?.from) q.set('from', params.from)
  if (params?.to) q.set('to', params.to)
  if (params?.staffId) q.set('staffId', params.staffId)
  const query = q.toString()
  return request<AttendanceRecord[]>(`/attendance${query ? `?${query}` : ''}`)
}

export async function checkIn(staffId: string): Promise<AttendanceRecord> {
  return request<AttendanceRecord>('/attendance/check-in', {
    method: 'POST',
    body: JSON.stringify({ staffId }),
  })
}

export async function checkOut(staffId: string): Promise<AttendanceRecord> {
  return request<AttendanceRecord>('/attendance/check-out', {
    method: 'POST',
    body: JSON.stringify({ staffId }),
  })
}
