// Shared error type
export interface APIError {
    property?: string;
    message: string;
}

// Core entities
export interface Course {
    id: number;
    code: string;
    name: string;
    credit_hours: number;
    contact_hours: number;
}

export interface Instructor {
    id: number;
    name: string;
    email: string;
    department?: string;
    max_load: number;
    current_load: number;
}

export interface Room {
    id: number;
    name: string;
    capacity: number;
    constraints?: string;
}

export interface MeetingTime {
    id: number;
    day_of_week: string; // e.g., "MWF"
    start_time: string; // e.g., "09:00"
    end_time: string; // e.g., "10:15"
}

export interface Section {
    id: number;
    course_id: number;
    instructor_id: number;
    room_id: number;
    meeting_time_id: number;
    course?: Course;
    instructor?: Instructor;
    room?: Room;
    meeting_time?: MeetingTime;
}

export interface Conflict {
    id: number;
    section_id: number;
    conflict_type: string;
    description: string;
}

// Generic API Response wrapper
export interface APIResponse<T> {
    data: T;
    errors?: APIError[];
    hasErrors?: boolean;
}
