import { useState, useEffect } from 'react'
import { fetchStaff, fetchTodayRecords, checkIn as apiCheckIn, checkOut as apiCheckOut, type Staff, type AttendanceRecord } from '../lib/api'

export default function Attendance() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string>('')
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([fetchStaff(), fetchTodayRecords()])
      .then(([s, r]) => {
        setStaff(s)
        setTodayRecords(r)
      })
      .catch(() => setMessage({ type: 'err', text: 'Failed to load data' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const showMsg = (type: 'ok' | 'err', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleCheckIn = async () => {
    if (!selectedId) {
      showMsg('err', 'Select a staff member')
      return
    }
    const existing = todayRecords.find((r) => r.staffId === selectedId)
    if (existing) {
      showMsg('err', 'Already checked in today')
      return
    }
    setBusy(true)
    try {
      await apiCheckIn(selectedId)
      const s = staff.find((x) => x.id === selectedId)
      showMsg('ok', `${s?.name ?? 'Staff'} checked in`)
      setSelectedId('')
      load()
    } catch (e) {
      showMsg('err', e instanceof Error ? e.message : 'Check-in failed')
    } finally {
      setBusy(false)
    }
  }

  const handleCheckOut = async () => {
    if (!selectedId) {
      showMsg('err', 'Select a staff member')
      return
    }
    const existing = todayRecords.find((r) => r.staffId === selectedId && !r.checkOut)
    if (!existing) {
      showMsg('err', 'No active check-in found for this staff')
      return
    }
    setBusy(true)
    try {
      await apiCheckOut(selectedId)
      const s = staff.find((x) => x.id === selectedId)
      showMsg('ok', `${s?.name ?? 'Staff'} checked out`)
      setSelectedId('')
      load()
    } catch (e) {
      showMsg('err', e instanceof Error ? e.message : 'Check-out failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="text-muted">Loading...</div>

  return (
    <div className="page-attendance">
      <h2 className="page-title">Attendance</h2>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="attendance-cards">
        <div className="card">
          <div className="card-header">Check in</div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Staff member</label>
              <select
                className="form-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">Select...</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.employeeId})
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btn btn-success" onClick={handleCheckIn} disabled={busy}>
              {busy ? '...' : 'Check in'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Check out</div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Staff member</label>
              <select
                className="form-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">Select...</option>
                {staff
                  .filter((s) => todayRecords.some((r) => r.staffId === s.id && !r.checkOut))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.employeeId})
                    </option>
                  ))}
              </select>
            </div>
            <button type="button" className="btn btn-primary" onClick={handleCheckOut} disabled={busy}>
              {busy ? '...' : 'Check out'}
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">Today's log</div>
        <div className="card-body">
          {todayRecords.length === 0 ? (
            <p className="text-muted">No attendance records for today.</p>
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
                  {todayRecords
                    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
                    .map((r) => {
                      const s = staff.find((x) => x.id === r.staffId)
                      return (
                        <tr key={r.id}>
                          <td><strong>{s?.name}</strong> <span className="text-muted">({s?.employeeId})</span></td>
                          <td>{new Date(r.checkIn).toLocaleTimeString('en-US')}</td>
                          <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-US') : '—'}</td>
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
        </div>
      </div>
    </div>
  )
}
