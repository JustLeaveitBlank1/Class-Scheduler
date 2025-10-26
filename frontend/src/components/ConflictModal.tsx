import React from "react";

interface ConflictModalProps {
    conflict: {
        message: string;
        conflicting_section: {
            id: number;
            course: string;
            instructor: string;
            room: string;
            meeting_time: {
                day_of_week: string;
                start_time: string;
                end_time: string;
            };
        };
    } | null;
    onClose: () => void;
}

const ConflictModal: React.FC<ConflictModalProps> = ({ conflict, onClose }) => {
    if (!conflict) return null;

    const { message, conflicting_section } = conflict;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                    {message || "Schedule Conflict Detected"}
                </h2>

                <div className="text-gray-800 mb-4">
                    <p><strong>Section Id:</strong> {conflicting_section.id}</p>
                    <p><strong>Course:</strong> {conflicting_section.course}</p>
                    <p><strong>Instructor:</strong> {conflicting_section.instructor}</p>
                    <p><strong>Room:</strong> {conflicting_section.room}</p>
                    <p>
                        <strong>Time:</strong>{" "}
                        {conflicting_section.meeting_time.day_of_week}{" "}
                        {conflicting_section.meeting_time.start_time} -{" "}
                        {conflicting_section.meeting_time.end_time}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ConflictModal;
