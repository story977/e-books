import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Book } from "@/types";

interface BookCardProps {
  book: Book;
  priority?: boolean;
}

export function BookCard({ book, priority = false }: BookCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(book.price);

  return (
    <Card className="group card-hover overflow-hidden border-border/60 bg-card">
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Image
          src={book.cover_url}
          alt={`${book.title} by ${book.author}`}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <Link href={`/books/${book.slug}`} className="w-full">
            <Button
              className="w-full brand-gradient text-white border-0 rounded-xl text-sm glow-sm"
              size="sm"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Buy Now
            </Button>
          </Link>
        </div>
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="text-xs font-medium bg-background/90 backdrop-blur-sm"
          >
            {book.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <Link href={`/books/${book.slug}`} className="block group/title">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover/title:text-primary transition-colors mb-1">
            {book.title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-3">by {book.author}</p>

        <div className="flex items-center justify-between">
          <span className="font-bold text-primary text-base">{formattedPrice}</span>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
