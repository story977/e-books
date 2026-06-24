"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught an error:", error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        
        <div className="max-w-md space-y-6">
          <p className="text-muted-foreground text-lg">
            We encountered an unexpected error while trying to load this page.
          </p>
          
          <div className="bg-muted/50 p-4 rounded-lg border border-border text-left">
            <p className="text-sm font-mono text-destructive break-words">
              {error.message || "Unknown Error occurred."}
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={reset} size="lg" className="rounded-xl px-8">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try again
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8" onClick={() => window.location.href = "/"}>
              Return Home
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
