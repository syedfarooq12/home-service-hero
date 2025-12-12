import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  LogOut, 
  RefreshCw,
  FileText,
  User,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Search,
  X
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type TechnicianProfile = Tables<"technician_profiles">;

const AdminDashboard = () => {
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianProfile | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get unique locations from technicians
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    technicians.forEach((t) => {
      if (t.city && t.state) {
        locations.add(`${t.city}, ${t.state}`);
      }
    });
    return Array.from(locations).sort();
  }, [technicians]);

  // Filter technicians based on search and filters
  const filteredTechnicians = useMemo(() => {
    return technicians.filter((technician) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        technician.full_name.toLowerCase().includes(searchLower) ||
        technician.phone.includes(searchQuery) ||
        technician.city.toLowerCase().includes(searchLower) ||
        technician.state.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === "all" || technician.kyc_status === statusFilter;

      // Location filter
      const technicianLocation = `${technician.city}, ${technician.state}`;
      const matchesLocation = locationFilter === "all" || technicianLocation === locationFilter;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [technicians, searchQuery, statusFilter, locationFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setLocationFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || locationFilter !== "all";

  useEffect(() => {
    checkAdminAccess();
    fetchTechnicians();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/admin/login");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/admin/login");
    }
  };

  const fetchTechnicians = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("technician_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch technician profiles.",
        variant: "destructive",
      });
    } else {
      setTechnicians(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleApprove = async (technician: TechnicianProfile) => {
    setActionLoading(true);
    const { error } = await supabase
      .from("technician_profiles")
      .update({ 
        kyc_status: "approved",
        kyc_rejection_reason: null 
      })
      .eq("id", technician.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve technician.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Approved",
        description: `${technician.full_name} has been approved.`,
      });
      fetchTechnicians();
      setViewDialogOpen(false);
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!selectedTechnician || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    const { error } = await supabase
      .from("technician_profiles")
      .update({ 
        kyc_status: "rejected",
        kyc_rejection_reason: rejectionReason 
      })
      .eq("id", selectedTechnician.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject technician.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Rejected",
        description: `${selectedTechnician.full_name} has been rejected.`,
      });
      fetchTechnicians();
      setRejectDialogOpen(false);
      setViewDialogOpen(false);
      setRejectionReason("");
    }
    setActionLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      submitted: { variant: "outline", label: "Submitted" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const openViewDialog = (technician: TechnicianProfile) => {
    setSelectedTechnician(technician);
    setViewDialogOpen(true);
  };

  const openRejectDialog = (technician: TechnicianProfile) => {
    setSelectedTechnician(technician);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage technician KYC applications</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchTechnicians} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="shrink-0">
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-muted-foreground">
            Showing {filteredTechnicians.length} of {technicians.length} technicians
            {hasActiveFilters && " (filtered)"}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">Loading technicians...</p>
                  </TableCell>
                </TableRow>
              ) : filteredTechnicians.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <User className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <p className="text-muted-foreground mt-2">
                      {hasActiveFilters ? "No technicians match your filters" : "No technician applications yet"}
                    </p>
                    {hasActiveFilters && (
                      <Button variant="link" onClick={clearFilters} className="mt-2">
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTechnicians.map((technician) => (
                  <TableRow key={technician.id}>
                    <TableCell className="font-medium">{technician.full_name}</TableCell>
                    <TableCell>{technician.phone}</TableCell>
                    <TableCell>{technician.city}, {technician.state}</TableCell>
                    <TableCell>{technician.years_of_experience || 0} years</TableCell>
                    <TableCell>{getStatusBadge(technician.kyc_status)}</TableCell>
                    <TableCell>
                      {new Date(technician.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(technician)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {technician.kyc_status === "submitted" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApprove(technician)}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openRejectDialog(technician)}
                              disabled={actionLoading}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* View Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Technician Details
              </DialogTitle>
              <DialogDescription>
                Review the technician's KYC application
              </DialogDescription>
            </DialogHeader>

            {selectedTechnician && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedTechnician.full_name}</h3>
                  {getStatusBadge(selectedTechnician.kyc_status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      Phone
                    </div>
                    <p className="font-medium">{selectedTechnician.phone}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      Experience
                    </div>
                    <p className="font-medium">{selectedTechnician.years_of_experience || 0} years</p>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      Address
                    </div>
                    <p className="font-medium">
                      {selectedTechnician.address}, {selectedTechnician.city}, {selectedTechnician.state} - {selectedTechnician.pincode}
                    </p>
                  </div>

                  {selectedTechnician.skills && selectedTechnician.skills.length > 0 && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-muted-foreground">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTechnician.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTechnician.certifications && selectedTechnician.certifications.length > 0 && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-muted-foreground">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTechnician.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline">{cert}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTechnician.id_document_url && (
                    <div className="space-y-1 col-span-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        ID Document ({selectedTechnician.id_document_type})
                      </div>
                      <a
                        href={selectedTechnician.id_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View Document
                      </a>
                    </div>
                  )}

                  {selectedTechnician.bank_account_number && (
                    <div className="space-y-1 col-span-2 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Bank Details</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Account Holder</p>
                          <p className="font-medium">{selectedTechnician.bank_account_holder_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Account Number</p>
                          <p className="font-medium">{selectedTechnician.bank_account_number}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">IFSC Code</p>
                          <p className="font-medium">{selectedTechnician.bank_ifsc_code}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Application Date
                    </div>
                    <p className="font-medium">
                      {new Date(selectedTechnician.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Background Check Consent</p>
                    <p className="font-medium">
                      {selectedTechnician.background_check_consent ? "Yes" : "No"}
                    </p>
                  </div>

                  {selectedTechnician.kyc_rejection_reason && (
                    <div className="space-y-1 col-span-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Rejection Reason</p>
                      <p className="text-sm">{selectedTechnician.kyc_rejection_reason}</p>
                    </div>
                  )}
                </div>

                {selectedTechnician.kyc_status === "submitted" && (
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => openRejectDialog(selectedTechnician)}
                      disabled={actionLoading}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedTechnician)}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </DialogFooter>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting {selectedTechnician?.full_name}'s application.
              </DialogDescription>
            </DialogHeader>

            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? "Rejecting..." : "Reject Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
