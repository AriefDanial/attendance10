import { useState, useEffect, useMemo } from 'react'
import { fetchStaff, fetchRecords, type Staff, type AttendanceRecord } from '../lib/api'

export default function Reports() {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [staff, setStaff] = useState<Staff[]>([])
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([fetchStaff(), fetchRecords({ from: dateFrom, to: dateTo, staffId: selectedStaffId || undefined })])
      .then(([s, r]) => {
        setStaff(s)
        setAllRecords(r)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [dateFrom, dateTo, selectedStaffId])

  const filtered = useMemo(() => allRecords, [allRecords])

  const byStaff = useMemo(() => {
    const map = new Map<string, { name: string; days: number; totalHours: number }>()
    for (const r of filtered) {
      const s = staff.find((x) => x.id === r.staffId)
      const key = r.staffId
      if (!map.has(key)) map.set(key, { name: s?.name ?? 'Unknown', days: 0, totalHours: 0 })
      const entry = map.get(key)!
      entry.days += 1
      if (r.checkOut) {
        const hours = (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / (1000 * 60 * 60)
        entry.totalHours += hours
      }
    }
    return Array.from(map.entries()).map(([id, v]) => ({ staffId: id, ...v }))
  }, [filtered, staff])

  if (loading) return <div className="text-muted">Loading...</div>
  if (error) return <div className="alert alert-err">{error}</div>

  return (
    <div className="page-reports">
      <h2 className="page-title">Reports</h2>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">Filters</div>
        <div className="card-body">
          <div className="form-row form-row-wrap">
            <div className="form-group">
              <label className="form-label">From date</label>
              <input
                type="date"
                className="form-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">To date</label>
              <input
                type="date"
                className="form-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Staff</label>
              <select
                className="form-select"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                <option value="">All staff</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">Summary by staff</div>
        <div className="card-body">
          {byStaff.length === 0 ? (
            <p className="text-muted">No records in this period.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Days present</th>
                    <th>Total hours</th>
                  </tr>
                </thead>
                <tbody>
                  {byStaff.map((row) => (
                    <tr key={row.staffId}>
                      <td><strong>{row.name}</strong></td>
                      <td>{row.days}</td>
                      <td>{row.totalHours.toFixed(1)} h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">Attendance log</div>
        <div className="card-body">
          {filtered.length === 0 ? (
            <p className="text-muted">No records in this period.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Staff</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filtered]
                    .sort((a, b) => b.date.localeCompare(a.date) || new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
                    .map((r) => {
                      const s = staff.find((x) => x.id === r.staffId)
                      const hours = r.checkOut
                        ? ((new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / (1000 * 60 * 60)).toFixed(1)
                        : '—'
                      return (
                        <tr key={r.id}>
                          <td>{r.date}</td>
                          <td>{s?.name ?? '—'}</td>
                          <td>{new Date(r.checkIn).toLocaleTimeString('en-US')}</td>
                          <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-US') : '—'}</td>
                          <td>{hours}</td>
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
