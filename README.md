📅 Class Scheduler
A full-stack course scheduling application built for a university department to replace a manual Excel-based workflow. Administrators can assign instructors, rooms, and meeting times to courses while the system automatically detects scheduling conflicts in real time.
Client: Department of Chemistry & Physics — Dr. Georgina Little
Type: College Senior Finals Project (Solo)

Screenshots
Login Screen
Show Image

Sign Up
Show Image

Sign Out
Show Image

Calendar — Filter Panel
Show Image

Calendar — Filter Panel (continued)
Show Image

Week / Day / Month View Toggle
Show Image

Hover Tooltip
Show Image

Create Class — Options
Show Image

Create Class — Day Selection
Show Image

Teacher Credit Hours Dashboard
Show Image

Features

Color-coded calendar nodes — each instructor has a unique color on the schedule
Hover tooltips — hover any class block to see key details instantly
Week / Day / Month toggle — switch calendar views on the fly
Filter panel — filter by instructor, room, or course code
Create & manage courses — full options for days, times, rooms, and instructors
Credit hour tracking — dashboard shows each teacher's assigned load
Conflict detection — prevents instructor and room double-booking automatically
Auth system — login, sign up, and sign out with secure JWT authentication


Tech Stack
LayerTechnologyFrontendReact, TypeScript, Vite, CSSBackendPython, FastAPIDatabasePostgreSQLAuthJWTAPIREST

Getting Started
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
5. Run the frontend
bashcd frontend
npm install
npm run dev

About
The client's department was managing semester schedules through a large Excel workbook — difficult to maintain and prone to conflicts. This app replaces that workflow with a clean, visual web interface that validates rules automatically and gives administrators a clear overview of the entire semester.

Author
Austin Sprunk — GitHub
