import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BooksPageContent } from "@/components/books/BooksPageContent";

// Force dynamic rendering — always fetch fresh books at request time
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Books",
  description:
    "Browse our complete collection of premium digital eBooks. Filter by category, search by title or author. Instant download after purchase.",
  openGraph: {
    title: "Browse All eBooks | eBook Store",
    description: "Find your next favourite digital book. Programming, Business, Self-Help and more.",
  },
};

export default function BooksPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20 min-h-screen">
        <div className="container-max section-padding">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3">All Books</h1>
            <p className="text-muted-foreground text-lg">
              Discover premium digital books for every reader
            </p>
          </div>
          <Suspense fallback={<BooksGridSkeleton />}>
            <BooksPageContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}

function BooksGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden">
          <div className="aspect-[3/4] animate-shimmer rounded-xl" />
          <div className="p-4 space-y-2">
            <div className="h-4 animate-shimmer rounded w-3/4" />
            <div className="h-3 animate-shimmer rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
