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
                            <th>Name&emsp;</th>
                            <th>Code&emsp;</th>
                            <th>Credits&emsp;</th>
                            <th>Meeting Time &emsp;</th>  
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 bg-gray-900 text-gray-100">
                        {courses ? (
                            courses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-800 transition-colors">  
                                    <td className='px-4 py-2'>
                                        {course.name}&ensp;
                                    </td>
                                    <td className='px-4 py-2'>
                                        &emsp;{course.code}&emsp;
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        &emsp;{course.credit_hours}&emsp;
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        &emsp;{course.contact_hours}&emsp;
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-4">Loading...</td>
                            </tr>
                        )}   
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default CoursesPage;
