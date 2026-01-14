import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Headphones,
  MessageCircle,
  Phone,
  Mail,
  HelpCircle,
  X,
  Send,
  Clock,
  CheckCircle,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const faqs = [
  {
    question: "How do I track my booking?",
    answer: "Go to 'My Bookings' in the menu to see real-time status and technician location for all your bookings."
  },
  {
    question: "Can I cancel or reschedule?",
    answer: "Yes! You can cancel or reschedule from 'My Bookings' up to 2 hours before the scheduled time for a full refund."
  },
  {
    question: "What if the technician doesn't arrive?",
    answer: "Contact us immediately through this widget. We'll assign a new technician or provide a full refund within 24 hours."
  },
  {
    question: "How are technicians verified?",
    answer: "All technicians undergo background checks, skill assessments, and KYC verification before joining our platform."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept all major credit/debit cards, UPI, net banking, and cash on delivery for select services."
  }
];

export const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'chat' | 'faq'>('main');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'support'; text: string }[]>([
    { role: 'support', text: "Hi! 👋 How can we help you today? Our team is available 24/7." }
  ]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', text: message }]);
    setMessage('');
    
    // Simulate support response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'support', 
        text: "Thanks for reaching out! A support agent will respond shortly. For urgent issues, call us at 1800-XXX-XXXX." 
      }]);
    }, 1000);
  };

  const handleEmailSubmit = () => {
    if (!email.trim() || !message.trim()) {
      toast({
        title: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Message Sent!",
      description: "We'll respond within 2 hours."
    });
    setEmail('');
    setMessage('');
    setActiveTab('main');
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/911800XXXXXX?text=Hi, I need help with my booking', '_blank');
  };

  const callSupport = () => {
    window.location.href = 'tel:1800XXXXXX';
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'bg-destructive rotate-90' : 'bg-primary hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <Headphones className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
      </button>

      {/* Support Panel */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[500px] shadow-2xl border-2 animate-in slide-in-from-bottom-5">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                <CardTitle className="text-lg">24/7 Support</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-100 border-green-400/50">
                <span className="h-2 w-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                Online
              </Badge>
            </div>
            <p className="text-sm text-primary-foreground/80">We're here to help, anytime!</p>
          </CardHeader>
          
          <CardContent className="p-4 max-h-[380px] overflow-y-auto">
            {activeTab === 'main' && (
              <div className="space-y-3">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-4 hover:bg-primary/5 hover:border-primary"
                    onClick={() => setActiveTab('chat')}
                  >
                    <MessageCircle className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs">Live Chat</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-4 hover:bg-green-500/5 hover:border-green-500"
                    onClick={openWhatsApp}
                  >
                    <svg className="h-5 w-5 mb-1 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="text-xs">WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-4 hover:bg-blue-500/5 hover:border-blue-500"
                    onClick={callSupport}
                  >
                    <Phone className="h-5 w-5 mb-1 text-blue-600" />
                    <span className="text-xs">Call Us</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-4 hover:bg-orange-500/5 hover:border-orange-500"
                    onClick={() => setActiveTab('faq')}
                  >
                    <HelpCircle className="h-5 w-5 mb-1 text-orange-600" />
                    <span className="text-xs">FAQs</span>
                  </Button>
                </div>

                {/* Response Time */}
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">Avg. response time:</span>
                    <span className="text-green-600 ml-1">Under 2 minutes</span>
                  </div>
                </div>

                {/* Email Form */}
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm font-medium">Send us a message</p>
                  <Input
                    placeholder="Your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Textarea
                    placeholder="Describe your issue..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button className="w-full" onClick={handleEmailSubmit}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('main')}
                  className="mb-2"
                >
                  ← Back
                </Button>
                
                {/* Chat Messages */}
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2 pt-2 border-t">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('main')}
                  className="mb-2"
                >
                  ← Back
                </Button>
                
                <p className="text-sm font-medium mb-3">Frequently Asked Questions</p>
                
                {faqs.map((faq, index) => (
                  <Collapsible
                    key={index}
                    open={expandedFaq === index}
                    onOpenChange={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left text-sm font-medium bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <span className="pr-2">{faq.question}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-3 py-2 text-sm text-muted-foreground">
                      {faq.answer}
                    </CollapsibleContent>
                  </Collapsible>
                ))}

                <div className="pt-3 border-t mt-3">
                  <p className="text-xs text-muted-foreground text-center">
                    Can't find what you're looking for?{' '}
                    <button 
                      onClick={() => setActiveTab('chat')}
                      className="text-primary hover:underline"
                    >
                      Chat with us
                    </button>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default SupportWidget;
