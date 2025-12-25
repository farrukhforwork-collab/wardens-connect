import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Feed from './pages/Feed.jsx';
import Chat from './pages/Chat.jsx';
import Pages from './pages/Pages.jsx';
import Welfare from './pages/Welfare.jsx';
import Admin from './pages/Admin.jsx';

const App = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <AuthLayout>
          <Login />
        </AuthLayout>
      }
    />
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/pages" element={<Pages />} />
              <Route path="/welfare" element={<Welfare />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default App;
