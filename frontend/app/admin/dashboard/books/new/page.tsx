"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, FileText, Image as ImageIcon } from "lucide-react";
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
import { createBook } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { CATEGORIES } from "@/types";

interface NewBookForm {
  title: string;
  author: string;
  description: string;
  price: string;
  category: string;
}

export default function NewBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [form, setForm] = useState<NewBookForm>({
    title: "",
    author: "",
    description: "",
    price: "",
    category: "",
  });
  const [errors, setErrors] = useState<Partial<NewBookForm & { cover: string; pdf: string }>>({});

  const handleChange = (field: keyof NewBookForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.author.trim()) newErrors.author = "Author is required";
    if (!form.description.trim() || form.description.length < 10)
      newErrors.description = "Description must be at least 10 characters";
    if (!form.price || parseFloat(form.price) <= 0)
      newErrors.price = "Price must be a positive number";
    if (!form.category) newErrors.category = "Category is required";
    if (!coverFile) newErrors.cover = "Cover image is required";
    if (!pdfFile) newErrors.pdf = "PDF file is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const token = getAdminToken();
    if (!token) { router.push("/admin/login"); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("author", form.author);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("cover_image", coverFile!);
      formData.append("pdf_file", pdfFile!);

      await createBook(formData, token);
      toast.success("Book added successfully!");
      router.push("/admin/dashboard/books");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold">Add New Book</h2>
          <p className="text-sm text-muted-foreground">
            Upload a new eBook to your store
          </p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">Book Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="e.g. Python for Beginners"
                  className="rounded-xl"
                />
                {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={(e) => handleChange("author", e.target.value)}
                  placeholder="e.g. John Doe"
                  className="rounded-xl"
                />
                {errors.author && <p className="text-destructive text-xs">{errors.author}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="299"
                  className="rounded-xl"
                />
                {errors.price && <p className="text-destructive text-xs">{errors.price}</p>}
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(val: string | null) => val && handleChange("category", val)}
                >
                  <SelectTrigger id="category" className="rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-destructive text-xs">{errors.category}</p>}
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe what readers will learn from this book..."
                  className="rounded-xl min-h-[120px] resize-none"
                />
                {errors.description && <p className="text-destructive text-xs">{errors.description}</p>}
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cover Image * (JPEG/PNG/WebP, max 5MB)</Label>
                <label
                  htmlFor="cover_image"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {coverFile ? (
                    <div className="text-center px-2">
                      <ImageIcon className="w-8 h-8 text-primary mx-auto mb-1" />
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {coverFile.name}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                      <span className="text-xs text-muted-foreground">Click to upload cover</span>
                    </div>
                  )}
                  <input
                    id="cover_image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  />
                </label>
                {errors.cover && <p className="text-destructive text-xs">{errors.cover}</p>}
              </div>

              <div className="space-y-2">
                <Label>PDF File * (max 100MB)</Label>
                <label
                  htmlFor="pdf_file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {pdfFile ? (
                    <div className="text-center px-2">
                      <FileText className="w-8 h-8 text-primary mx-auto mb-1" />
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {pdfFile.name}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                      <span className="text-xs text-muted-foreground">Click to upload PDF</span>
                    </div>
                  )}
                  <input
                    id="pdf_file"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                </label>
                {errors.pdf && <p className="text-destructive text-xs">{errors.pdf}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                id="submit-book-btn"
                type="submit"
                disabled={loading}
                className="flex-1 brand-gradient text-white border-0 rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Add Book
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
