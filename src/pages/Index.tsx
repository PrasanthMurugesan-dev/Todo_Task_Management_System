import { useState, useEffect } from "react";
import { Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import TaskFilters from "@/components/TaskFilters";
import StatsOverview from "@/components/StatsOverview";
import AuthenticatedHeader from "@/components/AuthenticatedHeader";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const { toast } = useToast();
  const { user } = useAuth();

  // Sample data for demonstration
  useEffect(() => {
    const sampleTasks: Task[] = [
      {
        id: "1",
        title: "Design system documentation",
        description: "Create comprehensive design system docs for the team",
        status: "in-progress" as TaskStatus,
        priority: "high" as TaskPriority,
        dueDate: new Date("2025-07-07"),
        assignedTo: "john@example.com",
        sharedWith: ["jane@example.com"],
        createdAt: new Date("2025-07-01"),
        updatedAt: new Date("2025-07-01"),
        userId: user?.id || "user1"
      },
      {
        id: "2",
        title: "Code review for authentication",
        description: "Review OAuth implementation and security measures",
        status: "pending" as TaskStatus,
        priority: "medium" as TaskPriority,
        dueDate: new Date("2025-07-06"),
        assignedTo: user?.email || "jane@example.com",
        sharedWith: [],
        createdAt: new Date("2025-07-02"),
        updatedAt: new Date("2025-07-02"),
        userId: user?.id || "user1"
      },
      {
        id: "3",
        title: "Deploy to production",
        description: "Final deployment and monitoring setup",
        status: "completed" as TaskStatus,
        priority: "high" as TaskPriority,
        dueDate: new Date("2025-07-04"),
        assignedTo: user?.email || "john@example.com",
        sharedWith: ["jane@example.com", "bob@example.com"],
        createdAt: new Date("2025-07-03"),
        updatedAt: new Date("2025-07-04"),
        userId: user?.id || "user1"
      }
    ];
    setTasks(sampleTasks);
    setFilteredTasks(sampleTasks);
  }, []);

  const handleCreateTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user?.id || "user1"
    };
    
    setTasks(prev => [newTask, ...prev]);
    setShowTaskForm(false);
    toast({
      title: "Task created",
      description: "Your task has been created successfully.",
    });
  };

  const handleUpdateTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">) => {
    if (!editingTask) return;
    
    const updatedTask: Task = {
      ...editingTask,
      ...taskData,
      updatedAt: new Date()
    };
    
    setTasks(prev => prev.map(task => task.id === editingTask.id ? updatedTask : task));
    setEditingTask(null);
    setShowTaskForm(false);
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully.",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "Your task has been deleted successfully.",
      variant: "destructive"
    });
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status, updatedAt: new Date() }
        : task
    ));
    toast({
      title: "Task updated",
      description: `Task status changed to ${status}.`,
    });
  };

  const applyFilters = () => {
    let filtered = tasks;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case "pending":
        filtered = filtered.filter(task => task.status === "pending");
        break;
      case "in-progress":
        filtered = filtered.filter(task => task.status === "in-progress");
        break;
      case "completed":
        filtered = filtered.filter(task => task.status === "completed");
        break;
      case "overdue":
        filtered = filtered.filter(task => 
          task.dueDate && 
          task.dueDate < new Date() && 
          task.status !== "completed"
        );
        break;
      case "today":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter(task => 
          task.dueDate && 
          task.dueDate >= today && 
          task.dueDate < tomorrow
        );
        break;
    }

    setFilteredTasks(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [tasks, searchTerm, activeFilter]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <AuthenticatedHeader onNewTask={() => setShowTaskForm(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Stats Overview */}
              <StatsOverview tasks={tasks} />
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-600">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setShowTaskForm(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <TaskFilters 
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                />
              </div>

              {/* Task List */}
              <TaskList
                tasks={filteredTasks}
                onEdit={(task) => {
                  setEditingTask(task);
                  setShowTaskForm(true);
                }}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Index;
