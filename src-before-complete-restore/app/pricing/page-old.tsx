import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, X, Sparkles, Zap, Building2 } from "lucide-react"

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for exploring Vibelux",
    icon: Sparkles,
    color: "from-gray-400 to-gray-600",
    features: [
      { name: "50 fixture limit", included: true },
      { name: "Basic PPFD calculator", included: true },
      { name: "Simple DLI calculator", included: true },
      { name: "2 fixture comparisons", included: true },
      { name: "1 saved project", included: true },
      { name: "Community support", included: true },
      { name: "Weather integration", included: false },
      { name: "AI assistant", included: false },
      { name: "Professional reports", included: false },
      { name: "API access", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    description: "Everything you need for professional projects",
    icon: Zap,
    color: "from-primary-dark to-secondary",
    features: [
      { name: "2,400+ DLC fixtures", included: true },
      { name: "All calculators & tools", included: true },
      { name: "Weather integration", included: true },
      { name: "AI assistant (1,000 queries/mo)", included: true },
      { name: "Professional reports", included: true },
      { name: "10 saved projects", included: true },
      { name: "Priority email support", included: true },
      { name: "API access (limited)", included: true },
      { name: "Export to CAD", included: true },
      { name: "White-label options", included: false },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$299",
    period: "/month",
    description: "Advanced features for large organizations",
    icon: Building2,
    color: "from-purple-600 to-indigo-600",
    features: [
      { name: "Everything in Professional", included: true },
      { name: "Plant diagnosis AI", included: true },
      { name: "Environmental impact studio", included: true },
      { name: "Investment-grade analysis", included: true },
      { name: "White-label options", included: true },
      { name: "Unlimited projects", included: true },
      { name: "Dedicated support", included: true },
      { name: "Full API access", included: true },
      { name: "Team collaboration", included: true },
      { name: "Custom training", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-green-50"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Simple, Transparent
              <span className="text-gradient"> Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose the perfect plan for your horticultural lighting projects. 
              All plans include our core features with no hidden fees.
            </p>
            <div className="inline-flex items-center bg-accent/50 rounded-full px-6 py-3">
              <span className="text-sm font-medium">
                🎉 Save 20% with annual billing
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl ${
                  tier.popular
                    ? "border-2 border-primary shadow-2xl scale-105"
                    : "border border-gray-200"
                } bg-white overflow-hidden`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium px-4 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                
                <div className="p-8">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${tier.color} mb-4`}>
                    <tier.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-muted-foreground mb-6">{tier.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground">{tier.period}</span>
                    )}
                  </div>
                  
                  <Link href={tier.name === "Enterprise" ? "/contact" : "/sign-up"}>
                    <Button 
                      className={`w-full mb-8 ${
                        tier.popular ? "btn-gradient" : ""
                      }`}
                      variant={tier.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                  
                  <div className="space-y-4">
                    {tier.features.map((feature) => (
                      <div key={feature.name} className="flex items-start space-x-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included ? "text-foreground" : "text-gray-400"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Can I change plans anytime?
                </h3>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any differences.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards, ACH transfers for Enterprise accounts, and can arrange purchase orders for qualifying organizations.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-muted-foreground">
                  Yes! Professional and Enterprise plans include a 14-day free trial. No credit card required to start.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Do you offer educational discounts?
                </h3>
                <p className="text-muted-foreground">
                  Yes, we offer 50% discounts for accredited educational institutions and non-profit organizations. Contact us for details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Lighting Design Process?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust Vibelux for their projects
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="btn-gradient px-8">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8">
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}