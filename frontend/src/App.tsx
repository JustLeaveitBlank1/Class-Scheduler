import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Courses from "./pages/Courses";
import Instructors from "./pages/Instructors";
import Rooms from "./pages/Rooms";
import Schedule from "./pages/Schedule";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/schedule" element={<Schedule />} />
        </Routes>
    );
}
export default App;
