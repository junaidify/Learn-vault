import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ui/ProtectedRoute';

import CatalogPage from './pages/CatalogPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AuthorDashboardPage from './pages/AuthorDashboardPage';
import CreateCoursePage from './pages/CreateCoursePage';
import EditCoursePage from './pages/EditCoursePage';
import StudentDashboardPage from './pages/StudentDashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,   // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              {/* Public */}
              <Route path="/" element={<CatalogPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />

              {/* Student only */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Author only */}
              <Route
                path="/author/courses"
                element={
                  <ProtectedRoute allowedRoles={['AUTHOR']}>
                    <AuthorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/author/courses/new"
                element={
                  <ProtectedRoute allowedRoles={['AUTHOR']}>
                    <CreateCoursePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/author/courses/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['AUTHOR']}>
                    <EditCoursePage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
