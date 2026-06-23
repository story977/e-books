import { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Shield,
  Zap,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about eBook Store — our mission to make premium digital knowledge accessible to everyone in India.",
};

const values = [
  {
    icon: Sparkles, // Changed from BookOpen to match a magical/fiction vibe
    title: "Unforgettable Tales",
    desc: "We believe great stories offer the ultimate escape. Our curated collection ensures breathtaking worlds and gripping plots.",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    desc: "Your data is protected with bank-grade encryption. Buy your next obsession with complete peace of mind.",
  },
  {
    icon: Zap,
    title: "Instant Escape",
    desc: "No waiting for shipping. Purchase your story and dive into a new world within seconds.",
  },
  {
    icon: Heart,
    title: "By Dreamers, For Dreamers",
    desc: "Built by passionate fiction lovers. We are dedicated to creating the ultimate paradise for binge-readers.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20 min-h-screen">
        {/* Hero */}
        <section className="py-20 text-foreground text-center">
          <div className="container-max section-padding">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
              Kutty Story
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              About StorytimewithSri
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              We started [StorytimewithSri] with a simple mission: to make unforgettable stories affordable and accessible to every dreamer in India. No subscriptions. No hidden fees. Just pure escape, one great book at a time.
            </p>
          </div>
        </section>

        <Separator className="my-10" />
  

        {/* Mission */}
        <section className="container-max section-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Why We Built This
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Finding great fictional stories online in India was frustrating — expensive monthly subscriptions, endless pop-ups, or platforms cluttered with textbooks and self-help guides. We wanted a place dedicated entirely to the magic of storytelling, without the hassle.
                </p>
                <p>
                  StorytimewithSri is a single-vendor platform where you can browse, buy, and instantly dive into gripping fictional worlds. No account creation required, no monthly subscriptions — just pay and read.
                </p>
                <p>
                  Every story in our collection is carefully curated to give you the ultimate literary escape. The moment you purchase, you get a secure, instant PDF download to start your next binge-reading session right away.
                </p>
              </div>
              <Link href="/books" className="inline-block mt-8">
                <Button className="brand-gradient text-white border-0 rounded-xl">
                  Explore Our Books
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: "100%", label: "Pure Fiction" },       // Emphasizes your niche
                { val: "₹99", label: "Flat Rate per Story" }, // Clear, upfront pricing
                { val: "0", label: "Subscription Fees" },     // Huge selling point for readers
                { val: "Instant", label: "Digital Download" }, // Highlighting convenience
              ].map(({ val, label }) => (
                <Card key={label} className="border-border/60 text-center card-hover">
                  <CardContent className="py-8">
                    <div className="text-3xl font-bold text-gradient mb-2">{val}</div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator className="my-10" />
        {/* Values */}
        <section className="bg-muted/30 py-20">
          <div className="container-max section-padding">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold mb-3">Our Core Values</h2>
              <p className="text-muted-foreground">What fuels our love for storytelling</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="border-border/60 text-center card-hover">
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-5 glow-sm">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator className="my-10" />

        {/* CTA */}
        <section className="container-max section-padding text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Reading?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Browse our curated collection of premium digital books.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/books">
              <Button size="lg" className="brand-gradient text-white border-0 rounded-xl glow px-8">
                Browse Books
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="rounded-xl px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
