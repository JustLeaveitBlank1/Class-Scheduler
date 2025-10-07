import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { APIResponse, Course} from "../constants/types"

const CoursesPage = () => {
    // getter
    //const url = import.meta.env.BASE_URL;
    const [courses, setCourses] = useState<CourseGetDto[]>();
    const fetchCourses = async () => {
        try {
            const response = await axios.get<CourseGetDto[]>(
                "http://localhost:8000/courses/"
            );
            setCourses(response.data);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
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
