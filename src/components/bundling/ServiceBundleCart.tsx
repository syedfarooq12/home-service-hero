import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X, Package, Percent, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";

interface BundleItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

const DISCOUNT_PERCENTAGE = 10;

const ServiceBundleCart = () => {
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load bundle from localStorage
    const savedBundle = localStorage.getItem("serviceBundle");
    if (savedBundle) {
      setBundleItems(JSON.parse(savedBundle));
    }

    // Listen for bundle updates
    const handleBundleUpdate = () => {
      const bundle = localStorage.getItem("serviceBundle");
      if (bundle) {
        setBundleItems(JSON.parse(bundle));
      } else {
        setBundleItems([]);
      }
    };

    window.addEventListener("bundleUpdated", handleBundleUpdate);
    return () => window.removeEventListener("bundleUpdated", handleBundleUpdate);
  }, []);

  const removeItem = (id: string) => {
    const updated = bundleItems.filter((item) => item.id !== id);
    setBundleItems(updated);
    localStorage.setItem("serviceBundle", JSON.stringify(updated));
    window.dispatchEvent(new Event("bundleUpdated"));
  };

  const clearBundle = () => {
    setBundleItems([]);
    localStorage.removeItem("serviceBundle");
    window.dispatchEvent(new Event("bundleUpdated"));
  };

  const totalOriginal = bundleItems.reduce((sum, item) => sum + item.price, 0);
  const discount = bundleItems.length >= 2 ? totalOriginal * (DISCOUNT_PERCENTAGE / 100) : 0;
  const totalDiscounted = totalOriginal - discount;

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/bundle-checkout");
  };

  if (bundleItems.length === 0) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-24 right-6 z-50 rounded-full h-14 w-14 shadow-lg"
          size="icon"
        >
          <ShoppingCart className="h-6 w-6" />
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
            {bundleItems.length}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Service Bundle
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
          {bundleItems.map((item) => (
            <Card key={item.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => removeItem(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardContent className="pt-4 pb-3">
                <p className="font-medium pr-6">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.category}</p>
                <p className="text-primary font-semibold mt-1">₹{item.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({bundleItems.length} services)</span>
            <span>₹{totalOriginal}</span>
          </div>
          
          {bundleItems.length >= 2 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="flex items-center gap-1">
                <Percent className="h-4 w-4" />
                Bundle Discount ({DISCOUNT_PERCENTAGE}%)
              </span>
              <span>-₹{discount.toFixed(0)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-semibold text-lg border-t pt-3">
            <span>Total</span>
            <span className="text-primary">₹{totalDiscounted.toFixed(0)}</span>
          </div>

          {bundleItems.length < 2 && (
            <p className="text-xs text-muted-foreground text-center">
              Add 1 more service to get {DISCOUNT_PERCENTAGE}% bundle discount!
            </p>
          )}
        </div>

        <SheetFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={clearBundle} className="flex-1">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button onClick={handleCheckout} className="flex-1" disabled={bundleItems.length < 2}>
            Book Bundle
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ServiceBundleCart;
