📅 Class Scheduler
A full-stack course scheduling application built for a university department to replace a manual Excel-based workflow. Administrators can assign instructors, rooms, and meeting times to courses while the system automatically detects scheduling conflicts in real time.

Client: Department of Chemistry & Physics — Dr. Georgina Little
Built as: College Senior Finals Project (Solo)


🖥️ Screenshots

Add screenshots here — drag images into a GitHub issue to get a URL, then paste below

![Dashboard](your-screenshot-url-here)
![Calendar View](your-screenshot-url-here)

✨ Features

Weekly Calendar View — visualize the full department schedule day by day
Course Management — create, edit, and delete course sections
Instructor Assignment — assign faculty to sections with workload tracking
Room Assignment — assign classrooms with seat capacity validation
Conflict Detection — automatically prevents instructor and room double-booking
Schedule Filtering — filter by instructor, room, or course code
CSV Data Import — seed scheduling data quickly for testing and demos
Admin Dashboard — manage all scheduled sections from one place


🛠️ Tech Stack
LayerTechnologyFrontendReact, TypeScript, Vite, CSSBackendPython, FastAPIDatabasePostgreSQLORMSQLAlchemy / AlembicAuthJWT (JSON Web Tokens)APIREST

🚀 Getting Started
Prerequisites

Node.js
Python 3.10+
PostgreSQL

1. Clone the repo
bashgit clone https://github.com/JustLeaveitBlank1/Class-Scheduler.git
cd Class-Scheduler
2. Set up the backend
bashcd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
Edit .env and add your PostgreSQL password.
3. Set up the database
bashpython reset_db.py
4. Run the backend
bashuvicorn app.main:app --reload
API available at http://127.0.0.1:8000
Swagger docs at http://127.0.0.1:8000/docs
5. Set up and run the frontend
bashcd frontend
npm install
npm run dev

📁 Project Structure
Class-Scheduler/
├── backend/
│   ├── app/
│   │   ├── core/        # Auth, config, security
│   │   ├── db/          # Models, schemas, database
│   │   ├── routes/      # API endpoints
│   │   └── services/    # Email, business logic
│   └── alembic/         # Database migrations
└── frontend/
    └── src/
        ├── api/          # API client
        └── components/   # React components

📌 About This Project
This application was built to solve a real problem — the client's department was managing complex semester schedules through a large Excel workbook. The system was difficult to maintain and lacked visual tools for catching conflicts.
The goal was to replace that workflow with a web-based interface that makes scheduling intuitive, validates rules automatically, and gives administrators a clear visual overview of the entire semester.

👤 Author
Austin Sprunk
GitHub
