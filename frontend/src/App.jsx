import Navbar from "./components/Navbar";

import EmployeePage from "./pages/EmployeePage";
import AdminPage from "./pages/AdminPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  // Helper function to get home route based on user role
  const getHomeRoute = () => {
    if (!authUser) return "/login";
    return authUser.role === "employee" ? "/employee" : "/admin";
  };

  return (
    <div data-theme="dark">
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              <Navigate to={getHomeRoute()} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/employee"
          element={
            authUser ? (
              authUser.role === "employee" ? (
                <EmployeePage />
              ) : (
                <Navigate to="/admin" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin"
          element={
            authUser ? (
              authUser.role === "admin" ? (
                <AdminPage />
              ) : (
                <Navigate to="/employee" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/signup"
          element={
            !authUser ? <SignUpPage /> : <Navigate to={getHomeRoute()} />
          }
        />

        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to={getHomeRoute()} />}
        />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
