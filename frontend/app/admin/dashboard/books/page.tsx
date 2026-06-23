"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchBooks, deleteBook } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import type { Book } from "@/types";

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await fetchBooks({ limit: 50 });
      setBooks(data.books);
    } catch (_e) {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadBooks(); }, []);

  const handleDelete = async (id: string, title: string) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await deleteBook(id, token);
      toast.success(`"${title}" deleted`);
      setBooks((b) => b.filter((book) => book.id !== id));
    } catch {
      toast.error("Failed to delete book");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Books</h2>
          <p className="text-muted-foreground text-sm">{books.length} books in your store</p>
        </div>
        <Link href="/admin/dashboard/books/new">
          <Button id="add-book-btn" className="brand-gradient text-white border-0 rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 p-4 flex gap-4">
              <div className="w-16 h-20 animate-shimmer rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 animate-shimmer rounded w-3/4" />
                <div className="h-3 animate-shimmer rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No books yet</p>
          <p className="text-sm mb-6">Add your first eBook to get started</p>
          <Link href="/admin/dashboard/books/new">
            <Button className="brand-gradient text-white border-0 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add First Book
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="rounded-xl border border-border/60 bg-card p-4 flex gap-4 card-hover"
            >
              <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                  {book.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {book.author}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs rounded-md">
                    {book.category}
                  </Badge>
                  <span className="text-sm font-bold text-primary">
                    ₹{book.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/dashboard/books/${book.id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg h-7 px-2.5 text-xs"
                      id={`edit-book-${book.id}`}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-lg h-7 px-2.5 text-xs"
                          id={`delete-book-${book.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Book</AlertDialogTitle>
                        <AlertDialogDescription>
                          Delete &ldquo;{book.title}&rdquo;? This will also remove
                          the cover and PDF from Cloudinary. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(book.id, book.title)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
