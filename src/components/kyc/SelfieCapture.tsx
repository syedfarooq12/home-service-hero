import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SelfieCaptureProps {
  userId: string;
  idDocumentUrl: string;
  onVerificationComplete: (result: {
    selfieUrl: string;
    verified: boolean;
    confidence: number;
    analysis: string;
  }) => void;
  disabled?: boolean;
}

const SelfieCapture = ({ userId, idDocumentUrl, onVerificationComplete, disabled }: SelfieCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    confidence: number;
    analysis: string;
    issues: string[];
  } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to take a selfie for verification.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    startCamera();
  };

  const uploadAndVerify = async () => {
    if (!capturedImage || !userId) return;

    setIsVerifying(true);
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Upload selfie
      const fileName = `${userId}/selfie.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(fileName, blob, { upsert: true, contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      // Get public URLs for both images
      const { data: { publicUrl: selfiePublicUrl } } = supabase.storage
        .from("kyc-documents")
        .getPublicUrl(fileName);

      const { data: { publicUrl: idPublicUrl } } = supabase.storage
        .from("kyc-documents")
        .getPublicUrl(idDocumentUrl);

      // Call face verification edge function
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
        "verify-face-match",
        {
          body: {
            idDocumentUrl: idPublicUrl,
            selfieUrl: selfiePublicUrl,
          },
        }
      );

      if (verifyError) throw verifyError;

      setVerificationResult({
        verified: verifyData.verified,
        confidence: verifyData.confidence,
        analysis: verifyData.analysis,
        issues: verifyData.issues || [],
      });

      onVerificationComplete({
        selfieUrl: fileName,
        verified: verifyData.verified,
        confidence: verifyData.confidence,
        analysis: verifyData.analysis,
      });

      if (verifyData.verified) {
        toast({
          title: "Face Verified!",
          description: `Your identity has been verified with ${verifyData.confidence}% confidence.`,
        });
      } else {
        toast({
          title: "Verification Failed",
          description: verifyData.analysis || "Face did not match ID document. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="w-5 h-5 text-accent" />
        <h3 className="font-medium">Face Verification</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Take a selfie to verify your identity matches your ID document.
      </p>

      <div className="relative aspect-[4/3] bg-secondary rounded-lg overflow-hidden">
        {!isCapturing && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-muted-foreground/50 flex items-center justify-center">
              <Camera className="w-10 h-10 text-muted-foreground" />
            </div>
            <Button
              onClick={startCamera}
              disabled={disabled || !idDocumentUrl}
              className="bg-gradient-accent"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
            {!idDocumentUrl && (
              <p className="text-xs text-muted-foreground">Upload ID document first</p>
            )}
          </div>
        )}

        {isCapturing && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-60 border-2 border-accent rounded-full opacity-50" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <Button onClick={capturePhoto} size="lg" className="bg-gradient-accent">
                <Camera className="w-5 h-5 mr-2" />
                Capture
              </Button>
              <Button onClick={stopCamera} variant="outline" size="lg">
                Cancel
              </Button>
            </div>
          </>
        )}

        {capturedImage && (
          <>
            <img
              src={capturedImage}
              alt="Captured selfie"
              className="w-full h-full object-cover"
            />
            {verificationResult && (
              <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                verificationResult.verified 
                  ? "bg-green-500/90 text-white" 
                  : "bg-destructive/90 text-destructive-foreground"
              }`}>
                {verificationResult.verified ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {verificationResult.verified ? `${verificationResult.confidence}% Match` : "No Match"}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {capturedImage && !verificationResult && (
        <div className="flex gap-2">
          <Button
            onClick={uploadAndVerify}
            disabled={isVerifying}
            className="flex-1 bg-gradient-accent"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Face
              </>
            )}
          </Button>
          <Button onClick={retakePhoto} variant="outline" disabled={isVerifying}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake
          </Button>
        </div>
      )}

      {verificationResult && (
        <div className={`p-4 rounded-lg ${
          verificationResult.verified 
            ? "bg-green-500/10 border border-green-500/30" 
            : "bg-destructive/10 border border-destructive/30"
        }`}>
          <p className="text-sm">
            <strong>{verificationResult.verified ? "✓ Verified:" : "✗ Not Verified:"}</strong>{" "}
            {verificationResult.analysis}
          </p>
          {verificationResult.issues.length > 0 && (
            <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside">
              {verificationResult.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          )}
          {!verificationResult.verified && (
            <Button onClick={retakePhoto} variant="outline" size="sm" className="mt-3">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SelfieCapture;
