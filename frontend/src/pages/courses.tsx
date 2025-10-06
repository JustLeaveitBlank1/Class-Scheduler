import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { ApiResponse, CourseGetDto} from "../constants/types"
const CoursesPage = () => {
    // getter
    //const url = import.meta.env.BASE_URL;
    const [courses, setCourses] = useState<CourseGetDto[]>();
    const fetchCourses = async () => {
        const response = await axios.get<ApiResponse<CourseGetDto[]>>(
            `http://localhost:8000/courses/`
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
            <div className='sqr'>
                {courses ? (
                    courses?.map((course) => {
                        return (
                            <ul>
                                <li 
                                    key={course.id}
                                >
                                    <h2>
                                        {course.name}
                                        {course.code}
                                    </h2>
                                    <p>
                                        credits: {course.credit_hours}
                                        time: {course.contact_hours}
                                    </p>
                                </li>
                            </ul>
                        );
                    })
                ) : (
                    <div>Loading</div>
                )}
            </div>
        </div>
    );
};
export default CoursesPage;