import type { MetadataRoute } from "next";
import { fetchBooks } from "@/lib/api";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://yourebookstore.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/books`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic book pages
  let bookPages: MetadataRoute.Sitemap = [];
  try {
    const data = await fetchBooks({ limit: 200 });
    bookPages = data.books.map((book) => ({
      url: `${siteUrl}/books/${book.slug}`,
      lastModified: new Date(book.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Silently fail — sitemap works with just static pages
  }

  return [...staticPages, ...bookPages];
}
