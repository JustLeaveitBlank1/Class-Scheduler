# Course Scheduling Application

## Overview
This project aims to replace the current Excel-based scheduling system with a web application for managing course schedules. The system will allow department administrators to assign credit hours, meeting times, instructors, and rooms while automatically checking for conflicts. It will also provide calendar-based views for easier visualization of schedules, as well as instructor and room availability charts.

The client’s current process is managed through a large Excel workbook that tracks instructor workloads, room availability, course contact hours, and conflicts. While functional, it is cumbersome, difficult to maintain, and lacks advanced viewing and filtering options. Our system will formalize and improve this process in a scalable, user-friendly way.

---

## Client Requirements

### Functional Requirements
- **Course Setup**
  - Define course sections with associated credit hours.
  - Assign meeting times (must align with contact hours).
  - Assign instructors to courses.
  - Assign rooms with seat capacity info.

- **Conflict Detection**
  - Prevent instructor double-booking (no overlapping classes).
  - Prevent room conflicts (one course per room per time).
  - Validate instructor workloads (target: 15 contact hours).
  - Visual indicators for workload status:
    - Under load → warning.
    - Over load → error.

- **Schedule Views**
  - List view of courses with details.
  - Calendar view (week-based).
  - Instructor schedule view (side-by-side weekly chart).
  - Room schedule view (weekly availability).
  - Filter by instructor, room, or both.

- **Other Needs**
  - Seat capacity tracking and goals.
  - Handle varying contact hours (labs vs lectures).
  - Handle faculty requests (preferred times, unavailable slots).
  - Support schedule changes (adding sections, swapping instructors/rooms).
  - Track special room conditions (e.g., labs, no power, limited seating).

### Non-Functional Requirements
- Secure authentication (admin/staff roles).
- Easy-to-use interface (more intuitive than Excel).
- Efficient conflict-checking algorithms.
- Scalable to handle multiple semesters/departments.

### Constraints
- Current Excel logic serves as the baseline for rules.
- Course catalog should eventually integrate into the system (instead of manual credit-hour entry).

---

## Scheduling Logic (Excel-Derived Rules)

1. **Instructor Workload**
   - Each instructor has a required load (default: 15 contact hours).
   - Allocated vs. unallocated hours must be tracked.
   - Over/under workloads must be flagged visually.

2. **Conflict Detection**
   - Courses map to specific meeting time codes (e.g., `1400TU` = Tuesday 2:00 PM).
   - Instructor conflict: two overlapping codes assigned to the same instructor.
   - Room conflict: two overlapping codes assigned to the same room.

3. **Meeting Time Rules**
   - Meeting times must match the course’s contact hours.
   - Time codes table defines valid meeting blocks.
   - Supports flexible patterns (MWF, TR, extended labs, etc.).

4. **Room Assignment Rules**
   - Each room has a seat capacity.
   - Assigned room must meet or exceed course seat requirements.
   - Some rooms have special conditions (labs, equipment, power availability).

5. **Schedule Views**
   - Instructor chart: weekly schedule per instructor.
   - Room chart: weekly schedule per room.
   - Calendar: department-wide view by week.
   - List: tabular course assignments.

---

## Project Scope

- **Must Have (MVP)**
  - Course creation with credit hours, meeting times, instructors, and rooms.
  - Automatic conflict detection (instructor + room).
  - Instructor workload tracking with visual alerts.
  - Calendar + filterable views.

- **Should Have**
  - Seat capacity validation and suggestions.
  - Faculty preference handling.
  - Support for co-requisites and avoiding student course conflicts.

- **Could Have**
  - Automatic schedule optimization/recommendations.
  - Advanced reporting and analytics.
  - Integration with university catalog data.

- **Won’t Have (Out of Scope for Now)**
  - Direct integration with external student registration systems.
  - Fully automated scheduling without human review.

---

## Game Plan

- **Primary Goal**: Deliver the client’s requested scheduling system (all functional requirements).
- **Secondary Goal (Stretch Feature)**: If time permits, add an **AI/optimization component** such as:
  - Auto-scheduling (system suggests valid meeting times/instructors/rooms).
  - Best-fit scheduling recommendations.
- **Important Note**: The system must function without the AI component. The AI/optimization module will be treated as **non-essential** and only implemented if time permits.

---

## System Design (High-Level)
- **Frontend**: React  
  - Handles course list, calendar views, filters, and user interaction.  
- **Backend**: Python (FastAPI or Django Rest Framework)  
  - Manages APIs, scheduling rules, authentication, and business logic.  
- **Database**: PostgreSQL  
  - Stores courses, instructors, rooms, meeting times, and constraints.  
- **Logic Engine**:  
  - Handles conflict detection, workload validation, seat capacity checks.  
- **Optional AI/Optimization Module** (Stretch Goal):  
  - Provides auto-scheduling and best-fit suggestions.  
  - Built using Python libraries like **Google OR-Tools** or **PuLP**.  

---

## Team
- **Team Lead**: Adam Graves
- **Backend Lead**: TBD
- **Frontend Lead**: TBD
- **QA & Documentation Lead**: TBD

(All members contribute to coding and testing.)

---

## Timeline & Milestones (14-Week Semester Example)
- **Weeks 1–2**: Finalize requirements, database schema, architecture design.
- **Weeks 3–5**: Implement backend APIs + database.
- **Weeks 5–7**: Develop frontend (list + calendar views).
- **Weeks 8–10**: Integration + testing (conflict detection, workload logic).
- **Weeks 11–12**: Client review + refinements.
- **Weeks 13–14**: Documentation, polish, final presentation.

---

## Tools & Workflow
- **Tech Stack**: React (frontend), FastAPI or Django (backend), PostgreSQL (database), Python (optimization/AI).  
- **Version Control**: GitHub with branching & pull requests.  
- ~~**Task Tracking**: GitHub Projects.~~  
- **Communication**: Discord.  

---

## Setup

### 1. Clone the repository
```
git clone https://github.com/Giriid/CMPS_411.git
cd cmps_411
```

### 2. Create and activate a virtual environment
```
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies
```
pip install -r requirements.txt
```

### 4. Configure environment variables
1. Copy the example file
    ```
    cd backend
    cp .env.example .env
    ```
2. Edit ``` .env ``` and update your PostgreSQL password ('``` YOUR_PASSWORD ```')
    ```
    DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/scheduler_db
    ```

### 5. Start PostgreSQL and create the database if it doesn't exist
Using ``` pgAdmin ``` or ``` SQL Shell (psql) ```
``` SQL
sql

CREATE DATABASE scheduler_db;
```

### 6. Seed/Reset the database with test data
```
python reset_db.py
```

### 7. Run the API
```
uvicorn main:app --reload
```

The API will now be available at:
- root: https://127.0.0.1:8000/
- Swagger UI: https://127.0.0.1:8000/docs
- ReDoc: https://127.0.0.1:8000/redoc

---

## Risks & Mitigation
- **Scope creep**: Use MoSCoW prioritization to keep scope realistic.  
- **Data complexity**: Start with Excel-derived logic, expand later.  
- **Team availability**: Cross-train members, distribute workload.  
- **Deployment issues**: Maintain a local backup hosting option.  
- **AI Feature Risk**: Treat auto-scheduling as non-essential; the core system works independently.  

---

## References
- Client Email (Aug 2025): Explains Excel workflow and requirements.  
- Client PowerPoint: Defines problem and desired features.  
- Client Excel File: Encodes workload, conflict logic, and scheduling rules.  
