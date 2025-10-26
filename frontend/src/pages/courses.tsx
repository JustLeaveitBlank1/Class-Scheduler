import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Course } from "../constants/types"

const CoursesPage = () => {
    // getter
    //const url = import.meta.env.BASE_URL;
    const [courses, setCourses] = useState<Course[]>();
    const fetchCourses = async () => {
        try {
            const response = await axios.get<Course[]>(
                "http://localhost:8000/courses/"
            );
            setCourses(response.data);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
    };
    useEffect(() => { fetchCourses(); }, []);
    return (
        <div>
            <h1>All Courses</h1>
            <div className='box'>
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Name&emsp;</th>
                            <th scope="col">Code&emsp;</th>
                            <th scope="col">Credits&emsp;</th>
                            <th scope="col">Meeting Time &emsp;</th> 
                        </tr>
                    </thead>
                    <tbody>
                        {courses ? (
                            courses?.map((course) => (
                                <tr key={course.id}>  
                                    <td>
                                        {course.name}&ensp;
                                    </td>
                                    <td>
                                        &emsp;{course.code}&emsp;
                                    </td>
                                    <td>
                                        &emsp;{course.credit_hours}&emsp;
                                    </td>
                                    <td>
                                        &emsp;{course.contact_hours}&emsp;
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4}>Loading...</td>
                            </tr>
                        )}   
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default CoursesPage;
