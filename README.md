📅 Class Scheduler
A full-stack course scheduling application built for a university department to replace a manual Excel-based workflow. Administrators can assign instructors, rooms, and meeting times to courses while the system automatically detects scheduling conflicts in real time.
Client: Department of Chemistry & Physics — Dr. Georgina Little
Type: College Senior Finals Project (Solo)

Screenshots
Login Screen
[Show Image](https://github.com/user-attachments/assets/0b6f5f86-60b2-45bf-afa0-b7090dcbff87)

Sign Up
[Show Image](https://github.com/user-attachments/assets/0c747e6d-6d78-4e31-b948-b5ddb66ffd3e)

Sign Out
[Show Image](https://github.com/user-attachments/assets/b913ade4-03bd-49df-9e90-1cf5e82b05f1)

Calendar — Filter Panel
[Show Image](https://github.com/user-attachments/assets/de6a1a5a-4177-4772-97a0-4b5a1b8fa750)

Calendar — Filter Panel (continued)
[Show Image](https://github.com/user-attachments/assets/b9bdeb0d-96db-4c07-88b2-6d7fba61dc6f)

Week / Day / Month View Toggle
[Show Image](https://github.com/user-attachments/assets/5f254ec6-7020-4cbc-8190-5f95bdb5d4e9)

Hover Tooltip
[Show Image](https://github.com/user-attachments/assets/0e768a13-b432-4d83-8ee6-2288a53cb090)

Create Class — Options
[Show Image](https://github.com/user-attachments/assets/72ef1a7c-8358-4e82-b449-6ea5a0ff3915)

Create Class — Day Selection
[Show Image](https://github.com/user-attachments/assets/a73f9e9e-8367-4f6b-9b58-5f85df759841)

Teacher Credit Hours Dashboard
[Show Image](https://github.com/user-attachments/assets/be09225e-6417-421e-a7f6-50a9d8f28d17)

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
