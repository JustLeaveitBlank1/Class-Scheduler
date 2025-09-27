import React, { useEffect, useState } from 'react'
//import { useUser } from '../../authentication/use-auth'
import axios from 'axios'

import { ApiResponse, CourseGetDto} from "../constants/types";
const CoursesPage = () => {
    const [courses, setCourses] = useState<CourseGetDto[]>();
    const fetchCourses = async () => {
        const response = await axios.get<ApiResponse<CourseGetDto[]>>(
            `/api/courses`
        );
        if (response.data.hasErrors) {
            response.data.errors.forEach((err) => {
            console.log(err.message);
        });
        } else {
            setCourses(response.data.data);
        }
    };
    useEffect(() => {fetchCourses();}, []);
    return (
        <div>
            <h1>All Courses</h1>
            {courses ? (
                courses?.map((course) => {
                    return (
                        <ul className="card-list">
                            <li 
                                key={course.id}
                                className="card"
                            >
                                <div className="card-content">
                                    <h2>
                                        {course.name}
                                        {course.code}
                                    </h2>
                                    <p>
                                        credits: {course.credit_hours}
                                        time: {course.contact_hours}
                                    </p>
                                </div>
                            </li>
                        </ul>
                    );
                })
            ) : (
                <div>Loading</div>
            )}
        </div>
    );
};

export default CoursesPage;