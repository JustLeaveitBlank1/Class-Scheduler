export type AnyObject = {
    [index: string]: unknown;
}
export type Error = {
    property: string;
    message: string;
}
export type Conflict = {
    id: number;
    section_id: number;
    conflict_type: string;
    description: string;
    section: Section;
}
export type ApiResponse<T> = {
    data: T;
    errors: Error[];
    hasErrors: boolean;
}
export type MeetingTime = {
    id: number;
    day_of_week: number;
    start_time: number;
    end_time: number;
    sections: Section[];
}
export type Instructor = {
    id: number;
    name: string;
    email: string;
    department: string;
    max_load: number;
    current_load: number;
    sections: Section[];
}
export type InstructorGetDto = {
    id: number;
    name: string;
    email: string;
    department: string;
    max_load: number;
    current_load: number;
    sections: Section[];
}
export type InstructorCreateDto = {
    name: string;
    email: string;
    department: string;
}
export type Room = {
    id: number;
    name: string;
    capacity: number;
    constraints: string;
    sections: Section[];
}
export type RoomGetDto = {
    id: number;
    name: string;
    capacity: number;
    constraints: string;
    sections: Section[];
}
export type RoomCreateDto = {
    name: string;
    capacity: number;
    constraints: string;
}
export type Course = {
    id: number;
    code: string;
    name: string;
    credit_hours: number;
    contact_hours: number;
    sections: Section[];
}
export type CourseGetDto = {
    id: number;
    code: string;
    name: string;
    credit_hours: number;
    contact_hours: number;
    sections: Section[];
}
export type CourseCreateDto = {
    code: string;
    name: string;
    credit_hours: number;
    contact_hours: number;
}
export type Section = {
    id: number;
    course_id: number;
    instructor_id: number;
    room_id: number;
    meeting_time_id: number;
    course: Course;
    instructor: Instructor;
    room: Room;
    meeting_time: MeetingTime;
    conflicts: Conflict;
}
export type SectionGetDto = {
    id: number;
    course_id: number;
    instructor_id: number;
    room_id: number;
    meeting_time_id: number;
    course: Course;
    instructor: Instructor;
    room: Room;
    meeting_time: MeetingTime;
    conflicts: Conflict[];
}
export type SectionCreateDto = {
    course_id: number;
    instructor_id: number;
    room_id: number;
    meeting_time_id: number;
    course: Course;
    instructor: Instructor;
    room: Room;
    meeting_time: MeetingTime;
    conflicts: Conflict;
}