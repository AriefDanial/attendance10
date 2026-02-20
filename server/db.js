import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, 'attendance.db')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    role TEXT,
    employee_id TEXT
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    staff_id TEXT NOT NULL,
    date TEXT NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
  CREATE INDEX IF NOT EXISTS idx_attendance_staff ON attendance(staff_id);
`)

// Seed default staff if empty
const count = db.prepare('SELECT COUNT(*) as n FROM staff').get()
if (count.n === 0) {
  const insert = db.prepare(
    'INSERT INTO staff (id, name, email, department, role, employee_id) VALUES (?, ?, ?, ?, ?, ?)'
  )
  insert.run('1', 'Sarah Chen', 'sarah.chen@company.com', 'Engineering', 'Developer', 'EMP001')
  insert.run('2', 'James Wilson', 'james.wilson@company.com', 'HR', 'HR Manager', 'EMP002')
  insert.run('3', 'Maria Garcia', 'maria.garcia@company.com', 'Operations', 'Operations Lead', 'EMP003')
}

export default db
