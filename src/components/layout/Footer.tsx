import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Twitter, Instagram, Linkedin } from "lucide-react";
import helprLogo from "@/assets/helpr-logo-orange.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const services = [
    { name: "Electrical", href: "/services/electrical" },
    { name: "Plumbing", href: "/services/plumbing" },
    { name: "AC Service", href: "/services/ac" },
    { name: "Cleaning", href: "/services/cleaning" },
    { name: "Carpentry", href: "/services/carpentry" },
    { name: "Appliance Repair", href: "/services/appliance" },
  ];

  const company = [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Partner with us", href: "/technician" },
    { name: "Blog", href: "/blog" },
    { name: "Press", href: "/press" },
  ];

  const support = [
    { name: "Help Center", href: "/help" },
    { name: "Safety", href: "/safety" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund" },
  ];

  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      {/* Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img src={helprLogo} alt="" className="w-[600px] h-auto opacity-[0.06] blur-[1px]" />
      </div>
      <div className="container py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-1 mb-6">
              <img src={helprLogo} alt="HelpR Logo" className="h-14 w-auto logo-orange brightness-200" />
            </Link>
            <p className="text-background/70 mb-6 max-w-sm">
              Your trusted partner for all home services. Book verified professionals for electrical, plumbing, cleaning, and more.
            </p>
            <div className="space-y-3">
              <a href="tel:+918919312594" className="flex items-center gap-3 text-background/70 hover:text-background transition-colors">
                <Phone className="h-5 w-5" />
                <span>+91 89193 12594</span>
              </a>
              <a href="mailto:helprserv@gmail.com" className="flex items-center gap-3 text-background/70 hover:text-background transition-colors">
                <Mail className="h-5 w-5" />
                <span>helprserv@gmail.com</span>
              </a>
              <div className="flex items-start gap-3 text-background/70">
                <MapPin className="h-5 w-5 mt-0.5" />
                <span>Giddalur, Markapuram Dist,<br />Andhra Pradesh 523357</span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-3">
              {services.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-3">
              {support.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            © {currentYear} Helpr. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/syedfaru_1819" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://x.com/Faru_1206" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://www.linkedin.com/in/syed-farooq-b6943a33b" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
