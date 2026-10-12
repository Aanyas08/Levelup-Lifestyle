# LevelUp — Lifestyle & Health Management System

**LevelUp** is an AI-powered Lifestyle and Health Management System designed to help college students and young adults manage their daily habits, productivity, wellness, and medications through a unified platform.

The project combines habit tracking, health management, gamification, and personalized AI-generated insights to encourage healthier routines and consistent self-improvement.

## ✨ Key Features

### 1. Lifestyle & Habit Management
- Create and manage personal habits and daily tasks.
- Track habit completion and progress.
- Support different habit types and schedules.
- Monitor consistency and streaks.

### 2. Health & Wellness Tracking
- Track daily wellness activities and health-related information.
- Monitor lifestyle routines and personal progress.
- Organize wellness activities in one place.

### 3. Medication Management
- Add and manage medicines.
- Set dosage details and medication schedules.
- View today's medication schedule.
- Record medication status, including taken or missed doses.
- View medication history and adherence information.

### 4. AI-Powered Insights
- Generate personalized daily insights and motivational content.
- Provide wellness and hydration suggestions based on available user information.
- Support habit-building through personalized recommendations.

*AI-generated guidance is intended for general wellness support and is not a substitute for professional medical advice.*

### 5. Gamification & Rewards
- Encourage consistency through progress tracking.
- Integrate habits with gamified progression.
- Motivate users through rewards, achievements, and streaks.

### 6. Dashboard & Progress Tracking
- Access important information from a central dashboard.
- View relevant habit, wellness, and medication information.
- Monitor progress and daily activities.

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS, CSS |
| Backend | Python, FastAPI |
| Database | SQLite |
| ORM | SQLAlchemy |
| Authentication | JWT |
| AI Integration | Google Gemini API |
| Version Control | Git and GitHub |

## 📁 Project Structure

```text
project/
├── backend/
│   └── app/
│       ├── main.py
│       ├── models.py
│       ├── schemas.py
│       ├── security.py
│       ├── routes_medications.py
│       ├── routes_wellness.py
│       └── services/
├── src/
│   ├── api/
│   │   └── client.js
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   └── index.css
├── index.html
├── package.json
├── requirements.txt
├── .env.example
└── README.md
```

*The exact files and folders may vary depending on the latest version of the repository.*

## 🚀 Getting Started

Follow these steps to run LevelUp on your local machine.

### Prerequisites

Install the following before starting:

- [Node.js](https://nodejs.org/) and npm
- [Python](https://www.python.org/) (a version compatible with the project's dependencies)
- [Git](https://git-scm.com/)
- A code editor such as Visual Studio Code

### Step 1: Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/Aanyas08/Levelup-updated.git
cd Levelup-updated
```

Navigate into the folder containing `package.json` and the backend directory if the repository has an additional nested project folder.

### Step 2: Set Up the Backend

Open a terminal in the backend folder containing `requirements.txt` or the backend's Python dependency file.

Create a virtual environment:

**Windows**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux**
```bash
python3 -m venv venv
source venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Create a `.env` file in the location expected by the backend configuration.

Add the required variables using the project's configuration:

```env
SECRET_KEY=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace the placeholder values with your own secrets. If the application does not use AI locally, configure the Gemini key only if required by the current implementation.

**Important:** Never commit your `.env` file, API keys, passwords, or other secrets to GitHub.

### Step 4: Start the Backend

From the directory where the FastAPI application is configured, activate the virtual environment and run:

```bash
uvicorn app.main:app --reload
```

If your project uses a different Python package path, adjust the command to match the location of `main.py`.

The backend will typically be available at:

```text
http://127.0.0.1:8000
```

FastAPI interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

### Step 5: Set Up the Frontend

Open a **new terminal** in the frontend directory containing `package.json`.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal, typically:

```text
http://localhost:5173
```

Keep both the frontend and backend terminals running while using the application.

## 🔐 Authentication & Data

- The application uses JWT-based authentication.
- User-specific data is managed through the backend and database.
- Local development requires the appropriate environment variables.
- Do not share production credentials or private API keys.

## 🤖 AI Integration

LevelUp aims to use AI to make lifestyle management more personalized by using available information such as habits, wellness activity, and medication schedules to provide relevant insights.

AI-generated suggestions should remain general and supportive. Users should follow the instructions of qualified healthcare professionals for medication decisions or medical concerns.

## 🔮 Future Enhancements

Potential extensions include:

- More advanced behavioral pattern analysis.
- Adaptive goals and personalized routines.
- Expanded health analytics and monthly reports.
- Improved notification support.
- Optional computer-vision-based activity verification.
- Additional nutrition and mental wellness features.

## 🎓 Project Objective

The objective of LevelUp is to bring lifestyle management, productivity, wellness tracking, medication management, and personalized guidance together in one platform.

Rather than focusing only on habit formation, LevelUp aims to support a more integrated approach to daily life and health management for students and young adults.

## 👥 Contributors

Developed as a team academic project.

## 📄 License

This project is intended for academic and educational purposes. Add a specific open-source license if you decide to distribute it under one.
