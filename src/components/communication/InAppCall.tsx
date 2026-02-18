import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface InAppCallProps {
  bookingId: string;
  callerId: string;
  calleeId: string;
  callerName?: string;
  onClose: () => void;
  isIncoming?: boolean;
  sessionId?: string;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const InAppCall = ({
  bookingId,
  callerId,
  calleeId,
  callerName = "Technician",
  onClose,
  isIncoming = false,
  sessionId: incomingSessionId,
}: InAppCallProps) => {
  const [callStatus, setCallStatus] = useState<
    "idle" | "calling" | "ringing" | "connected" | "ended"
  >(isIncoming ? "ringing" : "idle");
  const [sessionId, setSessionId] = useState<string | null>(incomingSessionId || null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [duration, setDuration] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (callStatus === "connected") {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToSession(sessionId);
    return () => { unsub(); };
  }, [sessionId]);

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    return stream;
  };

  const createPeerConnection = (stream: MediaStream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    pc.ontrack = (e) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = e.streams[0];
      }
    };

    pc.onicecandidate = async (e) => {
      if (!e.candidate || !sessionId) return;
      const { data } = await supabase
        .from("call_sessions")
        .select("ice_candidates")
        .eq("id", sessionId)
        .single();
      const existing = (data?.ice_candidates as any[]) || [];
      await supabase
        .from("call_sessions")
        .update({ ice_candidates: [...existing, e.candidate.toJSON()] })
        .eq("id", sessionId);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setCallStatus("connected");
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) endCall();
    };

    pcRef.current = pc;
    return pc;
  };

  const startCall = async () => {
    try {
      setCallStatus("calling");
      const stream = await getLocalStream();
      const pc = createPeerConnection(stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const { data, error } = await supabase
        .from("call_sessions")
        .insert({
          booking_id: bookingId,
          caller_id: callerId,
          callee_id: calleeId,
          status: "ringing",
          offer: offer as any,
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (err: any) {
      toast({ title: "Call failed", description: err.message, variant: "destructive" });
      setCallStatus("idle");
    }
  };

  const answerCall = async () => {
    if (!sessionId) return;
    try {
      const stream = await getLocalStream();

      const { data } = await supabase
        .from("call_sessions")
        .select("offer")
        .eq("id", sessionId)
        .single();

      if (!data?.offer) return;
      const pc = createPeerConnection(stream);
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer as any));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await supabase
        .from("call_sessions")
        .update({ status: "connected", answer: answer as any, started_at: new Date().toISOString() })
        .eq("id", sessionId);

      setCallStatus("connected");
    } catch (err: any) {
      toast({ title: "Answer failed", description: err.message, variant: "destructive" });
    }
  };

  const endCall = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());

    if (sessionId) {
      await supabase
        .from("call_sessions")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", sessionId);
    }

    setCallStatus("ended");
    setTimeout(onClose, 1500);
  }, [sessionId, onClose]);

  const declineCall = async () => {
    if (sessionId) {
      await supabase
        .from("call_sessions")
        .update({ status: "declined" })
        .eq("id", sessionId);
    }
    onClose();
  };

  const subscribeToSession = (sid: string) => {
    const channel = supabase
      .channel(`call-${sid}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "call_sessions", filter: `id=eq.${sid}` },
        async (payload) => {
          const session = payload.new as any;

          if (session.status === "declined") {
            toast({ title: "Call declined", description: "The other party declined." });
            endCall();
            return;
          }

          if (session.status === "ended") {
            endCall();
            return;
          }

          // Caller: receive answer
          if (session.answer && pcRef.current && !pcRef.current.currentRemoteDescription) {
            await pcRef.current.setRemoteDescription(
              new RTCSessionDescription(session.answer as any)
            );
            setCallStatus("connected");
          }

          // Apply ICE candidates
          if (session.ice_candidates && pcRef.current) {
            const candidates: RTCIceCandidateInit[] = session.ice_candidates as any[];
            for (const c of candidates) {
              try {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
              } catch {}
            }
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = isMuted));
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !isSpeakerOff;
      setIsSpeakerOff(!isSpeakerOff);
    }
  };

  const statusLabel: Record<string, string> = {
    idle: "Ready to call",
    calling: "Calling...",
    ringing: "Incoming call",
    connected: formatDuration(duration),
    ended: "Call ended",
  };

  return (
    <div className="flex flex-col items-center justify-between h-full py-8 px-6 bg-card">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Avatar & Status */}
      <div className="flex flex-col items-center gap-4 mt-6">
        <div className="relative">
          <div
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold",
              callStatus === "connected"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground"
            )}
          >
            {callerName[0]?.toUpperCase()}
          </div>
          {callStatus === "connected" && (
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-primary border-2 border-card" />
          )}
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-foreground">{callerName}</p>
          <p className="text-sm text-muted-foreground">{statusLabel[callStatus]}</p>
        </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="w-3 h-3 text-primary" />
              <span>End-to-end encrypted call</span>
            </div>
          </div>

      {/* Controls */}
      <div className="space-y-4 w-full">
        {callStatus === "connected" && (
          <div className="flex justify-center gap-4">
            <Button
              onClick={toggleMute}
              variant={isMuted ? "destructive" : "outline"}
              size="icon"
              className="w-12 h-12 rounded-full"
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button
              onClick={toggleSpeaker}
              variant={isSpeakerOff ? "destructive" : "outline"}
              size="icon"
              className="w-12 h-12 rounded-full"
            >
              {isSpeakerOff ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        )}

        <div className="flex justify-center gap-6">
          {callStatus === "ringing" && (
            <>
              <Button
                onClick={declineCall}
                variant="destructive"
                size="icon"
                className="w-16 h-16 rounded-full"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              <Button
                onClick={answerCall}
                size="icon"
                className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90"
              >
                <Phone className="w-6 h-6" />
              </Button>
            </>
          )}

          {callStatus === "idle" && (
            <Button
              onClick={startCall}
              size="icon"
              className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90"
            >
              <Phone className="w-6 h-6" />
            </Button>
          )}

          {["calling", "connected"].includes(callStatus) && (
            <Button
              onClick={endCall}
              variant="destructive"
              size="icon"
              className="w-16 h-16 rounded-full"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InAppCall;
