import React, { useState, useEffect } from 'react';
import { Sun, Moon, Snail, Sparkles, Plus, Calendar, Search, History } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { differenceInMinutes, parseISO, isAfter } from 'date-fns';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import AuthForm from './components/AuthForm';
import { Task } from './types';
import { supabase } from './lib/supabase';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTasks(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTasks(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Check for task reminders every minute
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.completed) {
          const dueDate = parseISO(task.dueDate);
          if (isAfter(dueDate, now)) { // Only check future tasks
            const minutesLeft = differenceInMinutes(dueDate, now);
            
            // Reminder thresholds
            if (minutesLeft === 60) {
              toast('⏰ Heads up! Task due in 1 hour: ' + task.title, {
                duration: 10000,
              });
            } else if (minutesLeft === 30) {
              toast('⚡ Time check! 30 minutes left for: ' + task.title, {
                duration: 10000,
              });
            } else if (minutesLeft === 15) {
              toast('🚨 Quick reminder! 15 minutes remaining for: ' + task.title, {
                duration: 10000,
              });
            } else if (minutesLeft === 5) {
              toast('🔥 Final stretch! Only 5 minutes left for: ' + task.title, {
                duration: 10000,
                icon: '⏰',
              });
            }
          }
        }
      });
    };

    // Initial check
    checkReminders();

    // Set up interval for checking reminders
    const interval = setInterval(checkReminders, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks]);

  const checkTaskReminders = () => {
    const now = new Date();
    tasks.forEach(task => {
      if (!task.completed) {
        const dueDate = parseISO(task.dueDate);
        const minutesLeft = differenceInMinutes(dueDate, now);
        
        if (minutesLeft === 5) {
          toast('🚨 Buddy! Only 5 minutes left to complete: ' + task.title, {
            icon: '⏰',
            duration: 10000,
          });
        }
      }
    });
  };

  const fetchTasks = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Task interface
      const transformedTasks = data.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date,
        priority: task.priority,
        timeAllotted: task.time_allotted,
        category: task.category,
        completed: task.completed,
        createdAt: task.created_at,
        userId: task.user_id
      }));

      setTasks(transformedTasks);
    } catch (error: any) {
      toast.error('Error fetching tasks: ' + error.message);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const addTask = async (task: Task) => {
    if (!user) return;

    try {
      // Transform the task data to match database column names
      const newTask = {
        user_id: user.id,
        title: task.title,
        description: task.description,
        due_date: task.dueDate,
        priority: task.priority,
        time_allotted: task.timeAllotted,
        category: task.category,
        completed: false,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('tasks')
        .insert([newTask]);

      if (error) throw error;

      toast.success('Task added successfully! 🎯');
      fetchTasks(user.id);
      setShowAddTask(false);
    } catch (error: any) {
      toast.error('Error adding task: ' + error.message);
    }
  };

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);

      if (error) throw error;

      if (completed) {
        const task = tasks.find(t => t.id === taskId);
        const dueDate = parseISO(task?.dueDate || '');
        const now = new Date();
        
        if (now < dueDate) {
          toast.success(
            '🎉 Way to go, buddy! You finished early! Here\'s a virtual high five! ✋',
            { duration: 5000 }
          );
        } else {
          toast.success(
            '🌟 Task completed! Remember, slow and steady wins the race! 🐌',
            { duration: 5000 }
          );
        }
      }
      fetchTasks(user.id);
    } catch (error: any) {
      toast.error('Error updating task: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setTasks([]);
    toast.success('See you later, buddy! 👋');
  };

  if (!user) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <AuthForm darkMode={darkMode} />
        <Toaster position="top-right" />
      </div>
    );
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = showHistory ? task.completed : !task.completed;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'dark bg-gray-900' : 'bg-sky-50'
    }`}>
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Snail className="w-10 h-10 text-emerald-600" />
            <h1 className={`text-2xl md:text-3xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              SomedayMaybe
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              Sign Out
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg flex items-center gap-2 ${
                showHistory 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="hidden sm:inline">{showHistory ? 'Current Tasks' : 'History'}</span>
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className={`text-center mb-8 p-4 md:p-6 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <p className={`text-lg md:text-xl font-medium ${
            darkMode ? 'text-white' : 'text-gray-700'
          }`}>
            <Snail className="inline-block w-5 h-5 mr-2 text-emerald-600" />
            Turn 'someday' into 'today' - one lazy step at a time
            <Sparkles className="inline-block w-5 h-5 ml-2 text-yellow-400" />
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            className="px-4 py-2 bg-rose-300 hover:bg-rose-400 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Task List */}
        <div className={`rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg p-4 md:p-6 mb-8`}>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <Snail className="w-16 h-16 mx-auto text-emerald-600 mb-4" />
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {showHistory 
                  ? "No completed tasks yet! Time to get some work done..."
                  : "No tasks yet! Time to add some lazy goals..."}
              </p>
            </div>
          ) : (
            <TaskList 
              tasks={filteredTasks} 
              darkMode={darkMode} 
              onToggleComplete={toggleTaskCompletion}
            />
          )}
        </div>

        {/* Footer Signature */}
        <div className="text-center py-4">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            With the 1st lazy step 🦥 
            <br />
            <span className="font-medium">Meghana Pradeep</span> ✨
          </p>
        </div>

        {/* Add Task Modal */}
        {showAddTask && (
          <TaskForm
            onClose={() => setShowAddTask(false)}
            onSubmit={addTask}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
}

export default App;