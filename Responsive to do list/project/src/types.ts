export interface Task {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  priority: string;
  timeAllotted: string;
  category: string;
  completed: boolean;
  createdAt: string;
  userId?: string;
}