import express from 'express'
import cors from 'cors'
import db from './db.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true }))
app.use(express.json())

// Staff
app.get('/api/staff', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, name, email, department, role, employee_id AS employeeId FROM staff').all()
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: String(e.message) })
  }
})

app.get('/api/staff/:id', (req, res) => {
  try {
    const row = db
      .prepare('SELECT id, name, email, department, role, employee_id AS employeeId FROM staff WHERE id = ?')
      .get(req.params.id)
    if (!row) return res.status(404).json({ error: 'Not found' })
    res.json(row)
  } catch (e) {
    res.status(500).json({ error: String(e.message) })
  }
})

app.post('/api/staff', (req, res) => {
  try {
    const { name, email, department, role, employeeId } = req.body
    const id = String(Date.now())
    db.prepare(
      'INSERT INTO staff (id, name, email, department, role, employee_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, name || '', email || '', department || 'Engineering', role || '', employeeId || '')
    const row = db
      .prepare('SELECT id, name, email, department, role, employee_id AS employeeId FROM staff WHERE id = ?')
      .get(id)
    res.status(201).json(row)
  } catch (e) {
    res.status(500).json({ error: String(e.message) })
  }
})

app.put('/api/staff/:id', (req, res) => {
  try {
    const { name, email, department, role, employeeId } = req.body
    db.prepare(
      'UPDATE staff SET name = ?, email = ?, department = ?, role = ?, employee_id = ? WHERE id = ?'
    ).run(name, email, department, role, employeeId, req.params.id)
    const row = db
      .prepare('SELECT id, name, email, department, role, employee_id AS employeeId FROM staff WHERE id = ?')
      .get(req.params.id)
    if (!row) return res.status(404).json({ error: 'Not found' })
    res.json(row)
  } catch (e) {
    res.status(500).json({ error: String(e.message) })
  }
})

app.delete('/api/staff/:id', (req, res) => {
  try {
    const r = db.prepare('DELETE FROM staff WHERE id = ?').run(req.params.id)
    if (r.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) {
    res.status(500).json({ error: String(e.message) })
  }
})

// Attendance
function rowToRecord(row) {
  return {
    id: row.id,
    staffId: row.staff_id,
    date: row.date,
    checkIn: row.check_in,
    checkOut: row.check_out,
  }
}

app.get('/api/attendance/today', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const rows = db
      .prepare('SELECT id, staff_id, date, check_in, check_out FROM attendance WHERE date = ? ORDER BY check_in DESC')
      .all(today)
    res.json(rows.map(rowToRecord))
  } catch (e) {
    res.status(500).json({ error: String(e.message) })
  }
})

app.get('/api/attendance', (req, res) => {
  try {
    const { from, to, staffId } = req.query
    let sql = 'SELECT id, staff_id, date, check_in, check_out FROM attendance WHERE 1=1'
    const params = []
    if (from) {
      params.push(from)
      sql += ' AND date >= ?'
    }
    if (to) {
      params.push(to)
      sql += ' AND date <= ?'
    }
    if (staffId) {
      params.push(staffId)
      sql += ' AND staff_id = ?'
    }
    sql += ' ORDER BY date DESC, check_in DESC'
    const rows = db.prepare(sql).all(...params)
    res.json(rows.map(rowToRecord))
  } catch (e) {
    res.status(500).json({ error: String(e.message) })
  }
})

app.post('/api/attendance/check-in', (req, res) => {
  try {
    const { staffId } = req.body
    const today = new Date().toISOString().slice(0, 10)
    const existing = db
      .prepare('SELECT id, staff_id, date, check_in, check_out FROM attendance WHERE staff_id = ? AND date = ?')
      .get(staffId, today)
    if (existing) return res.json(rowToRecord(existing))
    const id = 'rec-' + Date.now()
    const checkIn = new Date().toISOString()
    db.prepare('INSERT INTO attendance (id, staff_id, date, check_in, check_out) VALUES (?, ?, ?, ?, NULL)').run(
      id,
      staffId,
      today,
      checkIn
    )
    res.status(201).json({ id, staffId, date: today, checkIn, checkOut: null })
  } catch (e) {
    res.status(500).json({ error: String(e.message) })
  }
})

app.post('/api/attendance/check-out', (req, res) => {
  try {
    const { staffId } = req.body
    const today = new Date().toISOString().slice(0, 10)
    const checkOut = new Date().toISOString()
    const r = db
      .prepare('UPDATE attendance SET check_out = ? WHERE staff_id = ? AND date = ? AND check_out IS NULL')
      .run(checkOut, staffId, today)
    if (r.changes === 0) return res.status(400).json({ error: 'No active check-in found' })
    const row = db
      .prepare('SELECT id, staff_id, date, check_in, check_out FROM attendance WHERE staff_id = ? AND date = ?')
      .get(staffId, today)
    res.json(rowToRecord(row))
  } catch (e) {
    res.status(500).json({ error: String(e.message) })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
