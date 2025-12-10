import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  Headphones,
  Building
} from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+91 98765 43210", "+91 98765 43211"],
      description: "Mon-Sun, 8am - 10pm IST",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["support@helpr.in", "business@helpr.in"],
      description: "We reply within 24 hours",
    },
    {
      icon: MapPin,
      title: "Office",
      details: ["123 Tech Park, Sector 62", "Noida, UP 201301"],
      description: "Visit us Mon-Fri, 10am - 6pm",
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Monday - Sunday", "8:00 AM - 10:00 PM"],
      description: "We're available all week",
    },
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time for quick assistance.",
      action: "Start Chat",
    },
    {
      icon: Headphones,
      title: "Call Us",
      description: "Speak directly with our customer support executives.",
      action: "Call Now",
    },
    {
      icon: Building,
      title: "Partner With Us",
      description: "Interested in becoming a Helpr technician? Join our network.",
      action: "Apply Now",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Headphones className="h-4 w-4" />
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              We're Here to{" "}
              <span className="text-gradient">Help You</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Have questions or need assistance? Our team is ready to help you with anything you need.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-card">
              <h2 className="text-2xl font-bold text-foreground mb-2">Send us a Message</h2>
              <p className="text-muted-foreground mb-8">Fill out the form and we'll respond as soon as possible.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <Input
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject
                    </label>
                    <Input
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <Textarea
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-6 border border-border/50 hover:shadow-card transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-foreground">{detail}</p>
                      ))}
                      <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Other Ways to Reach Us
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the option that works best for you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {supportOptions.map((option, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-8 border border-border/50 text-center hover:shadow-card transition-all duration-300"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <option.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{option.title}</h3>
                <p className="text-muted-foreground mb-6">{option.description}</p>
                <Button variant="outline" className="w-full">
                  {option.action}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20">
        <div className="container">
          <div className="bg-card rounded-3xl overflow-hidden border border-border/50 shadow-card">
            <div className="aspect-[21/9] bg-muted flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Interactive map coming soon</p>
                <p className="text-sm text-muted-foreground">123 Tech Park, Sector 62, Noida, UP 201301</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-20 bg-gradient-hero">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Have More Questions?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Check out our frequently asked questions for quick answers to common queries.
          </p>
          <Button size="lg" variant="secondary" className="text-base px-8">
            View FAQs
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
