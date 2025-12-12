import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AddTransactionPage from "./pages/AddTransactionPage";
import EditTransactionPage from "./pages/EditTransactionPage";
import CategoriesPage from "./pages/CategoriesPage";
import AddCategoryPage from "./pages/AddCategoryPage";
// ĐÃ XÓA IMPORT EditCategoryPage
import ReportsPage from "./pages/ReportsPage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes (Đã đăng nhập) */}

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* --- ROUTES GIAO DỊCH --- */}
        {/* 1. Edit Transaction (Cụ thể nhất) */}
        <Route
          path="/transactions/edit/:id"
          element={
            <ProtectedRoute>
              <EditTransactionPage />
            </ProtectedRoute>
          }
        />
        {/* 2. Add Transaction */}
        <Route
          path="/transactions/add"
          element={
            <ProtectedRoute>
              <AddTransactionPage />
            </ProtectedRoute>
          }
        />
        {/* 3. Transactions List (Chung) */}
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />

        {/* --- ROUTES DANH MỤC --- */}
        {/* ĐÃ XÓA ROUTE EDIT CATEGORY */}

        {/* 1. Add Category */}
        <Route
          path="/categories/add"
          element={
            <ProtectedRoute>
              <AddCategoryPage />
            </ProtectedRoute>
          }
        />
        {/* 2. Categories List (Chung) */}
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all/404 Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
