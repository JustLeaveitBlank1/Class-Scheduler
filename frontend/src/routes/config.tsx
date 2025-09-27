import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import '../index.css'
import { AddUserPage } from '../pages/adduser'
import Home from '../pages/home'
import { NotFound } from '../pages/not-found'
import CoursesPage from '../pages/courses'
import { useUser } from '../authentication/use-auth'
import { Wrapper } from '../components/wrapper/wrapper'
import { UserPage } from '../pages/user-page'
export const App = () => {
    const user = useUser();
    return (
        <Router><Wrapper user={user}><Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/courses" element={<CoursesPage/>}/>
            <Route path="/users/create" element={<AddUserPage/>}/>
            <Route path="/user" element={<UserPage/>}/>
            <Route path="*" element={<NotFound/>}/>
        </Routes></Wrapper></Router>
    );
};
