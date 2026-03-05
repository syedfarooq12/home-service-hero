import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-background rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-background rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container relative">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to experience hassle-free home services?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Join 50,000+ customers who trust HelpR. Book your first service today 
            and get ₹100 off on your order!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/services">
              <Button 
                size="xl" 
                className="bg-background text-primary hover:bg-background/90"
              >
                Book a Service
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="tel:+918919312594">
              <Button 
                size="xl" 
                variant="outline" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Phone className="h-5 w-5" />
                Call Us Now
              </Button>
            </a>
          </div>

          <p className="mt-8 text-sm text-primary-foreground/60">
            Use code <span className="font-semibold text-primary-foreground">FIRST100</span> at checkout
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
