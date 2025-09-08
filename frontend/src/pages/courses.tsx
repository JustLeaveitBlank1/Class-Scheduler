import { useQuery } from "@tanstack/react-query";

type Course = {
    id: number;
    code: string;
    name: string;
    credit_hours: number;
    contact_hours: number;
};

const fetchCourses = async (): Promise<Course[]> => {
    const res = await fetch("http://localhost:8001/api/courses"); // use correct port
    if (!res.ok) {
        throw new Error(`Failed to fetch courses: ${res.status} ${res.statusText}`);
    }
    return res.json();
};

const Courses: React.FC = () => {
    const { data, isLoading, isError, error } = useQuery<Course[], Error>({
        queryKey: ["courses"],
        queryFn: fetchCourses,
    });

    if (isLoading) return <p>Loading courses...</p>;
    if (isError) return <p>Error: {error.message}</p>;

    return (
        <div>
            <h1>
                Courses
            </h1>
            <ul className="card-list">
                {data?.map((course) => (
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
                ))}
            </ul>
        </div>
    );
};

export default Courses;
