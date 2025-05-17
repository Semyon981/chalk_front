import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from './context/AuthContext';
import CreateAccountPage from './pages/CreateAccount';
import AccountPage from './pages/Account';
import Loader from './components/Loader';
// import { AccountPage } from "./pages/Account"

import { useAuth } from './context/AuthContext';
import CoursePage from './pages/Course';
import LessonPage from './pages/Lesson';

const PrivateRoute = ({ children }: { children: React.JSX.Element }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />

          <Route path="/create-account" element={
            <PrivateRoute>
              <CreateAccountPage />
            </PrivateRoute>} />

          <Route path="/accounts/:accountName" element={
            <PrivateRoute>
              <AccountPage />
            </PrivateRoute>} />

          <Route path="/courses/:courseId" element={
            <PrivateRoute>
              <CoursePage />
            </PrivateRoute>}
          />

          <Route path="/courses/:courseId/lessons/:lessonId" element={
            <PrivateRoute>
              <LessonPage />
            </PrivateRoute>}
          />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;