import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import '../index.css'
import Home from '../pages/home'
import { NotFound } from '../pages/not-found'
import CoursesPage from '../pages/Courses'
import SchedulePage from '../pages/Schedule'
import InstructorsPage from '../pages/Instructors'
import RoomsPage from '../pages/Rooms'
export const App = () => {
    return (
        <Router><Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/instructors" element={<InstructorsPage/>}/>
            <Route path="/rooms" element={<RoomsPage/>}/>
            <Route path="/courses" element={<CoursesPage/>}/>
            <Route path="/schedule" element={<SchedulePage/>}/>
            <Route path="*" element={<NotFound/>}/>
        </Routes></Router>
    );
};
