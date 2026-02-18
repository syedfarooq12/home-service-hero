import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Phone, Shield, X } from "lucide-react";
import BookingChat from "./BookingChat";
import InAppCall from "./InAppCall";

interface CommunicationPanelProps {
  bookingId: string;
  userId: string;
  userRole: "customer" | "technician";
  otherPartyName?: string;
  otherPartyId?: string;
  trigger?: React.ReactNode;
}

const CommunicationPanel = ({
  bookingId,
  userId,
  userRole,
  otherPartyName = "Support",
  otherPartyId,
  trigger,
}: CommunicationPanelProps) => {
  const [open, setOpen] = useState(false);
  const [showCall, setShowCall] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Secure Chat
          </Button>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-2 border-b border-border flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <SheetTitle className="text-base">Secure Communication</SheetTitle>
            </div>
          </SheetHeader>

          <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4 mt-3 grid grid-cols-2">
              <TabsTrigger value="chat" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="call" className="gap-2" disabled={!otherPartyId}>
                <Phone className="w-4 h-4" />
                Voice Call
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
              <div className="h-[calc(100vh-160px)] flex flex-col">
                <BookingChat
                  bookingId={bookingId}
                  userId={userId}
                  userRole={userRole}
                  otherPartyName={otherPartyName}
                />
              </div>
            </TabsContent>

            <TabsContent value="call" className="flex-1 mt-0">
              <div className="h-[calc(100vh-160px)]">
                {otherPartyId && (
                  <InAppCall
                    bookingId={bookingId}
                    callerId={userId}
                    calleeId={otherPartyId}
                    callerName={otherPartyName}
                    onClose={() => setOpen(false)}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CommunicationPanel;
