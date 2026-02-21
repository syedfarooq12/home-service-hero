import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppShareProps {
  serviceName: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  bookingId: string;
  size?: "sm" | "default";
}

const WhatsAppShare = ({
  serviceName,
  status,
  scheduledDate,
  scheduledTime,
  bookingId,
  size = "sm",
}: WhatsAppShareProps) => {
  const handleShare = () => {
    const date = new Date(scheduledDate).toLocaleDateString();
    const message = encodeURIComponent(
      `📋 *Helpr Booking Update*\n\n🔧 Service: ${serviceName}\n📅 Date: ${date} at ${scheduledTime}\n📌 Status: ${status}\n\nTrack your booking on Helpr!`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleShare}
      className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
    >
      <MessageCircle className="h-4 w-4 mr-1.5" />
      Share on WhatsApp
    </Button>
  );
};

export default WhatsAppShare;
