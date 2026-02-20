import { useState, useEffect } from 'react'
import { fetchStaff, createStaff, updateStaff, deleteStaff, type Staff as StaffType } from '../lib/api'

export default function Staff() {
  const [staff, setStaff] = useState<StaffType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    role: '',
    employeeId: '',
  })

  const load = () => {
    setLoading(true)
    setError(null)
    fetchStaff()
      .then(setStaff)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm({ name: '', email: '', department: 'Engineering', role: '', employeeId: '' })
    setShowForm(true)
  }

  const openEdit = (s: StaffType) => {
    setEditingId(s.id)
    setForm({
      name: s.name,
      email: s.email,
      department: s.department,
      role: s.role,
      employeeId: s.employeeId,
    })
    setShowForm(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (editingId) {
        await updateStaff(editingId, form)
      } else {
        await createStaff(form)
      }
      setShowForm(false)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Remove this staff member? Their attendance history will be removed.')) return
    setError(null)
    try {
      await deleteStaff(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove')
    }
  }

  if (loading) return <div className="text-muted">Loading...</div>

  return (
    <div className="page-staff">
      <div className="page-head">
        <h2 className="page-title">Staff</h2>
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          + Add staff
        </button>
      </div>

      {error && <div className="alert alert-err">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">{editingId ? 'Edit staff' : 'Add staff'}</div>
          <div className="card-body">
            <form onSubmit={save}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="Full name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    placeholder="email@company.com"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input
                    className="form-input"
                    value={form.employeeId}
                    onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                    placeholder="EMP001"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={form.department}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                    className="form-input"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    placeholder="e.g. Developer"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body p-0">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td>{s.employeeId || '—'}</td>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.email}</td>
                    <td>{s.department}</td>
                    <td>{s.role || '—'}</td>
                    <td>
                      <button type="button" className="btn btn-ghost" style={{ marginRight: 8 }} onClick={() => openEdit(s)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => remove(s.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {staff.length === 0 && (
            <p className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>
              No staff yet. Add staff to start tracking attendance.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
