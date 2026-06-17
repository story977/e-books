import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Shield,
  Star,
  User,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { fetchBook, fetchBooks } from "@/lib/api";
import type { Book } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const data = await fetchBooks({ limit: 50 });
    return data.books.map((book) => ({ slug: book.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const book = await fetchBook(slug);
    return {
      title: book.title,
      description: book.description.slice(0, 160),
      openGraph: {
        title: `${book.title} by ${book.author} | eBook Store`,
        description: book.description.slice(0, 160),
        images: [{ url: book.cover_url, width: 800, height: 1100, alt: book.title }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: book.title,
        description: book.description.slice(0, 160),
        images: [book.cover_url],
      },
    };
  } catch {
    return { title: "Book Not Found" };
  }
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;

  let book: Book;
  try {
    book = await fetchBook(slug);
  } catch {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(book.price);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Book",
        "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/books/${book.slug}#book`,
        name: book.title,
        author: { "@type": "Person", name: book.author },
        description: book.description,
        genre: book.category,
        image: book.cover_url,
        bookFormat: "EBook",
        inLanguage: "en",
        offers: {
          "@type": "Offer",
          price: book.price,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: "eBook Store" },
        },
      },
      {
        "@type": "Product",
        name: book.title,
        description: book.description,
        image: book.cover_url,
        brand: { "@type": "Brand", name: "eBook Store" },
        offers: {
          "@type": "Offer",
          price: book.price,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "24",
        },
      },
    ],
  };

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="pt-24 pb-20 min-h-screen">
        <div className="container-max section-padding">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/books" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              All Books
            </Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">{book.title}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Book Cover */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl glow-sm max-w-sm mx-auto lg:mx-0">
                  <Image
                    src={book.cover_url}
                    alt={`${book.title} by ${book.author} — eBook cover`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Purchase Card */}
                <div className="mt-6 p-6 rounded-2xl border border-border/60 bg-card space-y-4">
                  <div className="text-3xl font-bold text-primary">
                    {formattedPrice}
                  </div>

                  <div className="flex gap-1 items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">4.8 (24 reviews)</span>
                  </div>

                  <Link
                    href={`/checkout?book_id=${book.id}&title=${encodeURIComponent(book.title)}&price=${book.price}&cover=${encodeURIComponent(book.cover_url)}`}
                    className="block"
                  >
                    <Button
                      id="buy-now-btn"
                      className="w-full brand-gradient text-white border-0 rounded-xl glow py-6 text-base font-semibold"
                      size="lg"
                    >
                      <ShoppingCartIcon className="w-5 h-5 mr-2" />
                      Buy Now — {formattedPrice}
                    </Button>
                  </Link>

                  <div className="space-y-2.5 pt-2">
                    {[
                      { icon: Download, text: "Instant PDF download" },
                      { icon: Shield, text: "Secure Cashfree payment" },
                      { icon: BookOpen, text: "Read on any device" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Book Details */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="rounded-lg">
                  <Tag className="w-3 h-3 mr-1" />
                  {book.category}
                </Badge>
                <Badge variant="outline" className="rounded-lg">
                  eBook · PDF
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
                {book.title}
              </h1>

              <div className="flex items-center gap-2 text-muted-foreground mb-8">
                <User className="w-4 h-4" />
                <span>by <span className="font-medium text-foreground">{book.author}</span></span>
              </div>

              <Separator className="mb-8" />

              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-4">About this Book</h2>
                <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-wrap">
                  {book.description}
                </p>
              </div>

              <Separator className="my-8" />

              {/* Book Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Format", value: "PDF" },
                  { label: "Category", value: book.category },
                  { label: "Language", value: "English" },
                  { label: "Author", value: book.author },
                  { label: "Published", value: new Date(book.created_at).getFullYear().toString() },
                  { label: "Delivery", value: "Instant Download" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/40 rounded-xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">{label}</div>
                    <div className="font-medium text-sm">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
