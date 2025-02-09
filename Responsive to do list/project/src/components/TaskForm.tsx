import React, { useState } from 'react';
import { X, Briefcase, User, Coffee } from 'lucide-react';
import { Task } from '../types';

interface TaskFormProps {
  onClose: () => void;
  onSubmit: (task: Task) => void;
  darkMode: boolean;
}

const CATEGORIES = [
  { id: 'work', label: 'Work', icon: Briefcase, color: 'bg-blue-500' },
  { id: 'personal', label: 'Personal', icon: User, color: 'bg-purple-500' },
  { id: 'timepass', label: 'Timepass', icon: Coffee, color: 'bg-orange-500' },
];

const TaskForm: React.FC<TaskFormProps> = ({ onClose, onSubmit, darkMode }) => {
  const [task, setTask] = useState<Task>({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '23:59', // Default time
    priority: 'medium',
    timeAllotted: '',
    category: '',
    completed: false,
    createdAt: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine date and time for the dueDate
    const combinedDateTime = `${task.dueDate}T${task.dueTime}:00`;
    onSubmit({
      ...task,
      dueDate: combinedDateTime,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-md p-6 rounded-lg ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>Add New Task</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block mb-1 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Title
            </label>
            <input
              type="text"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className={`w-full p-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
              }`}
              required
            />
          </div>
          <div>
            <label className={`block mb-1 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              className={`w-full p-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
              }`}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Due Date
              </label>
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                className={`w-full p-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                }`}
                required
              />
            </div>
            <div>
              <label className={`block mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Due Time
              </label>
              <input
                type="time"
                value={task.dueTime}
                onChange={(e) => setTask({ ...task, dueTime: e.target.value })}
                className={`w-full p-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                }`}
                required
              />
            </div>
          </div>
          <div>
            <label className={`block mb-1 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Priority
            </label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setTask({ ...task, priority })}
                  className={`flex-1 py-2 px-3 rounded-lg capitalize transition-colors ${
                    task.priority === priority
                      ? priority === 'high'
                        ? 'bg-rose-500 text-white'
                        : priority === 'medium'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-emerald-500 text-white'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={`block mb-1 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Time Allotted
            </label>
            <input
              type="text"
              value={task.timeAllotted}
              onChange={(e) => setTask({ ...task, timeAllotted: e.target.value })}
              placeholder="e.g., 2 hours"
              className={`w-full p-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
              }`}
            />
          </div>
          <div>
            <label className={`block mb-1 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTask({ ...task, category: id })}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg transition-colors ${
                    task.category === id
                      ? `${color} text-white`
                      : darkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-rose-300 hover:bg-rose-400 text-white rounded-lg transition-colors"
          >
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;