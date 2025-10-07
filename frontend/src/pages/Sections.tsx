import React, { useEffect, useState } from "react";
import axios from "axios";
import { APIResponse, Section } from "../constants/types";

const SectionsPage: React.FC = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSections = async () => {
        try {
            const response = await axios.get<Section[]>("http://localhost:8000/sections/");
            setSections(response.data);
        } catch (err) {
            console.error("Error fetching sections:", err);
            setError("Failed to load sections. Please check the backend connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);
    
    if (loading) return <div>Loading sections...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="page-container">
            <h1 className="text-2xl font-semibold mb-4">All Sections</h1>
            {sections.length === 0 ? (
                <div>No sections available.</div>
            ) : (
                <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2 text-left">Section Id</th>
                            <th className="border px-4 py-2 text-left">Course</th>
                            <th className="border px-4 py-2 text-left">Instructor</th>
                            <th className="border px-4 py-2 text-left">Room</th>
                            <th className="border px-4 py-2 text-left">Meeting Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sections.map((section) => (
                            <tr key={section.id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">{section.id}</td>
                                <td className="border px-4 py-2">
                                    {section.course?.name || `Course #${section.course_id}`}
                                </td>
                                <td className="border px-4 py-2">
                                    {section.instructor?.name || `Instructor #${section.instructor_id}`}
                                </td>
                                <td className="border px-4 py-2">
                                    {section.room?.name || `Room #${section.room_id}`}
                                </td>
                                <td className="border px-4 py-2">
                                    {section.meeting_time
                                    ? `${section.meeting_time.day_of_week} ${section.meeting_time.start_time}-${section.meeting_time.end_time}`
                                    : `MeetingTime #${section.meeting_time_id}`}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default SectionsPage;
