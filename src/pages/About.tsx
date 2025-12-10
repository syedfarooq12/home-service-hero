import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Clock, Award, Users, Heart, Target, CheckCircle } from "lucide-react";

const About = () => {
  const stats = [
    { number: "50,000+", label: "Happy Customers" },
    { number: "2,000+", label: "Verified Technicians" },
    { number: "100,000+", label: "Services Completed" },
    { number: "4.8", label: "Average Rating" },
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Every technician is background verified and trained to ensure your safety and peace of mind.",
    },
    {
      icon: Clock,
      title: "On-Time Service",
      description: "We value your time. Our technicians arrive within the promised window, every single time.",
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description: "We stand behind our work with a satisfaction guarantee. Not happy? We'll make it right.",
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our priority. We go above and beyond to exceed your expectations.",
    },
  ];

  const team = [
    { name: "Rahul Sharma", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" },
    { name: "Priya Patel", role: "COO", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face" },
    { name: "Amit Kumar", role: "CTO", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face" },
    { name: "Neha Singh", role: "Head of Operations", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face" },
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
              <Target className="h-4 w-4" />
              Our Story
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              Making Home Services{" "}
              <span className="text-gradient">Simple & Reliable</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Helpr was founded with a simple mission: to provide fast, reliable, and affordable home services to every household in India.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                We believe everyone deserves access to quality home services without the hassle. Whether it's a leaky faucet at midnight or a full home deep clean, Helpr connects you with skilled professionals in minutes.
              </p>
              <ul className="space-y-4">
                {[
                  "Verified and trained professionals",
                  "Transparent pricing with no hidden costs",
                  "Service guarantee on every booking",
                  "24/7 customer support",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-elegant">
                <img
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=600&fit=crop"
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-6 shadow-card border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">2,000+</div>
                    <div className="text-sm text-muted-foreground">Expert Technicians</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do at Helpr.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:shadow-card transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Leadership
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The passionate team behind Helpr's mission to transform home services.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-4 inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden mx-auto ring-4 ring-border group-hover:ring-primary/50 transition-all duration-300">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Experience the Helpr Difference?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who trust Helpr for all their home service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services">
              <Button size="lg" variant="secondary" className="text-base px-8">
                Book a Service
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
