import React, { useEffect, useState } from "react";
import axios from "axios";
import { APIResponse, Section } from "../constants/types";

const SectionsPage: React.FC = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

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
        <div className="page-container bg-neutral-100 dark:bg-neutral-950 min-h-screen p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2x1 font-semibold text-neutral-800 dark:text-neutral-100">
                    Sections
                </h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-emerrald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md shadow-sm"
                >
                    + Add Section
                </button>
            </div>

            {loading && <div className="text-neutral-500">Loading sections...</div>}
            {error && <div className="text-red-500">{error}</div>}

            {!loading && !error && sections.length === 0 && (
                <div className="text-center text-neutral-500 mt-8">
                    No sections yet.{" "}
                    <button
                        className="underline text-emerald-600 hover:text-emerald-700"
                        onClick={() => setShowAddModal(true)}
                    >
                        Add one
                    </button>
                    .
                </div>
            )}

            {!loading && sections.length > 0 && (
                <div className="overflow-x-auto bg-white dark: bg-neutral-900 rounded-lg shadow border border-neutral-200 dark:border-neutral-800">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-neutral-50 dark:bg-neutral-800">
                            <tr>
                                <th className="px-4 py-2 font-semibold text-neutral-600 dark:text-neutral-300">Id</th>
                                <th className="px-4 py-2 font-semibold text-neutral-600 dark:text-neutral-300">Course</th>
                                <th className="px-4 py-2 font-semibold text-neutral-600 dark:text-neutral-300">Instructor</th>
                                <th className="px-4 py-2 font-semibold text-neutral-600 dark:text-neutral-300">Room</th>
                                <th className="px-4 py-2 font-semibold text-neutral-600 dark:text-neutral-300">Meeting Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sections.map((section) => (
                                <tr key={section.id} className="hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                    <td className="px-4 py-2">{section.id}</td>
                                    <td className="px-4 py-2">
                                        {section.course?.name || `Course #${section.course_id}`}
                                    </td>
                                    <td className="px-4 py-2">
                                        {section.instructor?.name || `Instructor #${section.instructor_id}`}
                                    </td>
                                    <td className="px-4 py-2">
                                        {section.room?.name || `Room #${section.room_id}`}
                                    </td>
                                    <td className="px-4 py-2">
                                        {section.meeting_time
                                            ? `${section.meeting_time.day_of_week} ${section.meeting_time.start_time}-${section.meeting_time.end_time}`
                                            : `MeetingTime #${section.meeting_time_id}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">
                            Add Section
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                            Placeholder for Section creation form.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionsPage;
