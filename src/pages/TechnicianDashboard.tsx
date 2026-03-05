import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TechnicianCheckin } from "@/components/tracking/TechnicianCheckin";
import { 
  LayoutDashboard, 
  Calendar, 
  DollarSign, 
  Settings, 
  Bell,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Navigation,
  User,
  LogOut,
  ChevronRight,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";

const mockJobs = [
  {
    id: "JOB001",
    service: "AC Service & Repair",
    customer: "Rahul Sharma",
    phone: "+91 89193 12594",
    address: "123, MG Road, Sector 15, Bengaluru",
    date: "Today",
    time: "10:00 AM - 11:30 AM",
    status: "pending",
    amount: 499,
  },
  {
    id: "JOB002",
    service: "Electrical Repair",
    customer: "Priya Patel",
    phone: "+91 87654 32109",
    address: "456, HSR Layout, Bengaluru",
    date: "Today",
    time: "2:00 PM - 3:00 PM",
    status: "accepted",
    amount: 299,
  },
  {
    id: "JOB003",
    service: "Plumbing Repair",
    customer: "Amit Kumar",
    phone: "+91 76543 21098",
    address: "789, Koramangala, Bengaluru",
    date: "Tomorrow",
    time: "9:00 AM - 10:00 AM",
    status: "pending",
    amount: 349,
  },
];

const TechnicianDashboard = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [jobs, setJobs] = useState(mockJobs);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedJobForTracking, setSelectedJobForTracking] = useState<string | null>(null);

  const handleAcceptJob = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: "accepted" } : job
    ));
    toast.success("Job accepted!", {
      description: "The customer has been notified."
    });
  };

  const handleRejectJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
    toast.info("Job declined", {
      description: "The job has been passed to another technician."
    });
  };

  const todayJobs = jobs.filter(job => job.date === "Today");
  const pendingJobs = jobs.filter(job => job.status === "pending");
  const acceptedJobs = jobs.filter(job => job.status === "accepted");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero">
                <span className="text-lg font-bold text-primary-foreground">H</span>
              </div>
              <span className="text-xl font-bold text-foreground">HelpR</span>
            </Link>
            <span className="text-muted-foreground">|</span>
            <span className="text-sm font-medium text-muted-foreground">Technician Portal</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Availability Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  isAvailable ? "bg-accent" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform ${
                    isAvailable ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isAvailable ? "text-accent" : "text-muted-foreground"}`}>
                {isAvailable ? "Available" : "Offline"}
              </span>
            </div>

            <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </button>

            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-1">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "jobs", icon: Briefcase, label: "My Jobs" },
              { id: "earnings", icon: DollarSign, label: "Earnings" },
              { id: "schedule", icon: Calendar, label: "Schedule" },
              { id: "settings", icon: Settings, label: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                <LogOut className="h-5 w-5" />
                Back to Home
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Today's Jobs</span>
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{todayJobs.length}</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Pending</span>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">{pendingJobs.length}</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Accepted</span>
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </div>
              <p className="text-3xl font-bold text-foreground">{acceptedJobs.length}</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">This Week</span>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">₹4,850</p>
            </div>
          </div>

          {/* Job Requests */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Job Requests</h2>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`bg-card rounded-xl p-5 border ${
                    job.status === "pending" ? "border-primary/30" : "border-border"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{job.service}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          job.status === "pending"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-accent/10 text-accent"
                        }`}>
                          {job.status === "pending" ? "New Request" : "Accepted"}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{job.customer}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{job.date}, {job.time}</span>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <MapPin className="h-4 w-4" />
                          <span>{job.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-foreground">₹{job.amount}</p>
                      
                      {job.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectJob(job.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptJob(job.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <a href={`tel:${job.phone}`}>
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </a>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedJobForTracking(
                              selectedJobForTracking === job.id ? null : job.id
                            )}
                          >
                            <MapPin className="h-4 w-4 mr-1" />
                            Update Location
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Location Check-in Panel */}
                  {selectedJobForTracking === job.id && job.status === "accepted" && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <TechnicianCheckin 
                        bookingId={job.id} 
                        onCheckin={() => {
                          toast.success("Location updated!");
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}

              {jobs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No jobs at the moment. Stay available to receive new requests!</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
