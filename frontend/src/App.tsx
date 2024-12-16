import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './components/Auth';
import { TaskList } from './components/TaskList';
import { ThemeToggle } from './components/ThemeToggle';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                      Task Management
                    </h1>
                    <TaskList />
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
          <ThemeToggle />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;