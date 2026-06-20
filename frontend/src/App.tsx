import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./component/ProtectedRoute";
import PublicRoute from "./component/PublicRoute";
import AdminRoute from "./component/AdminRoute";
import Chatscreen from "./component/Chatscreen";
import AdminDashboard from "./component/AdminDashboard";
import LoginScreen from "./component/LoginScreen";
import SignupScreen from "./component/SignupScreen";
import ProfileScreen from "./component/ProfileScreen";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Chatscreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginScreen />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupScreen />
            </PublicRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
