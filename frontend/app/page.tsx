import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Separator } from "@/components/ui/separator";
import { BookCard } from "@/components/books/BookCard";
import { fetchBooks } from "@/lib/api";

export const metadata: Metadata = {
  title: "eBook Store — Premium Digital Books",
  description:
    "Discover and instantly download premium digital eBooks on programming, self-help, business, science and more. Secure payment via Cashfree. Instant PDF delivery.",
};

const faqs = [
  {
    q: "How do I receive my eBook after purchase?",
    a: "After successful payment, you'll get a secure download link immediately on the success page. The link is valid for 10 minutes, so download right away.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI, credit/debit cards, net banking, and wallets via Cashfree — India's leading payment gateway.",
  },
  {
    q: "What format are the eBooks in?",
    a: "All our eBooks are in PDF format, readable on any device — phone, tablet, laptop, or e-reader.",
  },
  {
    q: "Can I share the download link with others?",
    a: "No. Download links are unique to your order and expire after 10 minutes for security. Sharing links won't work.",
  },
  {
    q: "What if the download link expires?",
    a: "Contact us at srik13225@gmail.com with your Name, mobile number, order details and we'll issue a new download link.",
  },
  {
    q: "Is there a refund policy?",
    a: "Due to the digital nature of eBooks, we generally don't offer refunds. However, if you face technical issues, contact us and we'll make it right.",
  },
];

// Force dynamic rendering — always fetch fresh books at request time, never statically bake empty data
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch featured books (latest 8)
  let featuredBooks: import("@/types").Book[] = [];
  try {
    const data = await fetchBooks({ limit: 8, sort: "created_at", order: "desc" });
    featuredBooks = data.books;
  } catch {
    featuredBooks = [];
  }

  return (
    <>
      <Header />
      <main>
        {/* ========================================================
            HERO SECTION
           ======================================================== */}
        <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
          <div className="container-max section-padding relative z-10 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="text-foreground animate-fade-in-up">
                <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                   Your Digital Story Awaits
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Discover
                  <span className="block text-gradient bg-gradient-to-r from-slate-100 via-white to-slate-300 bg-clip-text text-transparent">
                    Premium eBooks
                  </span>
                  Instantly
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                  Browse our curated collection of premium storybooks. Pay securely,
                  download instantly, and start reading today. No subscriptions,
                  no hassle — just great books.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/books">
                    <Button
                      size="lg"
                      className="rounded-xl brand-gradient text-white border-0 glow px-8"
                    >
                      Browse Books
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-xl border-border text-foreground hover:bg-muted bg-transparent px-8"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Hero visual */}
              <div className="relative hidden lg:block">
                <div className="relative w-full h-[500px]">
                  {/* Floating book covers */}
                  {featuredBooks.slice(0, 3).map((book, i) => (
                    <div
                      key={book.id}
                      className="absolute rounded-2xl overflow-hidden shadow-2xl glow transition-transform hover:scale-105"
                      style={{
                        width: i === 0 ? "200px" : "160px",
                        height: i === 0 ? "280px" : "220px",
                        top: i === 0 ? "50px" : i === 1 ? "20px" : "200px",
                        left: i === 0 ? "50px" : i === 1 ? "280px" : "300px",
                        zIndex: i === 0 ? 3 : 2,
                        transform: `rotate(${i === 0 ? "-5deg" : i === 1 ? "8deg" : "-3deg"})`,
                      }}
                    >
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        fill
                        sizes="192px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {/* Placeholder if no books */}
                  {featuredBooks.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-64 rounded-2xl bg-primary/20 glass border border-primary/20 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-primary/60" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        <Separator className="my-10" />
      
        {/* ========================================================
            FEATURED BOOKS
           ======================================================== */}
        {featuredBooks.length > 0 && (
          <>
            <section className="py-16 bg-muted/30">
              <div className="container-max section-padding">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Featured Books</h2>
                    <p className="text-muted-foreground">
                      Our most popular digital books this month
                    </p>
                  </div>
                  <Link href="/books">
                    <Button variant="outline" className="rounded-xl">
                      View All
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {featuredBooks.map((book, index) => (
                    <BookCard key={book.id} book={book} priority={index < 4} />
                  ))}
                </div>
              </div>
            </section>
            <Separator className="my-10" />
          </>
        )}

        {/* ========================================================
            FEATURES
           ======================================================== */}
        {/* <section className="py-20 container-max section-padding">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Why Choose eBook Store?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We make buying and reading digital books effortless and secure
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card
                key={title}
                className="group card-hover border-border/60 text-center p-2"
              >
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-5 glow-sm group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div> 
        </section> 

        {/* ========================================================
            TESTIMONIALS
           ======================================================== */}
        {/* <section className="py-20 bg-muted/30">
          <div className="container-max section-padding">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold mb-3">What Readers Say</h2>
              <p className="text-muted-foreground">
                Join thousands of happy readers
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <Card key={i} className="card-hover border-border/60">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, j) => (
                        <Star
                          key={j}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-5">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm">
                        {t.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{t.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>  */}

        {/* ========================================================
            FAQ
           ======================================================== */}
        <section className="py-20 container-max section-padding">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Everything you need to know before purchasing
              </p>
            </div>
            <Accordion className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-border/60 rounded-xl px-6 bg-card"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <Separator className="my-10" />

        {/* ========================================================
            CTA BANNER
           ======================================================== */}
        <section className="py-20 relative overflow-hidden">
          <div className="container-max section-padding text-center text-foreground relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Start Reading?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Browse our entire collection and find your next favourite book.
            </p>
            <Link href="/books">
              <Button
                size="lg"
                className="rounded-xl brand-gradient text-white border-0 glow px-10 text-base"
              >
                Explore All Books
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
