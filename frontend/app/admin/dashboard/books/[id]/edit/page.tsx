"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { fetchBook, updateBook } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { CATEGORIES } from "@/types";

interface EditFormState {
  title: string;
  author: string;
  description: string;
  price: string;
  category: string;
}

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [form, setForm] = useState<EditFormState>({
    title: "",
    author: "",
    description: "",
    price: "",
    category: "",
  });

  useEffect(() => {
    fetchBook(bookId)
      .then((book) => {
        setForm({
          title: book.title,
          author: book.author,
          description: book.description,
          price: String(book.price),
          category: book.category,
        });
      })
      .catch(() => toast.error("Failed to load book"))
      .finally(() => setFetching(false));
  }, [bookId]);

  const handleChange = (field: keyof EditFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAdminToken();
    if (!token) { router.push("/admin/login"); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      if (form.title) formData.append("title", form.title);
      if (form.author) formData.append("author", form.author);
      if (form.description) formData.append("description", form.description);
      if (form.price) formData.append("price", form.price);
      if (form.category) formData.append("category", form.category);
      if (coverFile) formData.append("cover_image", coverFile);
      if (pdfFile) formData.append("pdf_file", pdfFile);

      await updateBook(bookId, formData, token);
      toast.success("Book updated successfully!");
      router.push("/admin/dashboard/books");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update book");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold">Edit Book</h2>
          <p className="text-sm text-muted-foreground">Update book information</p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={(e) => handleChange("author", e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(val: string | null) => val && handleChange("category", val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="rounded-xl min-h-[120px] resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Replace Cover Image</Label>
                <label
                  htmlFor="new-cover"
                  className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {coverFile ? coverFile.name : "Upload new cover"}
                  </span>
                  <input
                    id="new-cover"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <div className="space-y-2">
                <Label>Replace PDF File</Label>
                <label
                  htmlFor="new-pdf"
                  className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {pdfFile ? pdfFile.name : "Upload new PDF"}
                  </span>
                  <input
                    id="new-pdf"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                id="save-book-btn"
                type="submit"
                disabled={loading}
                className="flex-1 brand-gradient text-white border-0 rounded-xl"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
