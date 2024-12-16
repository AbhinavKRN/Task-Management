import { useState, useEffect } from 'react';
import axios from 'axios';
import { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { TaskForm } from './TaskForm';

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { token } = useAuth();

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks');
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const handleDelete = async (taskId: string) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task');
    }
  };

  return (
    <div className="space-y-6">
      <TaskForm onTaskAdded={fetchTasks} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <div
            key={task._id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transform transition-all duration-200 hover:shadow-lg"
          >
            {editingTask?._id === task._id ? (
              <TaskForm
                initialData={task}
                isEditing
                onTaskAdded={() => {
                  fetchTasks();
                  setEditingTask(null);
                }}
                onCancel={() => setEditingTask(null)}
              />
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {task.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {task.description}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
