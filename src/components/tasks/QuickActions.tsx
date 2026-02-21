import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, RotateCcw, Clock } from "lucide-react";

interface RecentTask {
  title: string;
  description: string | null;
  category: string;
  priority: string;
  count: number;
}

interface QuickActionsProps {
  onSelect: (title: string, description: string, category: string) => void;
}

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

const QuickActions = ({ onSelect }: QuickActionsProps) => {
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTasks();
  }, []);

  const fetchRecentTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("title, description, category, priority")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      // Group by title to find repeated tasks
      const grouped = data.reduce<Record<string, RecentTask>>((acc, task) => {
        const key = task.title.toLowerCase().trim();
        if (!acc[key]) {
          acc[key] = {
            title: task.title,
            description: task.description,
            category: task.category || "general",
            priority: task.priority || "medium",
            count: 0,
          };
        }
        acc[key].count++;
        return acc;
      }, {});

      // Sort by frequency then take top items
      const sorted = Object.values(grouped)
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      setRecentTasks(sorted);
    }
    setLoading(false);
  };

  if (loading || recentTasks.length === 0) return null;

  const repeated = recentTasks.filter(t => t.count >= 2);
  const recent = recentTasks.filter(t => t.count < 2).slice(0, 4);

  if (repeated.length === 0 && recent.length === 0) return null;

  return (
    <div className="space-y-3">
      {repeated.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Frequent Tasks</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {repeated.map((task, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => onSelect(task.title, task.description || "", task.category)}
                className="gap-1.5 h-auto py-1.5 px-3 text-left"
              >
                <span>{categoryIcons[task.category] || "📝"}</span>
                <span className="truncate max-w-[150px]">{task.title}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
                  {task.count}×
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((task, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                onClick={() => onSelect(task.title, task.description || "", task.category)}
                className="gap-1.5 h-auto py-1.5 px-3 border border-transparent hover:border-border"
              >
                <RotateCcw className="h-3 w-3 text-muted-foreground" />
                <span className="truncate max-w-[150px]">{task.title}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
