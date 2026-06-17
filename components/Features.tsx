import { Link2, Bot, Volume2, TrendingUp } from "lucide-react";

const features = [
  {
    icon: <Link2 className="w-6 h-6 text-primary" />,
    title: "1-Click URL Scraping",
    description: "Just paste your product link. Our system automatically extracts the title, description, and key features to understand your product."
  },
  {
    icon: <Bot className="w-6 h-6 text-primary" />,
    title: "AI-Powered Scripts",
    description: "Leverage advanced AI to generate hooks, body copy, and CTAs that are proven to drive engagement and sales on TikTok."
  },
  {
    icon: <Volume2 className="w-6 h-6 text-primary" />,
    title: "Premium Voiceovers",
    description: "Convert your generated script into high-quality, human-sounding voiceovers ready to be added to your video editor."
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-primary" />,
    title: "Viral Frameworks",
    description: "Choose from multiple proven frameworks (e.g., Problem-Agitate-Solve) tailored specifically for short-form video platforms."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to go viral</h2>
          <p className="text-muted-foreground text-lg">
            Our platform provides end-to-end tools to turn any boring product page into an engaging video script.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-card p-6 rounded-2xl border border-border hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-lg group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
