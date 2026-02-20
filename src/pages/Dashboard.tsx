import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchStaff, fetchTodayRecords, type Staff, type AttendanceRecord } from '../lib/api'

export default function Dashboard() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([fetchStaff(), fetchTodayRecords()])
      .then(([s, r]) => {
        setStaff(s)
        setTodayRecords(r)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const presentCount = todayRecords.length
  const absentCount = staff.length - presentCount
  const checkedOut = todayRecords.filter((r) => r.checkOut).length

  const recent = useMemo(() => {
    return [...todayRecords]
      .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
      .slice(0, 8)
  }, [todayRecords])

  if (loading) return <div className="text-muted">Loading...</div>
  if (error) return <div className="alert alert-err">{error}</div>

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">Total Staff</div>
          <div className="stat-value">{staff.length}</div>
          <Link to="/staff" className="stat-link">View all →</Link>
        </div>
        <div className="stat-card stat-present">
          <div className="stat-label">Present Today</div>
          <div className="stat-value">{presentCount}</div>
          <Link to="/attendance" className="stat-link">Check-in →</Link>
        </div>
        <div className="stat-card stat-absent">
          <div className="stat-label">Absent Today</div>
          <div className="stat-value">{absentCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Checked Out</div>
          <div className="stat-value">{checkedOut}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">Today's attendance</div>
        <div className="card-body">
          {recent.length === 0 ? (
            <p className="text-muted">No check-ins yet today. Go to Attendance to record.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => {
                    const s = staff.find((x) => x.id === r.staffId)
                    return (
                      <tr key={r.id}>
                        <td>
                          <strong>{s?.name ?? '—'}</strong>
                          <span className="text-muted" style={{ display: 'block', fontSize: '0.8em' }}>
                            {s?.employeeId}
                          </span>
                        </td>
                        <td>{new Date(r.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          {r.checkOut
                            ? new Date(r.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </td>
                        <td>
                          <span className={`badge ${r.checkOut ? 'badge-muted' : 'badge-success'}`}>
                            {r.checkOut ? 'Left' : 'In office'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {recent.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <Link to="/reports" className="btn btn-ghost">View full reports</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
