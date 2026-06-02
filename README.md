📅 Class Scheduler
A full-stack course scheduling application built for a university department to replace a manual Excel-based workflow. Administrators can assign instructors, rooms, and meeting times to courses while the system automatically detects scheduling conflicts in real time.

Client: Department of Chemistry & Physics — Dr. Georgina Little
Built as: College Senior Finals Project (Solo)


🖥️ Screenshots
Login & Sign Up
Login ScreenSign Up<img width="600" src="https://github.com/user-attachments/assets/0b6f5f86-60b2-45bf-afa0-b7090dcbff87" /><img width="600" src="https://github.com/user-attachments/assets/0c747e6d-6d78-4e31-b948-b5ddb66ffd3e" />
Calendar Views
Filter PanelFilter Panel (continued)<img width="600" src="https://github.com/user-attachments/assets/de6a1a5a-4177-4772-97a0-4b5a1b8fa750" /><img width="600" src="https://github.com/user-attachments/assets/b9bdeb0d-96db-4c07-88b2-6d7fba61dc6f" />
Week / Day / Month View Toggle<img width="900" src="https://github.com/user-attachments/assets/5f254ec6-7020-4cbc-8190-5f95bdb5d4e9" />
Scheduling Features
Hover TooltipCreate Class Options<img width="600" src="https://github.com/user-attachments/assets/0e768a13-b432-4d83-8ee6-2288a53cb090" /><img width="600" src="https://github.com/user-attachments/assets/72ef1a7c-8358-4e82-b449-6ea5a0ff3915" />
Create Class (continued)Teacher Credit Hours Dashboard<img width="600" src="https://github.com/user-attachments/assets/a73f9e9e-8367-4f6b-9b58-5f85df759841" /><img width="600" src="https://github.com/user-attachments/assets/be09225e-6417-421e-a7f6-50a9d8f28d17" />
Account
Sign Out<img width="900" src="https://github.com/user-attachments/assets/b913ade4-03bd-49df-9e90-1cf5e82b05f1" />

✨ Features

Weekly Calendar View — visualize the full department schedule day by day with color-coded nodes per instructor
Hover Tooltips — hover over any class block to instantly see key details
Week / Day / Month Toggle — switch between calendar views on the fly
Filter Panel — filter schedule by instructor, room, or course code
Course Management — create, edit, and delete course sections with full options
Instructor Assignment — assign faculty to sections with credit hour tracking
Room Assignment — assign classrooms with seat capacity validation
Conflict Detection — automatically prevents instructor and room double-booking
CSV Data Import — seed scheduling data quickly for testing and demos
Auth System — login, sign up, and sign out with secure JWT authentication


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
