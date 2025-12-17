import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Upload, CheckCircle, AlertCircle, ArrowRight, User, MapPin, Briefcase, CreditCard } from "lucide-react";
import { z } from "zod";

const kycSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Valid phone number required"),
  address: z.string().min(10, "Please enter complete address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Valid 6-digit pincode required"),
  idDocumentType: z.string().min(1, "Please select ID type"),
  yearsOfExperience: z.number().min(0, "Experience must be 0 or more"),
  backgroundCheckConsent: z.literal(true, { errorMap: () => ({ message: "Background check consent is required" }) }),
  bankAccountNumber: z.string().min(8, "Valid account number required"),
  bankIfscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Valid IFSC code required"),
  bankAccountHolderName: z.string().min(2, "Account holder name required"),
});

const skillOptions = [
  "Plumbing", "Electrical", "Carpentry", "Painting", "AC Repair",
  "Appliance Repair", "Cleaning", "Pest Control", "Gardening", "Handyman"
];

const certificationOptions = [
  "ITI Certificate", "Diploma in Trade", "Professional License",
  "Safety Training", "Brand Certified", "Other"
];

const TechnicianKYC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    idDocumentType: "",
    idDocumentUrl: "",
    skills: [] as string[],
    certifications: [] as string[],
    yearsOfExperience: 0,
    backgroundCheckConsent: false,
    bankAccountNumber: "",
    bankIfscCode: "",
    bankAccountHolderName: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/technician/login");
        return;
      }

      setUserId(session.user.id);

      // Check for existing profile
      const { data: profile } = await supabase
        .from("technician_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profile) {
        setExistingProfile(profile);
        if (profile.kyc_status === "approved") {
          navigate("/technician-dashboard");
          return;
        }
        if (profile.kyc_status === "submitted") {
          navigate("/technician/kyc-pending");
          return;
        }
        // Pre-fill form with existing data if rejected or pending
        setFormData({
          fullName: profile.full_name || "",
          phone: profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          pincode: profile.pincode || "",
          idDocumentType: profile.id_document_type || "",
          idDocumentUrl: profile.id_document_url || "",
          skills: profile.skills || [],
          certifications: profile.certifications || [],
          yearsOfExperience: profile.years_of_experience || 0,
          backgroundCheckConsent: profile.background_check_consent || false,
          bankAccountNumber: profile.bank_account_number || "",
          bankIfscCode: profile.bank_ifsc_code || "",
          bankAccountHolderName: profile.bank_account_holder_name || "",
        });
      }
    };

    checkAuth();
  }, [navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPEG, PNG, or PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingDoc(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/id-document.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("kyc-documents")
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, idDocumentUrl: fileName }));
      toast({
        title: "Document Uploaded",
        description: "Your ID document has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const toggleCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const handleSubmit = async () => {
    const validationData = {
      ...formData,
      backgroundCheckConsent: formData.backgroundCheckConsent as true,
    };

    const result = kycSchema.safeParse(validationData);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    if (!formData.idDocumentUrl) {
      toast({
        title: "Document Required",
        description: "Please upload your ID document.",
        variant: "destructive",
      });
      return;
    }

    if (formData.skills.length === 0) {
      toast({
        title: "Skills Required",
        description: "Please select at least one skill.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        user_id: userId,
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        id_document_type: formData.idDocumentType,
        id_document_url: formData.idDocumentUrl,
        skills: formData.skills,
        certifications: formData.certifications,
        years_of_experience: formData.yearsOfExperience,
        background_check_consent: formData.backgroundCheckConsent,
        bank_account_number: formData.bankAccountNumber,
        bank_ifsc_code: formData.bankIfscCode,
        bank_account_holder_name: formData.bankAccountHolderName,
        kyc_status: "submitted" as const,
      };

      if (existingProfile) {
        const { error } = await supabase
          .from("technician_profiles")
          .update(profileData)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("technician_profiles")
          .insert(profileData);

        if (error) throw error;
      }

      toast({
        title: "KYC Submitted!",
        description: "Your application is under review. We'll notify you once approved.",
      });
      navigate("/technician/kyc-pending");
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Personal Information</h2>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Full Name (as per ID)</label>
        <Input
          value={formData.fullName}
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          placeholder="Enter your full name"
          className="py-5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Phone Number</label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="+91 98765 43210"
          className="py-5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Complete Address</label>
        <Textarea
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="House/Flat No., Street, Locality"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <Input
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            placeholder="City"
            className="py-5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">State</label>
          <Input
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            placeholder="State"
            className="py-5"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Pincode</label>
        <Input
          value={formData.pincode}
          onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
          placeholder="6-digit pincode"
          className="py-5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">ID Document Type</label>
        <Select
          value={formData.idDocumentType}
          onValueChange={(value) => setFormData(prev => ({ ...prev, idDocumentType: value }))}
        >
          <SelectTrigger className="py-5">
            <SelectValue placeholder="Select ID type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
            <SelectItem value="pan">PAN Card</SelectItem>
            <SelectItem value="passport">Passport</SelectItem>
            <SelectItem value="driving_license">Driving License</SelectItem>
            <SelectItem value="voter_id">Voter ID</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Upload ID Document</label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-colors">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="doc-upload"
            disabled={uploadingDoc}
          />
          <label htmlFor="doc-upload" className="cursor-pointer">
            {formData.idDocumentUrl ? (
              <div className="flex items-center justify-center gap-2 text-accent">
                <CheckCircle className="w-5 h-5" />
                <span>Document uploaded</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="w-8 h-8" />
                <span>{uploadingDoc ? "Uploading..." : "Click to upload (JPG, PNG, PDF)"}</span>
                <span className="text-xs">Max 5MB</span>
              </div>
            )}
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Professional Details</h2>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Skills (Select all that apply)</label>
        <div className="flex flex-wrap gap-2">
          {skillOptions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                formData.skills.includes(skill)
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Certifications (if any)</label>
        <div className="flex flex-wrap gap-2">
          {certificationOptions.map((cert) => (
            <button
              key={cert}
              type="button"
              onClick={() => toggleCertification(cert)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                formData.certifications.includes(cert)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cert}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Years of Experience</label>
        <Input
          type="number"
          min="0"
          value={formData.yearsOfExperience}
          onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
          placeholder="0"
          className="py-5"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Bank Details & Consent</h2>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Bank Account Number</label>
        <Input
          value={formData.bankAccountNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
          placeholder="Enter account number"
          className="py-5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">IFSC Code</label>
        <Input
          value={formData.bankIfscCode}
          onChange={(e) => setFormData(prev => ({ ...prev, bankIfscCode: e.target.value.toUpperCase() }))}
          placeholder="e.g., SBIN0001234"
          className="py-5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Account Holder Name</label>
        <Input
          value={formData.bankAccountHolderName}
          onChange={(e) => setFormData(prev => ({ ...prev, bankAccountHolderName: e.target.value }))}
          placeholder="Name as per bank records"
          className="py-5"
        />
      </div>

      <div className="bg-secondary/50 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={formData.backgroundCheckConsent}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, backgroundCheckConsent: checked === true }))
            }
          />
          <div>
            <label htmlFor="consent" className="text-sm font-medium cursor-pointer">
              I consent to background verification
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              I authorize HelpR to conduct background checks including criminal record verification, 
              address verification, and identity verification as part of the onboarding process.
            </p>
          </div>
        </div>
      </div>

      {existingProfile?.kyc_status === "rejected" && existingProfile?.kyc_rejection_reason && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Previous Application Rejected</p>
              <p className="text-sm text-muted-foreground mt-1">
                {existingProfile.kyc_rejection_reason}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > s ? "bg-accent" : "bg-secondary"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">
                Complete Your KYC
              </h1>
              <p className="text-muted-foreground">
                Step {step} of 3: {step === 1 ? "Personal Info" : step === 2 ? "Professional Details" : "Bank & Consent"}
              </p>
            </div>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="bg-gradient-accent hover:opacity-90"
                >
                  Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !formData.backgroundCheckConsent}
                  className="bg-gradient-accent hover:opacity-90"
                >
                  {loading ? "Submitting..." : "Submit Application"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TechnicianKYC;