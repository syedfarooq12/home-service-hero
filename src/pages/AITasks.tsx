import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TaskPostingWizard from "@/components/tasks/TaskPostingWizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  ListTodo,
  Calendar,
  CheckCircle2,
  Circle,
  Trash2,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  due_date: string | null;
  source_type: string;
  created_at: string;
}

const priorityColors: Record<string, string> = {
  low: "bg-green-500/10 text-green-600",
  medium: "bg-yellow-500/10 text-yellow-600",
  high: "bg-red-500/10 text-red-600",
};

const categoryIcons: Record<string, string> = {
  cleaning: "🧹",
  plumbing: "🔧",
  electrical: "⚡",
  ac_appliance: "❄️",
  painting: "🎨",
  carpentry: "🪚",
  pest_control: "🐛",
  renovation: "🏠",
  general: "📝",
};

const AITasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchTasks();
    } else {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } else {
      setTasks(data || []);
    }
    setIsLoading(false);
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === "done" ? "pending" : "done";
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", task.id);

    if (error) {
      toast.error("Failed to update task");
    } else {
      setTasks(prev =>
        prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t)
      );
      toast.success(newStatus === "done" ? "Task completed!" : "Task reopened");
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      toast.error("Failed to delete task");
    } else {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success("Task deleted");
    }
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    fetchTasks();
  };

  const pendingTasks = tasks.filter(t => t.status !== "done");
  const completedTasks = tasks.filter(t => t.status === "done");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Smart Task Creation</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI guides you step-by-step to capture, categorize, and book any task or home service.
            </p>
          </div>

          {/* Wizard or Trigger */}
          {showWizard ? (
            <div className="mb-8">
              <TaskPostingWizard onComplete={handleWizardComplete} />
            </div>
          ) : (
            <div className="mb-8 flex justify-center">
              <Button
                size="lg"
                className="gap-2 px-8 shadow-lg"
                onClick={() => setShowWizard(true)}
              >
                <Plus className="h-5 w-5" />
                Post a New Task
                <Sparkles className="h-4 w-4 ml-1 opacity-70" />
              </Button>
            </div>
          )}

          {/* Tasks List */}
          {user ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  My Tasks
                </CardTitle>
                {!showWizard && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowWizard(true)}>
                    <Plus className="h-4 w-4" /> Add Task
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending" className="space-y-3">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : pendingTasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No pending tasks. Create one above!</p>
                      </div>
                    ) : (
                      pendingTasks.map(task => (
                        <TaskItem key={task.id} task={task} onToggle={toggleTaskStatus} onDelete={deleteTask} />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-3">
                    {completedTasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No completed tasks yet.</p>
                      </div>
                    ) : (
                      completedTasks.map(task => (
                        <TaskItem key={task.id} task={task} onToggle={toggleTaskStatus} onDelete={deleteTask} />
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">Login to save and manage your tasks</p>
                <Button onClick={() => window.location.href = "/login"}>Login to Save Tasks</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  const isDone = task.status === "done";
  return (
    <div className={`p-4 border rounded-lg flex items-start gap-3 transition-colors ${isDone ? "bg-muted/50" : "bg-card"}`}>
      <button onClick={() => onToggle(task)} className="mt-1 shrink-0">
        {isDone
          ? <CheckCircle2 className="h-5 w-5 text-green-500" />
          : <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span>{categoryIcons[task.category] || "📝"}</span>
          <h4 className={`font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}>{task.title}</h4>
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
          {task.due_date && (
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(task.due_date).toLocaleDateString()}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">via {task.source_type}</Badge>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(task.id)}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AITasks;
