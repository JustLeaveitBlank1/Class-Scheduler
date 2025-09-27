export type ApiResponse<T> = {
    data: T;
    errors: Error[];
    hasErrors: boolean;
}
export type Error = {
    property: string;
    message: string;
}
export type AnyObject = {
    [index: string]: unknown;
}
export type UserDto = {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
}
export type UserMasterDto = {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    password: string;
    email: string;
    phoneNumber: string;
    role: string;
}
export type UserAllDto = {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phoneNumber: string;
    roleId: number;
    role: string;
}

export type UserBasicDto = {
    id: number;
    userName: string;
    roleId: number;
    role: string;
}

export type UserContactDto = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}
export type User = {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
}
export type CourseGetDto = {
    id: number;
    code: string;
    name: string;
    credit_hours: number;
    contact_hours: number;
}
export type Course = {
    id: number;
    code: string;
    name: string;
    credit_hours: number;
    contact_hours: number;
}
export type CourseCreateDto = {
    code: string;
    name: string;
    credit_hours: number;
    contact_hours: number;
}