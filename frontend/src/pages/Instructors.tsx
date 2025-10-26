import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Instructor } from "../constants/types";
const InstructorsPage = () => {

// getter
    //const url = import.meta.env.BASE_URL;
    const [instructors, setInstructors] = useState<Instructor[]>();
    const fetchInstructors = async () => {
        try {
            const response = await axios.get<Instructor[]>(
                "http://localhost:8000/instructors/" // temp dev url
            );
            setInstructors(response.data);
        } catch (error) {
            console.error("Failed to fetch instructors:", error);
        }
    };
    useEffect(() => {fetchInstructors();}, []);
    
    return (
        <div>  
            <h1>All Instructors</h1>
            <div className='box'>
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Name&emsp;</th>
                            <th scope="col">Email&emsp;</th>
                            <th scope="col">Department&emsp;</th>
                            <th scope="col">Maximum work-load&emsp;</th>
                            <th scope="col">Current work-load&emsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {instructors ? (
                            instructors?.map((instructor) => (
                                <tr key={instructor.id}>  
                                    <td>
                                        {instructor.name}&ensp;
                                    </td>
                                    <td>
                                        &emsp;{instructor.email}&emsp;
                                    </td>
                                    <td>
                                        &emsp;{instructor.department}&emsp;
                                    </td>
                                    <td>
                                        &emsp;{instructor.max_load}&emsp;
                                    </td>
                                    <td>
                                        &emsp;{instructor.current_load}&emsp;
                                    </td>
                                </tr>
                            ))
                        ) : (<tr><td colSpan={4}>Loading...</td></tr>)}   
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default InstructorsPage