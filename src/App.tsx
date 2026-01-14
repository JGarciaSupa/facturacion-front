import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'

// Pages
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'

// Components
import ProtectedRoute from './components/ProtectedRoute'

const router = createBrowserRouter([
  { 
    path: "/", 
    Component: HomePage
  },
  { 
    path: "/login", 
    Component: LoginPage 
  },
  { 
    path: "/dashboard", 
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    )
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
