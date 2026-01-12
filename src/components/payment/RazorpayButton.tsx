import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Loader2, Shield, Lock } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayButtonProps {
  amount: number;
  serviceName: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  bookingId?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const RazorpayButton = ({
  amount,
  serviceName,
  customerName = "",
  customerEmail = "",
  customerPhone = "",
  bookingId,
  onSuccess,
  onError,
  className,
}: RazorpayButtonProps) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      // Create order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            amount,
            bookingId,
            customerName,
            customerEmail,
            customerPhone,
          },
        }
      );

      if (orderError || !orderData?.orderId) {
        throw new Error(orderError?.message || "Failed to create order");
      }

      // Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HelperBees",
        description: serviceName,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              "verify-razorpay-payment",
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId,
                },
              }
            );

            if (verifyError || !verifyData?.verified) {
              throw new Error("Payment verification failed");
            }

            toast.success("Payment successful!", {
              description: "Your booking has been confirmed.",
            });
            onSuccess?.(response.razorpay_payment_id);
          } catch (error: any) {
            toast.error("Payment verification failed", {
              description: error.message,
            });
            onError?.(error.message);
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: "#8B5CF6",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Payment failed", {
        description: error.message,
      });
      onError?.(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handlePayment}
        disabled={loading}
        variant="hero"
        size="xl"
        className={className}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CreditCard className="h-5 w-5" />
        )}
        {loading ? "Processing..." : `Pay ₹${amount.toLocaleString()}`}
      </Button>
      
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          <span>256-bit SSL</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          <span>Secured by Razorpay</span>
        </div>
      </div>
    </div>
  );
};

export const PricingBreakdown = ({
  basePrice,
  quantity = 1,
  originalPrice,
  gstPercent = 18,
  showGst = true,
}: {
  basePrice: number;
  quantity?: number;
  originalPrice?: number | null;
  gstPercent?: number;
  showGst?: boolean;
}) => {
  const subtotal = basePrice * quantity;
  const gstAmount = showGst ? Math.round(subtotal * (gstPercent / 100)) : 0;
  const total = subtotal + gstAmount;
  const savings = originalPrice ? (originalPrice - basePrice) * quantity : 0;

  return (
    <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Service charge ({quantity}x)</span>
        <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
      </div>
      
      {showGst && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">GST ({gstPercent}%)</span>
          <span className="text-foreground">₹{gstAmount.toLocaleString()}</span>
        </div>
      )}
      
      {savings > 0 && (
        <div className="flex items-center justify-between text-sm text-accent">
          <span>You save</span>
          <span>-₹{savings.toLocaleString()}</span>
        </div>
      )}
      
      <div className="border-t border-border pt-3 flex items-center justify-between">
        <span className="font-semibold text-foreground">Total</span>
        <div className="text-right">
          <span className="text-xl font-bold text-foreground">₹{total.toLocaleString()}</span>
          {!showGst && <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
        <Shield className="h-4 w-4 text-accent" />
        <span>No hidden charges. Pay only what you see.</span>
      </div>
    </div>
  );
};
