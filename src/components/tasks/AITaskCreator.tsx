import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Mic, 
  Camera, 
  Send, 
  Loader2, 
  Check, 
  Calendar,
  Wrench,
  ListTodo,
  X,
  Image as ImageIcon
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

interface AIResponse {
  tasks: ExtractedTask[];
  summary: string;
}

interface AITaskCreatorProps {
  onTasksCreated?: (tasks: ExtractedTask[]) => void;
  compact?: boolean;
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

const priorityColors: Record<string, string> = {
  low: "bg-green-500/10 text-green-600 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  high: "bg-red-500/10 text-red-600 border-red-500/20",
};

const AITaskCreator = ({ onTasksCreated, compact = false }: AITaskCreatorProps) => {
  const [inputType, setInputType] = useState<"text" | "voice" | "photo">("text");
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [summary, setSummary] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageContext, setImageContext] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processWithAI = async (type: "text" | "voice" | "photo", content: string, context?: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-task-processor", {
        body: { type, content, context }
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      const response = data as AIResponse;
      setExtractedTasks(response.tasks || []);
      setSummary(response.summary || "");
      
      if (response.tasks?.length > 0) {
        toast.success(`Found ${response.tasks.length} task(s)!`);
      }
    } catch (error) {
      console.error("AI processing error:", error);
      toast.error("Failed to process. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    await processWithAI("text", textInput.trim());
    setTextInput("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(",")[1];
          await processWithAI("voice", base64Audio);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording... Speak now!");
    } catch (error) {
      console.error("Microphone error:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setInputType("photo");
    };
    reader.readAsDataURL(file);
  }, []);

  const processPhoto = async () => {
    if (!previewImage) return;
    await processWithAI("photo", previewImage, imageContext);
    setPreviewImage(null);
    setImageContext("");
  };

  const handleConfirmTask = async (task: ExtractedTask, index: number) => {
    // Here you would save to database or navigate to booking
    if (task.type === "booking") {
      toast.success(`Redirecting to book ${task.title}...`);
      // Navigate to services page with category filter
      window.location.href = `/services?category=${task.category}`;
    } else {
      // Save as personal task
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to save tasks");
        return;
      }

      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: "pending",
        source_type: inputType,
      });

      if (error) {
        toast.error("Failed to save task");
        return;
      }

      toast.success("Task saved!");
      setExtractedTasks(prev => prev.filter((_, i) => i !== index));
      onTasksCreated?.([task]);
    }
  };

  const removeTask = (index: number) => {
    setExtractedTasks(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className={compact ? "border-0 shadow-none" : ""}>
      {!compact && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            AI Task Creator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create tasks using text, voice, or photos
          </p>
        </CardHeader>
      )}
      
      <CardContent className={compact ? "p-0" : ""}>
        {/* Input Type Selector */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={inputType === "text" ? "default" : "outline"}
            size="sm"
            onClick={() => setInputType("text")}
            className="flex-1"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Text
          </Button>
          <Button
            variant={inputType === "voice" ? "default" : "outline"}
            size="sm"
            onClick={() => setInputType("voice")}
            className="flex-1"
          >
            <Mic className="h-4 w-4 mr-2" />
            Voice
          </Button>
          <Button
            variant={inputType === "photo" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setInputType("photo");
              fileInputRef.current?.click();
            }}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            Photo
          </Button>
        </div>

        {/* Text Input */}
        {inputType === "text" && (
          <div className="space-y-3">
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Describe what you need... e.g., 'My AC is not cooling properly' or 'Remind me to call mom tomorrow'"
              className="min-h-[100px]"
              disabled={isProcessing}
            />
            <Button 
              onClick={handleTextSubmit} 
              disabled={!textInput.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Analyze & Create Tasks
            </Button>
          </div>
        )}

        {/* Voice Input */}
        {inputType === "voice" && (
          <div className="text-center py-8 space-y-4">
            <div 
              className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? "bg-red-500 animate-pulse" 
                  : "bg-primary/10 hover:bg-primary/20"
              }`}
            >
              <Mic className={`h-10 w-10 ${isRecording ? "text-white" : "text-primary"}`} />
            </div>
            
            {isRecording ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Recording... Speak now!</p>
                <Button onClick={stopRecording} variant="destructive">
                  Stop Recording
                </Button>
              </div>
            ) : (
              <Button 
                onClick={startRecording} 
                disabled={isProcessing}
                size="lg"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4 mr-2" />
                )}
                {isProcessing ? "Processing..." : "Start Recording"}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Tap to start, describe your task or issue, tap again to stop
            </p>
          </div>
        )}

        {/* Photo Input */}
        {inputType === "photo" && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            
            {previewImage ? (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-full max-h-64 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setPreviewImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Add context (optional): e.g., 'This is in my kitchen'"
                  value={imageContext}
                  onChange={(e) => setImageContext(e.target.value)}
                />
                <Button 
                  onClick={processPhoto} 
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4 mr-2" />
                  )}
                  Analyze Photo
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Tap to take a photo or upload an image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  AI will detect issues and suggest fixes
                </p>
              </div>
            )}
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">AI is analyzing your input...</span>
          </div>
        )}

        {/* Summary */}
        {summary && !isProcessing && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-sm text-foreground">{summary}</p>
          </div>
        )}

        {/* Extracted Tasks */}
        {extractedTasks.length > 0 && (
          <div className="mt-4 space-y-3">
            <h4 className="font-medium text-sm">Detected Tasks:</h4>
            {extractedTasks.map((task, index) => (
              <div 
                key={index}
                className="p-4 border rounded-lg bg-card space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{categoryIcons[task.category] || "📝"}</span>
                    <div>
                      <h5 className="font-medium">{task.title}</h5>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTask(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={priorityColors[task.priority]}>
                    {task.priority} priority
                  </Badge>
                  <Badge variant="outline">
                    {task.type === "booking" ? (
                      <><Wrench className="h-3 w-3 mr-1" /> Service</>
                    ) : (
                      <><ListTodo className="h-3 w-3 mr-1" /> To-Do</>
                    )}
                  </Badge>
                  {task.suggestedDate && (
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" /> {task.suggestedDate}
                    </Badge>
                  )}
                </div>

                <Button 
                  onClick={() => handleConfirmTask(task, index)}
                  className="w-full"
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {task.type === "booking" ? "Book This Service" : "Save Task"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AITaskCreator;
