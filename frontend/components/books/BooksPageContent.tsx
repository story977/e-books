"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookCard } from "@/components/books/BookCard";
import { fetchBooks } from "@/lib/api";
import type { Book } from "@/types";
import { CATEGORIES } from "@/types";

export function BooksPageContent() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const loadBooks = useCallback(async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const data = await fetchBooks({
        page: p,
        limit: 12,
        category: category || undefined,
        search: search || undefined,
      });
      setBooks((prev) => (reset ? data.books : [...prev, ...data.books]));
      setTotal(data.total);
      setHasNext(data.has_next);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBooks(1, true);
  }, [loadBooks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleCategory = (cat: string) => {
    setCategory(prev => prev === cat ? "" : cat);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setCategory("");
  };

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="flex-1 flex items-center gap-2 border border-border rounded-full px-4 bg-background focus-within:ring-1 focus-within:ring-ring">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              id="book-search"
              type="text"
              placeholder="Search books, authors..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-transparent border-0 py-3 focus:outline-none focus:ring-0 text-sm placeholder:text-muted-foreground text-foreground"
            />
          </div>
          <Button type="submit" className="rounded-xl brand-gradient text-white border-0" id="search-submit">
            Search
          </Button>
        </form>
        {(search || category) && (
          <Button variant="outline" className="rounded-xl" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
              category === cat
                ? "brand-gradient text-white border-transparent glow-sm"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${total} books found`}
          {(search || category) && (
            <span>
              {search && ` for "${search}"`}
              {category && ` in ${category}`}
            </span>
          )}
        </p>
      </div>

      {/* Book Grid */}
      {!loading && books.length === 0 ? (
        <div className="text-center py-20">
          <BookEmptyState />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book, index) => (
            <BookCard key={book.id} book={book} priority={index < 4} />
          ))}
          {loading && [...Array(4)].map((_, i) => (
            <div key={`skel-${i}`} className="rounded-xl overflow-hidden">
              <div className="aspect-[3/4] animate-shimmer rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasNext && !loading && (
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl px-10"
            onClick={() => loadBooks(page + 1, false)}
            id="load-more-books"
          >
            Load More Books
          </Button>
        </div>
      )}
    </div>
  );
}

function BookEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 text-muted-foreground">
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
        <Search className="w-8 h-8" />
      </div>
      <div>
        <p className="font-medium text-foreground">No books found</p>
        <p className="text-sm mt-1">Try different search terms or categories</p>
      </div>
    </div>
  );
}
