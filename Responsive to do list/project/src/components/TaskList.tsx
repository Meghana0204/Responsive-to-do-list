import React from 'react';
import { Task } from '../types';
import { Calendar, Clock, Tag, Check, Briefcase, User, Coffee } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  darkMode: boolean;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}

const CATEGORY_ICONS = {
  work: { icon: Briefcase, color: 'text-blue-500' },
  personal: { icon: User, color: 'text-purple-500' },
  timepass: { icon: Coffee, color: 'text-orange-500' },
};

const TaskList: React.FC<TaskListProps> = ({ tasks, darkMode, onToggleComplete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-rose-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryInfo = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
    if (categoryInfo) {
      const { icon: Icon, color } = categoryInfo;
      return <Icon className={`w-4 h-4 ${color}`} />;
    }
    return <Tag className="w-4 h-4 text-gray-400" />;
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`p-4 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-sky-50'
          } hover:shadow-md transition-shadow relative`}
        >
          <div className="flex items-start gap-4">
            <button
              onClick={() => onToggleComplete(task.id!, !task.completed)}
              className={`mt-1 p-1 rounded-full flex-shrink-0 ${
                task.completed
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              {task.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                } ${task.completed ? 'line-through opacity-70' : ''}`}>
                  {task.title}
                </h3>
                <div className={`px-3 py-1 rounded-full text-white text-sm ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </div>
              </div>
              <p className={`mt-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } ${task.completed ? 'line-through opacity-70' : ''}`}>
                {task.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {formatDateTime(task.dueDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {task.timeAllotted}
                  </span>
                </div>
                {task.category && (
                  <div className="flex items-center gap-1">
                    {getCategoryIcon(task.category)}
                    <span className={`text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskList;