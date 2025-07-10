import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from './context/AuthContext';
import CreateAccountPage from './pages/CreateAccount';
import AccountPage from './pages/Account/AccountPage';
import Loader from './components/Loader';

import { useAuth } from './context/AuthContext';
import { AccountMembersPage } from './pages/Account/AccountMembersPage';
import { AccountCoursesPage } from './pages/Account/AccountCoursesPage';
import { MyCoursesPage } from './pages/Account/MyCoursesPage';
import CoursePage from './pages/Account/CoursePage';
import LessonPage from './pages/Account/LessonPage';
import AcceptInvitePage from './pages/AcceptInvitePage';
import TestPassersPage from './pages/Account/TestPassersPage';
import { MemberPage } from './pages/Account/MemberPage';

const PrivateRoute = ({ children }: { children: React.JSX.Element }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PrivateInviteRoute = ({ children }: { children: React.JSX.Element }) => {
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const inviteKey = searchParams.get('key');

  if (!inviteKey) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) return <Loader />;

  if (!user) {
    return <Navigate to={`/login?key=${inviteKey}`} replace />;
  }

  return children;
}


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />

          <Route
            path="/acceptinvite"
            element={
              <PrivateInviteRoute>
                <AcceptInvitePage />
              </PrivateInviteRoute>
            }
          />

          <Route path="/create-account" element={
            <PrivateRoute>
              <CreateAccountPage />
            </PrivateRoute>} />

          <Route path="/accounts/:accountName" element={
            <PrivateRoute>
              <AccountPage />
            </PrivateRoute>
          }>

            <Route index element={
              <PrivateRoute>
                <AccountMembersPage />
              </PrivateRoute>} />

            <Route path="users" element={
              <PrivateRoute>
                <AccountMembersPage />
              </PrivateRoute>} />

            <Route path="users/:memberID" element={
              <PrivateRoute>
                <MemberPage />
              </PrivateRoute>} />

            <Route path="tests/:testID/passers" element={
              <PrivateRoute>
                <TestPassersPage />
              </PrivateRoute>} />


            <Route path="courses" element={
              <PrivateRoute>
                <AccountCoursesPage />
              </PrivateRoute>} />

            <Route path="courses/:courseId">

              <Route index element={
                <PrivateRoute>
                  <CoursePage />
                </PrivateRoute>
              } />

              <Route path="lessons/:lessonId" element={
                <PrivateRoute>
                  <LessonPage />
                </PrivateRoute>
              } />
            </Route>

            <Route path="my-courses" element={
              <PrivateRoute>
                <MyCoursesPage />
              </PrivateRoute>} />

          </Route>


        </Routes>
      </AuthProvider>
    </Router >
  );
}

export default App;