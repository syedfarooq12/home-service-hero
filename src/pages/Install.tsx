import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Smartphone, Monitor, CheckCircle } from "lucide-react";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-12 max-w-2xl">
        <div className="text-center mb-8">
          <Smartphone className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Install Helpr App</h1>
          <p className="text-muted-foreground">
            Get the full app experience — works offline, loads instantly
          </p>
        </div>

        {isInstalled ? (
          <Card className="text-center py-8">
            <CardContent className="space-y-3">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <h2 className="text-xl font-semibold text-foreground">Already Installed!</h2>
              <p className="text-muted-foreground">Helpr is installed on your device.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {deferredPrompt && (
              <Button onClick={handleInstall} size="lg" className="w-full text-lg py-6">
                <Download className="h-5 w-5 mr-2" />
                Install Helpr Now
              </Button>
            )}

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  On iPhone / Safari
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                  <li>Tap the <strong>Share</strong> button (square with arrow)</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> to confirm</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  On Android / Chrome
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                  <li>Tap the <strong>⋮ menu</strong> (three dots)</li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></li>
                  <li>Tap <strong>"Install"</strong> to confirm</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Install;
