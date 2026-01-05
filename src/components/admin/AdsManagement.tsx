import { useState, useEffect } from "react";
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
  RefreshCw,
  Image,
  ExternalLink,
} from "lucide-react";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  position: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

const positions = [
  { value: "homepage", label: "Homepage Banner" },
  { value: "services", label: "Services Page" },
  { value: "sidebar", label: "Sidebar" },
  { value: "footer", label: "Footer" },
];

interface AdFormData {
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  position: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

const emptyFormData: AdFormData = {
  title: "",
  description: "",
  image_url: "",
  link_url: "",
  position: "homepage",
  is_active: true,
  start_date: "",
  end_date: "",
};

export const AdsManagement = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState<AdFormData>(emptyFormData);
  const [actionLoading, setActionLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch ads.",
        variant: "destructive",
      });
    } else {
      setAds(data || []);
    }
    setLoading(false);
  };

  const openAddDialog = () => {
    setSelectedAd(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const openEditDialog = (ad: Ad) => {
    setSelectedAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || "",
      image_url: ad.image_url,
      link_url: ad.link_url || "",
      position: ad.position,
      is_active: ad.is_active,
      start_date: ad.start_date ? ad.start_date.split("T")[0] : "",
      end_date: ad.end_date ? ad.end_date.split("T")[0] : "",
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (ad: Ad) => {
    setSelectedAd(ad);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.image_url) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and image URL.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);

    const adData = {
      title: formData.title,
      description: formData.description || null,
      image_url: formData.image_url,
      link_url: formData.link_url || null,
      position: formData.position,
      is_active: formData.is_active,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
    };

    if (selectedAd) {
      const { error } = await supabase
        .from("ads")
        .update(adData)
        .eq("id", selectedAd.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update ad.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Ad updated successfully.",
        });
        setDialogOpen(false);
        fetchAds();
      }
    } else {
      const { error } = await supabase.from("ads").insert(adData);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create ad.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Ad created successfully.",
        });
        setDialogOpen(false);
        fetchAds();
      }
    }

    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedAd) return;

    setActionLoading(true);

    const { error } = await supabase.from("ads").delete().eq("id", selectedAd.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete ad.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Ad deleted successfully.",
      });
      setDeleteDialogOpen(false);
      fetchAds();
    }

    setActionLoading(false);
  };

  const toggleActive = async (ad: Ad) => {
    const { error } = await supabase
      .from("ads")
      .update({ is_active: !ad.is_active })
      .eq("id", ad.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    } else {
      fetchAds();
    }
  };

  const getStatusBadge = (ad: Ad) => {
    if (!ad.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    const now = new Date();
    if (ad.start_date && new Date(ad.start_date) > now) {
      return <Badge variant="outline">Scheduled</Badge>;
    }
    if (ad.end_date && new Date(ad.end_date) < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getPositionLabel = (position: string) => {
    return positions.find((p) => p.value === position)?.label || position;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Advertisements</h2>
          <p className="text-sm text-muted-foreground">
            Manage promotional banners and ads
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAds} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Ad
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">Loading ads...</p>
                </TableCell>
              </TableRow>
            ) : ads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Image className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground mt-2">No ads yet</p>
                  <Button variant="link" onClick={openAddDialog} className="mt-2">
                    Create your first ad
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      className="w-20 h-12 object-cover rounded-md border"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ad.title}</p>
                      {ad.link_url && (
                        <a
                          href={ad.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {ad.link_url.slice(0, 30)}...
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getPositionLabel(ad.position)}</TableCell>
                  <TableCell>{getStatusBadge(ad)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {ad.start_date ? (
                        <p>From: {new Date(ad.start_date).toLocaleDateString()}</p>
                      ) : (
                        <p className="text-muted-foreground">No start date</p>
                      )}
                      {ad.end_date ? (
                        <p>To: {new Date(ad.end_date).toLocaleDateString()}</p>
                      ) : (
                        <p className="text-muted-foreground">No end date</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Switch
                        checked={ad.is_active}
                        onCheckedChange={() => toggleActive(ad)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(ad)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(ad)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedAd ? "Edit Ad" : "Create New Ad"}</DialogTitle>
            <DialogDescription>
              {selectedAd
                ? "Update the advertisement details"
                : "Add a new promotional banner"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Ad title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Image URL *</Label>
              <Input
                value={formData.image_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, image_url: e.target.value }))
                }
                placeholder="https://example.com/banner.jpg"
              />
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md border mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input
                value={formData.link_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link_url: e.target.value }))
                }
                placeholder="https://example.com/offer"
              />
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, position: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value}>
                      {pos.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={actionLoading}>
              {actionLoading ? "Saving..." : selectedAd ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ad</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedAd?.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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
