import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  RefreshCw,
  MapPin,
  Package,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;

const categories = [
  "electrical",
  "plumbing",
  "ac",
  "cleaning",
  "carpentry",
  "appliance",
  "painting",
  "pest-control",
];

const defaultLocations = [
  "Mumbai, Maharashtra",
  "Delhi, Delhi",
  "Bangalore, Karnataka",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
  "Pune, Maharashtra",
  "Ahmedabad, Gujarat",
];

interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  original_price: number;
  duration: string;
  image_url: string;
  includes: string[];
  available_locations: string[];
  is_active: boolean;
  is_hidden: boolean;
}

const emptyFormData: ServiceFormData = {
  name: "",
  description: "",
  category: "",
  price: 0,
  original_price: 0,
  duration: "",
  image_url: "",
  includes: [],
  available_locations: [],
  is_active: true,
  is_hidden: false,
};

export const ServiceManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(emptyFormData);
  const [includesInput, setIncludesInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { toast } = useToast();

  // Get unique locations from services
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    services.forEach((s) => {
      s.available_locations?.forEach((loc) => locations.add(loc));
    });
    return Array.from(locations).sort();
  }, [services]);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        service.name.toLowerCase().includes(searchLower) ||
        service.description?.toLowerCase().includes(searchLower);

      const matchesCategory =
        categoryFilter === "all" || service.category === categoryFilter;

      const matchesLocation =
        locationFilter === "all" ||
        service.available_locations?.includes(locationFilter);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && service.is_active && !service.is_hidden) ||
        (statusFilter === "hidden" && service.is_hidden) ||
        (statusFilter === "inactive" && !service.is_active);

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
    });
  }, [services, searchQuery, categoryFilter, locationFilter, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setLocationFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    searchQuery ||
    categoryFilter !== "all" ||
    locationFilter !== "all" ||
    statusFilter !== "all";

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch services.",
        variant: "destructive",
      });
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  const openAddDialog = () => {
    setSelectedService(null);
    setFormData(emptyFormData);
    setIncludesInput("");
    setDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      category: service.category,
      price: Number(service.price),
      original_price: Number(service.original_price) || 0,
      duration: service.duration || "",
      image_url: service.image_url || "",
      includes: service.includes || [],
      available_locations: service.available_locations || [],
      is_active: service.is_active,
      is_hidden: service.is_hidden,
    });
    setIncludesInput((service.includes || []).join("\n"));
    setDialogOpen(true);
  };

  const openDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);

    const includesArray = includesInput
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s);

    const serviceData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: formData.price,
      original_price: formData.original_price || formData.price,
      duration: formData.duration,
      image_url: formData.image_url,
      includes: includesArray,
      available_locations: formData.available_locations,
      is_active: formData.is_active,
      is_hidden: formData.is_hidden,
    };

    if (selectedService) {
      // Update
      const { error } = await supabase
        .from("services")
        .update(serviceData)
        .eq("id", selectedService.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update service.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Service updated successfully.",
        });
        setDialogOpen(false);
        fetchServices();
      }
    } else {
      // Create
      const { error } = await supabase.from("services").insert(serviceData);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create service.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Service created successfully.",
        });
        setDialogOpen(false);
        fetchServices();
      }
    }

    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedService) return;

    setActionLoading(true);

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", selectedService.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete service.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Service deleted successfully.",
      });
      setDeleteDialogOpen(false);
      fetchServices();
    }

    setActionLoading(false);
  };

  const toggleVisibility = async (service: Service) => {
    const { error } = await supabase
      .from("services")
      .update({ is_hidden: !service.is_hidden })
      .eq("id", service.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update visibility.",
        variant: "destructive",
      });
    } else {
      fetchServices();
    }
  };

  const toggleActive = async (service: Service) => {
    const { error } = await supabase
      .from("services")
      .update({ is_active: !service.is_active })
      .eq("id", service.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    } else {
      fetchServices();
    }
  };

  const toggleLocation = (location: string) => {
    setFormData((prev) => ({
      ...prev,
      available_locations: prev.available_locations.includes(location)
        ? prev.available_locations.filter((l) => l !== location)
        : [...prev.available_locations, location],
    }));
  };

  const getStatusBadge = (service: Service) => {
    if (!service.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (service.is_hidden) {
      return <Badge variant="secondary">Hidden</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Services</h2>
          <p className="text-sm text-muted-foreground">
            Manage your service offerings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchServices} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="shrink-0">
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          Showing {filteredServices.length} of {services.length} services
          {hasActiveFilters && " (filtered)"}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">
                    Loading services...
                  </p>
                </TableCell>
              </TableRow>
            ) : filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground mt-2">
                    {hasActiveFilters
                      ? "No services match your filters"
                      : "No services yet"}
                  </p>
                  {hasActiveFilters ? (
                    <Button variant="link" onClick={clearFilters} className="mt-2">
                      Clear filters
                    </Button>
                  ) : (
                    <Button variant="link" onClick={openAddDialog} className="mt-2">
                      Add your first service
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {service.image_url && (
                        <img
                          src={service.image_url}
                          alt={service.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {service.category.charAt(0).toUpperCase() +
                        service.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">₹{service.price}</span>
                    {service.original_price &&
                      Number(service.original_price) > Number(service.price) && (
                        <span className="text-xs text-muted-foreground line-through ml-2">
                          ₹{service.original_price}
                        </span>
                      )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">
                        {service.available_locations?.length || 0} locations
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(service)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(service)}
                        title={service.is_hidden ? "Show" : "Hide"}
                      >
                        {service.is_hidden ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(service)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(service)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
            <DialogDescription>
              {selectedService
                ? "Update the service details below."
                : "Fill in the details to create a new service."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., AC Service & Repair"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 60-90 min"
                />
              </div>

              <div>
                <Label htmlFor="price">Offer Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  placeholder="499"
                />
                <p className="text-xs text-muted-foreground mt-1">Current selling price shown to customers</p>
              </div>

              <div>
                <Label htmlFor="original_price">Original/MRP Price (₹)</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={formData.original_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      original_price: Number(e.target.value),
                    })
                  }
                  placeholder="799"
                />
                <p className="text-xs text-muted-foreground mt-1">Original price (crossed out to show discount)</p>
              </div>

              <div className="col-span-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the service..."
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="includes">What's Included (one per line)</Label>
                <Textarea
                  id="includes"
                  value={includesInput}
                  onChange={(e) => setIncludesInput(e.target.value)}
                  placeholder="Filter cleaning&#10;Gas pressure check&#10;30-day warranty"
                  rows={4}
                />
              </div>

              <div className="col-span-2">
                <Label>Available Locations</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {defaultLocations.map((loc) => (
                    <Badge
                      key={loc}
                      variant={
                        formData.available_locations.includes(loc)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleLocation(loc)}
                    >
                      {loc}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, is_active: v })
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_hidden"
                    checked={formData.is_hidden}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, is_hidden: v })
                    }
                  />
                  <Label htmlFor="is_hidden">Hidden</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={actionLoading}>
              {actionLoading
                ? "Saving..."
                : selectedService
                ? "Update Service"
                : "Create Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedService?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
