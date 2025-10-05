import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Courses from "./pages/Courses";
function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
        </Routes>
    );
}
export default App;
