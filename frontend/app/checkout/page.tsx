"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Shield, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createOrder } from "@/lib/api";

const schema = z.object({
  buyer_name: z.string().min(2, "Name must be at least 2 characters"),
  buyer_email: z.string().email("Enter a valid email address"),
  buyer_phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, "Enter a valid phone number (10-15 digits)"),
});

type FormData = z.infer<typeof schema>;

declare global {
  interface Window {
    Cashfree: (config: { mode: string }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: string;
      }) => Promise<{ error?: { message: string }; redirect?: boolean }>;
    };
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book_id") || "";
  const bookTitle = searchParams.get("title") || "Unknown Book";
  const bookPrice = parseFloat(searchParams.get("price") || "0");
  const bookCover = searchParams.get("cover") || "";

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!bookId) {
      toast.error("No book selected");
      router.push("/books");
    }
  }, [bookId, router]);

  // Load Cashfree SDK v3 — returns a Promise that resolves when SDK is ready
  const loadCashfreeSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Already loaded
      if ((window as any).Cashfree) {
        resolve();
        return;
      }
      // Script already injected — wait for it
      const existing = document.getElementById("cashfree-sdk");
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Cashfree SDK failed to load")));
        return;
      }
      // Inject script fresh
      const script = document.createElement("script");
      script.id = "cashfree-sdk";
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Cashfree SDK failed to load. Check your connection."));
      document.body.appendChild(script);
    });
  };

  const onSubmit = async (data: FormData) => {
    if (!bookId) return;
    setLoading(true);

    try {
      const orderResult = await createOrder({
        book_id: bookId,
        buyer_name: data.buyer_name,
        buyer_email: data.buyer_email,
        buyer_phone: data.buyer_phone,
      });

      // Wait for Cashfree SDK to be fully loaded before proceeding
      await loadCashfreeSDK();

      const CashfreeSDK = (window as any).Cashfree;
      if (!CashfreeSDK) {
        throw new Error("Cashfree SDK not available. Please refresh the page.");
      }

      const env = process.env.NEXT_PUBLIC_CASHFREE_ENV || "sandbox";
      const cashfree = CashfreeSDK({ mode: env });

      const result = await cashfree.checkout({
        paymentSessionId: orderResult.payment_session_id,
        redirectTarget: "_self",
      });

      if (result?.error) {
        throw new Error(result.error.message || "Payment failed. Please try again.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to initiate payment");
      setLoading(false);
    }
  };


  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(bookPrice);

  return (
      <main className="pt-24 pb-20 min-h-screen">
        <div className="container-max section-padding max-w-5xl">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to book
          </button>

          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Your Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    id="checkout-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="buyer_name">Full Name *</Label>
                      <Input
                        id="buyer_name"
                        {...register("buyer_name")}
                        placeholder="Ravi Kumar"
                        className="rounded-xl"
                      />
                      {errors.buyer_name && (
                        <p className="text-destructive text-xs">{errors.buyer_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyer_email">Email Address *</Label>
                      <Input
                        id="buyer_email"
                        type="email"
                        {...register("buyer_email")}
                        placeholder="ravi@example.com"
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your download link will be shown on the next page
                      </p>
                      {errors.buyer_email && (
                        <p className="text-destructive text-xs">{errors.buyer_email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyer_phone">Phone Number *</Label>
                      <Input
                        id="buyer_phone"
                        type="tel"
                        {...register("buyer_phone")}
                        placeholder="9876543210"
                        className="rounded-xl"
                      />
                      {errors.buyer_phone && (
                        <p className="text-destructive text-xs">{errors.buyer_phone.message}</p>
                      )}
                    </div>

                    {/* Trust badges */}
                    <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-xl">
                      <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Secured by Cashfree</span>
                        {" "}— 256-bit SSL encrypted. Your data is safe.
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <Card className="border-border/60 sticky top-28">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Book preview */}
                  <div className="flex gap-4">
                    {bookCover && (
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={decodeURIComponent(bookCover)}
                          alt={bookTitle}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{bookTitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF eBook</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formattedPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span>Included</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formattedPrice}</span>
                  </div>

                  <Button
                    type="submit"
                    form="checkout-form"
                    id="pay-now-btn"
                    disabled={loading || !bookId}
                    className="w-full brand-gradient text-white border-0 rounded-xl py-6 text-base glow"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Pay {formattedPrice} →</>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By paying, you agree to our{" "}
                    <a href="/terms" className="underline">Terms</a>
                  </p>


                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </main>
      }>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </>
  );
}
