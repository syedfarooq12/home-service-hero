import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import QuickActions from "@/components/tasks/QuickActions";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Wrench,
  ListTodo,
  MessageSquare,
  Camera,
  Mic,
  Calendar,
  Clock,
  Edit3,
  Send,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExtractedTask {
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  type: "booking" | "todo";
  suggestedDate?: string;
  estimatedDuration?: string;
}

const categoryOptions = [
  { value: "cleaning", label: "🧹 Cleaning" },
  { value: "plumbing", label: "🔧 Plumbing" },
  { value: "electrical", label: "⚡ Electrical" },
  { value: "ac_appliance", label: "❄️ AC & Appliance" },
  { value: "painting", label: "🎨 Painting" },
  { value: "carpentry", label: "🪚 Carpentry" },
  { value: "pest_control", label: "🐛 Pest Control" },
  { value: "renovation", label: "🏠 Renovation" },
  { value: "general", label: "📝 General" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const priorityColors: Record<string, string> = {
  low: "bg-green-500/10 text-green-600 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  high: "bg-red-500/10 text-red-600 border-red-500/20",
};

type Step = "input" | "analyzing" | "review" | "edit" | "success";
type InputMode = "text" | "voice" | "photo";

interface TaskPostingWizardProps {
  onComplete?: () => void;
}

export default function TaskPostingWizard({ onComplete }: TaskPostingWizardProps) {
  const handleQuickAction = useCallback((title: string, description: string, category: string) => {
    setTextInput(title + (description ? ` — ${description}` : ""));
    setInputMode("text");
  }, []);
  const [step, setStep] = useState<Step>("input");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [textInput, setTextInput] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [tasks, setTasks] = useState<ExtractedTask[]>([]);
  const [editingTask, setEditingTask] = useState<ExtractedTask | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Step info
  const steps = [
    { key: "input", label: "Describe" },
    { key: "review", label: "Review" },
    { key: "success", label: "Done" },
  ];
  const stepIndex = (s: Step) => steps.findIndex(x => x.key === s);

  const analyzeWithAI = async (type: InputMode, content: string, context?: string) => {
    setStep("analyzing");
    try {
      const { data, error } = await supabase.functions.invoke("ai-task-processor", {
        body: { type, content, context },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setTasks(data.tasks || []);
      setAiSummary(data.summary || "");

      // Generate a smart follow-up question
      if (data.tasks?.length > 0) {
        const t = data.tasks[0];
        if (t.type === "booking") {
          setAiQuestion(`I found a service request for **${t.title}**. Would you like to book it now, or adjust the details first?`);
        } else {
          setAiQuestion(`I detected **${data.tasks.length}** task(s). Review them below and confirm to save.`);
        }
      }

      setStep("review");
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze. Please try again.");
      setStep("input");
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    await analyzeWithAI("text", textInput.trim());
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          await analyzeWithAI("voice", base64);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording… Speak now!");
    } catch {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePhotoSubmit = async () => {
    if (!previewImage) return;
    await analyzeWithAI("photo", previewImage);
    setPreviewImage(null);
  };

  const handleConfirmAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login to save tasks");
      return;
    }
    setIsSaving(true);
    try {
      for (const task of tasks) {
        if (task.type === "todo") {
          const { error } = await supabase.from("tasks").insert({
            user_id: user.id,
            title: task.title,
            description: task.description,
            category: task.category,
            priority: task.priority,
            status: "pending",
            source_type: inputMode,
          });
          if (error) throw error;
        }
      }
      setStep("success");
      onComplete?.();
    } catch {
      toast.error("Failed to save tasks");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBookService = (task: ExtractedTask) => {
    window.location.href = `/services?category=${task.category}`;
  };

  const handleEditTask = (task: ExtractedTask, index: number) => {
    setEditingTask({ ...task });
    setEditIndex(index);
    setStep("edit");
  };

  const handleSaveEdit = () => {
    if (editingTask && editIndex !== null) {
      setTasks(prev => prev.map((t, i) => i === editIndex ? editingTask : t));
      setStep("review");
    }
  };

  const removeTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setStep("input");
    setTextInput("");
    setTasks([]);
    setAiSummary("");
    setAiQuestion("");
    setPreviewImage(null);
    setInputMode("text");
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      {step !== "analyzing" && (
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {steps.map((s, i) => {
              const active = stepIndex(step as Step) >= i;
              const current = step === s.key || (step === "edit" && s.key === "review");
              return (
                <div key={s.key} className="flex flex-col items-center flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10 ${
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  } ${current ? "ring-4 ring-primary/20" : ""}`}>
                    {active && stepIndex(step as Step) > i
                      ? <CheckCircle2 className="h-5 w-5" />
                      : i + 1}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                  {i < steps.length - 1 && (
                    <div className={`absolute top-4 h-0.5 transition-all duration-500 ${
                      stepIndex(step as Step) > i ? "bg-primary" : "bg-muted"
                    }`} style={{ left: `${(i / (steps.length - 1)) * 100 + 14}%`, width: `${100 / (steps.length - 1) - 28 / (steps.length - 1)}%` }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step: Input ── */}
      {step === "input" && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* AI Intro */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Hi! I'm your AI task assistant 👋</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Tell me what you need — describe an issue, a home repair, or any task. I'll help you break it down and get it done.
                </p>
              </div>
            </div>

            {/* Quick Actions - auto-fill from history */}
            <QuickActions onSelect={handleQuickAction} />

            {/* Mode switcher */}
            <div className="flex gap-2">
              {[
                { mode: "text" as InputMode, icon: MessageSquare, label: "Type" },
                { mode: "voice" as InputMode, icon: Mic, label: "Voice" },
                { mode: "photo" as InputMode, icon: Camera, label: "Photo" },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-all ${
                    inputMode === mode
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Text mode */}
            {inputMode === "text" && (
              <div className="space-y-3">
                <Textarea
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder="e.g., 'My AC stopped cooling' or 'Leaking pipe under sink' or 'Remind me to pay electricity bill'"
                  className="min-h-[120px] resize-none text-base"
                  onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleTextSubmit(); }}
                />
                <p className="text-xs text-muted-foreground">Press Ctrl+Enter to submit</p>
                <Button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim()}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze with AI
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Voice mode */}
            {inputMode === "voice" && (
              <div className="text-center py-6 space-y-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all shadow-lg ${
                    isRecording ? "bg-destructive animate-pulse scale-110" : "bg-primary hover:scale-105"
                  }`}
                >
                  <Mic className="h-10 w-10 text-white" />
                </button>
                <p className="text-sm text-muted-foreground">
                  {isRecording ? "Recording… tap to stop" : "Tap to start speaking"}
                </p>
              </div>
            )}

            {/* Photo mode */}
            {inputMode === "photo" && (
              <div className="space-y-3">
                {previewImage ? (
                  <>
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={previewImage} alt="Preview" className="w-full max-h-56 object-cover" />
                      <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Button onClick={handlePhotoSubmit} className="w-full gap-2" size="lg">
                      <ImageIcon className="h-4 w-4" />
                      Analyze Photo
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <label className="border-2 border-dashed border-muted hover:border-primary/40 rounded-xl p-10 text-center cursor-pointer flex flex-col items-center gap-3 transition-colors">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tap to take/upload a photo</span>
                    <span className="text-xs text-muted-foreground">AI will detect issues automatically</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                  </label>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Step: Analyzing ── */}
      {step === "analyzing" && (
        <Card>
          <CardContent className="py-16 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">AI is analyzing your request…</h3>
              <p className="text-sm text-muted-foreground">Identifying tasks, categories & priorities</p>
            </div>
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step: Review ── */}
      {step === "review" && (
        <div className="space-y-4">
          {/* AI message */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground">{aiQuestion || aiSummary}</p>
            </div>
          </div>

          {/* Task cards */}
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No tasks detected. Try rephrasing your request.</p>
                <Button variant="outline" className="mt-4 gap-2" onClick={reset}>
                  <ArrowLeft className="h-4 w-4" /> Try Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-1 bg-primary" />
                <CardContent className="pt-4 pb-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">
                      {categoryOptions.find(c => c.value === task.category)?.label.split(" ")[0] ?? "📝"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base leading-snug">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
                    </div>
                    <button onClick={() => removeTask(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={priorityColors[task.priority]}>
                      {task.priority} priority
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      {task.type === "booking"
                        ? <><Wrench className="h-3 w-3" /> Service</>
                        : <><ListTodo className="h-3 w-3" /> To-Do</>}
                    </Badge>
                    {task.suggestedDate && (
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="h-3 w-3" /> {task.suggestedDate}
                      </Badge>
                    )}
                    {task.estimatedDuration && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" /> {task.estimatedDuration}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 flex-1"
                      onClick={() => handleEditTask(task, index)}
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </Button>
                    {task.type === "booking" ? (
                      <Button size="sm" className="gap-1.5 flex-1" onClick={() => handleBookService(task)}>
                        <Wrench className="h-3.5 w-3.5" /> Book Now
                      </Button>
                    ) : (
                      <Button size="sm" className="gap-1.5 flex-1" onClick={handleConfirmAll} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Save Task
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {tasks.filter(t => t.type === "todo").length > 1 && (
            <Button
              onClick={handleConfirmAll}
              disabled={isSaving}
              className="w-full gap-2"
              size="lg"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save All Tasks ({tasks.filter(t => t.type === "todo").length})
            </Button>
          )}

          <Button variant="ghost" className="w-full gap-2" onClick={reset}>
            <ArrowLeft className="h-4 w-4" /> Start Over
          </Button>
        </div>
      )}

      {/* ── Step: Edit ── */}
      {step === "edit" && editingTask && (
        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Edit3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Edit Task</h3>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editingTask.title}
                onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editingTask.description}
                onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={editingTask.category}
                  onValueChange={v => setEditingTask({ ...editingTask, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={editingTask.priority}
                  onValueChange={v => setEditingTask({ ...editingTask, priority: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                {[
                  { val: "booking" as const, icon: Wrench, label: "Service Booking" },
                  { val: "todo" as const, icon: ListTodo, label: "Personal Task" },
                ].map(({ val, icon: Icon, label }) => (
                  <button
                    key={val}
                    onClick={() => setEditingTask({ ...editingTask, type: val })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      editingTask.type === val
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep("review")}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button className="flex-1 gap-2" onClick={handleSaveEdit}>
                <Send className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step: Success ── */}
      {step === "success" && (
        <Card>
          <CardContent className="py-16 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">Tasks saved!</h3>
              <p className="text-muted-foreground text-sm">
                Your tasks have been added and are ready to track.
              </p>
            </div>
            <div className="flex gap-3 max-w-xs mx-auto">
              <Button variant="outline" className="flex-1" onClick={reset}>
                Add More
              </Button>
              <Button className="flex-1" onClick={() => window.location.href = "/ai-tasks"}>
                View Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
