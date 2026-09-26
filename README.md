# LevelUp — Health & Lifestyle Management System

LevelUp is a **Health & Lifestyle Management System designed for college students**. It combines habit building, health tracking, productivity, and gamification into one platform.

The project consists of a **React + Vite frontend** and a **FastAPI backend**.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* JavaScript
* Axios

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* JWT Authentication
* Pydantic

---

# 🚀 Getting Started

Follow the steps below to run the project locally.

## 1. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/Aanyas08/Levelup-updated.git
```

Then move into the project folder:

```bash
cd Levelup-updated
```

---

# 2. Frontend Setup

Open a terminal in the project root.

Install the frontend dependencies:

```bash
npm install
```

After installation, start the frontend:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

Keep this terminal running.

---

# 3. Backend Setup

Open a **new terminal**.

Move into the backend folder:

```bash
cd backend
```

## Create a Python Virtual Environment

Windows:

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

If activation is successful, you should see `(venv)` in your terminal.

---

## 4. Install Backend Dependencies

With the virtual environment activated, run:

```bash
pip install -r requirements.txt
```

---

# 5. Configure Environment Variables

The actual `.env` file is **not included in GitHub** for security reasons.

Inside the `backend` folder, create a new file named:

```text
.env
```

You can use `.env.example` as a reference.

Example:

```env
DATABASE_URL=sqlite:///./levelup.db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Important

Do **not** commit your `.env` file to GitHub.

The `.gitignore` file already prevents it from being uploaded.

---

# 6. Start the Backend

Make sure you are inside the `backend` folder and your virtual environment is activated.

Run:

```bash
uvicorn app.main:app --reload
```

The backend will normally run at:

```text
http://127.0.0.1:8000
```

FastAPI's interactive API documentation will be available at:

```text
http://127.0.0.1:8000/docs
```

Keep this terminal running.

---

# 📁 Project Structure

```text
Levelup-updated/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── security.py
│   │   ├── deps.py
│   │   ├── routes_auth.py
│   │   └── routes_quote.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── src/
│   ├── api/
│   ├── auth/
│   ├── components/
│   ├── game/
│   ├── hooks/
│   └── pages/
│
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── .gitignore
```

---

# ▶️ Running the Complete Project

You need **two terminals** running at the same time.

### Terminal 1 — Frontend

From the project root:

```bash
npm run dev
```

### Terminal 2 — Backend

From the project root:

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

Then open:

```text
http://localhost:5173
```

---

# 🔄 Updating the Project

If your collaborator makes changes and wants to get the latest version:

```bash
git pull
```

If you make changes and want to upload them:

```bash
git add .
git commit -m "Describe your changes"
git push
```

Your collaborator can then run:

```bash
git pull
```

to receive the latest changes.

---

# 👥 Collaboration Workflow

Before starting work:

```bash
git pull
```

After making changes:

```bash
git add .
git commit -m "Describe your changes"
git push
```

### Recommended Commit Messages

Examples:

```text
Added medication tracking
Fixed login authentication
Updated dashboard UI
Added health statistics
Fixed API connection
Updated habit tracking
```

---

# ⚠️ Important Notes

### Do not upload:

```text
.env
*.db
node_modules/
venv/
__pycache__/
```

These files are already included in `.gitignore`.

### Before starting the project

Make sure you have installed:

* Node.js
* npm
* Python
* Git

---

# 📌 Repository

GitHub Repository:

https://github.com/Aanyas08/Levelup-updated

---

## 👩‍💻 Team

LevelUp is developed as a college project focused on combining **health management, lifestyle improvement, productivity, and gamification for students**.
