import React, { useState } from "react";
import axios from "axios";
import ConflictModal from "../components/ConflictModal";

const CreateSectionPage: React.FC = () => {
    const [form, setForm] = useState({
        course_id: "",
        instructor_id: "",
        room_id: "",
        meeting_time_id: "",
    });
    const [conflict, setConflict] = useState<any>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);
        setConflict(null);
        try {
            await axios.post("http://localhost:8000/sections/", form);
            setSuccess(true);
        } catch (err: any) {
            if (err.response?.status === 400) {
                setConflict(err.response.data.detail);
            } else {
                console.error("Error creating section:", err);
            }
        }
    };

    return (
        <div className="page-container">
            <h1 className="text-2x1 font-semibold mb-4">Create New Section</h1>

            <form
                onSubmit={handleSubmit}
                className="box w-[400px] flex flex-col gap-3 text-black"
            >
                <label className="flex flex-col">
                    Course Id:
                    <input
                        name="course_id"
                        value={form.course_id}
                        onChange={handleChange}
                        required
                        className="border p-2 rounded"
                    />
                </label>

                <label className="flex flex-col">
                    Instructor Id:
                    <input
                        name="instructor_id"
                        value={form.instructor_id}
                        onChange={handleChange}
                        required
                        className="border p-2 rounded"
                    />
                </label>

                <label className="flex flex-col">
                    Room Id:
                    <input
                        name="room_id"
                        value={form.room_id}
                        onChange={handleChange}
                        required
                        className="border p-2 rounded"
                    />
                </label>

                <label className="flex flex-col">
                    Meeting Time Id:
                    <input
                        name="meeting_time_id"
                        value={form.meeting_time_id}
                        onChange={handleChange}
                        required
                        className="border p-2 rounded"
                    />
                </label>

                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Create Section
                </button>

                {success && (
                    <div className="text-green-600 text-center mt-2">
                        Section created successfully!
                    </div>
                )}
            </form>

            {/* Conflict Modal */}
            <ConflictModal conflict={conflict} onClose={() => setConflict(null)} />
        </div>
    );
};

export default CreateSectionPage;
