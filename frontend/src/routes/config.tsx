import React from 'react';
import { Route, Routes } from 'react-router-dom';
import '../index.css';
import Home from '../pages/home';
import { NotFound } from '../pages/not-found';
import CoursesPage from '../pages/Courses';
import SchedulePage from '../pages/Schedule';
import InstructorsPage from '../pages/Instructors';
import RoomsPage from '../pages/Rooms';
import SectionsPage from '../pages/Sections';
import CreateSectionPage from "../pages/CreateSection";

export const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/instructors" element={<InstructorsPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/sections" element={<SectionsPage />} />
            <Route path="/sections/create" element={<CreateSectionPage />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};
