import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Quizzes from './pages/Quizzes';
import TakeQuiz from './pages/TakeQuiz';
import QuizResult from './pages/QuizResult';
import Coding from './pages/Coding';
import Chat from './pages/Chat';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobMatcher from './pages/JobMatcher';
import MockInterview from './pages/MockInterview';
import Analytics from './pages/Analytics';
import Achievements from './pages/Achievements';
import Companies from './pages/Companies';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminQuizzes from './pages/admin/AdminQuizzes';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/"         element={<Navigate to="/dashboard" replace />} />

            {/* Protected: Layout shell */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard"        element={<Dashboard />} />
              <Route path="/roadmap"           element={<Roadmap />} />
              <Route path="/quizzes"           element={<Quizzes />} />
              <Route path="/quizzes/:id"       element={<TakeQuiz />} />
              <Route path="/quizzes/:id/result" element={<QuizResult />} />
              <Route path="/coding"            element={<Coding />} />
              <Route path="/ai-coach"          element={<Chat />} />
              <Route path="/resume-analyzer"   element={<ResumeAnalyzer />} />
              <Route path="/job-matcher"       element={<JobMatcher />} />
              <Route path="/mock-interview"    element={<MockInterview />} />
              <Route path="/analytics"         element={<Analytics />} />
              <Route path="/achievements"      element={<Achievements />} />
              <Route path="/companies"         element={<Companies />} />
              <Route path="/profile"           element={<Profile />} />
              <Route path="/settings"          element={<Settings />} />

              {/* Admin only */}
              <Route path="/admin"             element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users"       element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/quizzes"     element={<AdminRoute><AdminQuizzes /></AdminRoute>} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
