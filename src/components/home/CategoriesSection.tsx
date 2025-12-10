import { Link } from "react-router-dom";
import { 
  Zap, 
  Droplets, 
  Wind, 
  Sparkles, 
  Hammer, 
  Wrench,
  Paintbrush,
  Bug
} from "lucide-react";

const categories = [
  {
    id: "electrical",
    name: "Electrical",
    description: "Wiring, repairs & installations",
    icon: Zap,
    color: "bg-amber-500/10 text-amber-600",
    href: "/services/electrical",
  },
  {
    id: "plumbing",
    name: "Plumbing",
    description: "Pipes, leaks & fixtures",
    icon: Droplets,
    color: "bg-blue-500/10 text-blue-600",
    href: "/services/plumbing",
  },
  {
    id: "ac",
    name: "AC Service",
    description: "Repair, gas & maintenance",
    icon: Wind,
    color: "bg-cyan-500/10 text-cyan-600",
    href: "/services/ac",
  },
  {
    id: "cleaning",
    name: "Cleaning",
    description: "Home & deep cleaning",
    icon: Sparkles,
    color: "bg-green-500/10 text-green-600",
    href: "/services/cleaning",
  },
  {
    id: "carpentry",
    name: "Carpentry",
    description: "Furniture & woodwork",
    icon: Hammer,
    color: "bg-orange-500/10 text-orange-600",
    href: "/services/carpentry",
  },
  {
    id: "appliance",
    name: "Appliance Repair",
    description: "TV, washing machine & more",
    icon: Wrench,
    color: "bg-purple-500/10 text-purple-600",
    href: "/services/appliance",
  },
  {
    id: "painting",
    name: "Painting",
    description: "Interior & exterior painting",
    icon: Paintbrush,
    color: "bg-pink-500/10 text-pink-600",
    href: "/services/painting",
  },
  {
    id: "pest-control",
    name: "Pest Control",
    description: "Termites, cockroaches & more",
    icon: Bug,
    color: "bg-red-500/10 text-red-600",
    href: "/services/pest-control",
  },
];

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from a wide range of home services. All our professionals are 
            verified, trained, and background-checked.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={category.href}
              className="group relative bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${category.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <category.icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
              <div className="absolute inset-0 rounded-2xl bg-gradient-hero opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
