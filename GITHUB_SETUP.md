# Push this project to GitHub

Follow these steps in a terminal (PowerShell or Command Prompt) in your project folder.

## 1. Open the project folder

```bash
cd "c:\Users\User\OneDrive\Attachments\Desktop\attendance10"
```

## 2. Initialize Git and make the first commit

If this is the first time (no `.git` folder), run:

```bash
git init
git add .
git commit -m "Initial commit: Office Attendance System with SQLite"
```

If you already ran `git init` before and it failed, delete the `.git` folder first, then run the three commands above:

```bash
Remove-Item -Recurse -Force .git
git init
git add .
git commit -m "Initial commit: Office Attendance System with SQLite"
```

## 3. Create a new repository on GitHub

1. Go to [github.com](https://github.com) and sign in.
2. Click **+** (top right) → **New repository**.
3. Choose a name (e.g. `attendance10` or `office-attendance`).
4. Leave it **empty** (no README, no .gitignore).
5. Click **Create repository**.

## 4. Connect and push

GitHub will show you commands. Use these (replace `YOUR_USERNAME` and `REPO_NAME` with your GitHub username and repo name):

```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

Example if your username is `jane` and repo is `attendance10`:

```bash
git remote add origin https://github.com/jane/attendance10.git
git branch -M main
git push -u origin main
```

If GitHub asks for login, use a **Personal Access Token** as the password (Settings → Developer settings → Personal access tokens).

---

Your `.gitignore` already excludes `node_modules`, `dist`, and `server/attendance.db`, so they won’t be pushed.
