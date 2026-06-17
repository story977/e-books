"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Loader2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { verifyPayment } from "@/lib/api";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cashfreeOrderId = searchParams.get("cashfree_order_id") || "";
  const cashfreePaymentId = searchParams.get("cashfree_payment_id") || "";
  const cashfreeSignature = searchParams.get("cashfree_signature") || "";

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(600); // 10 minutes

  useEffect(() => {
    if (!cashfreeOrderId) {
      router.push("/books");
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyPayment({
          cashfree_order_id: cashfreeOrderId,
          cashfree_payment_id: cashfreePaymentId,
          cashfree_signature: cashfreeSignature,
        });

        if (result.success && result.download_token) {
          setStatus("success");
          setDownloadToken(result.download_token);
          setMessage(result.message);
          toast.success("Payment verified! Download your book now.");
        } else {
          setStatus("failed");
          setMessage(result.message);
        }
      } catch (err) {
        setStatus("failed");
        setMessage("Failed to verify payment. Contact support.");
      }
    };

    verify();
  }, [cashfreeOrderId, cashfreePaymentId, cashfreeSignature]);

  // Countdown timer for download link expiry
  useEffect(() => {
    if (status !== "success") return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <main className="pt-24 pb-20 min-h-screen flex items-center">
      <div className="container-max section-padding max-w-lg mx-auto w-full">
        {status === "loading" && (
          <Card className="border-border/60 text-center">
            <CardContent className="py-16">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-3">Verifying Payment</h1>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
            </CardContent>
          </Card>
        )}

        {status === "success" && downloadToken && (
          <Card className="border-green-500/30 bg-green-500/5 text-center">
            <CardContent className="py-12 px-8">
              <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Successful! 🎉</h1>
              <p className="text-muted-foreground mb-8">{message}</p>

              {/* Countdown */}
              {countdown > 0 ? (
                <div className="flex items-center justify-center gap-2 text-sm text-amber-500 mb-6 bg-amber-500/10 rounded-xl py-3 px-4">
                  <Clock className="w-4 h-4" />
                  <span>Download link expires in: <strong>{formatTime(countdown)}</strong></span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-destructive mb-6 bg-destructive/10 rounded-xl py-3 px-4">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Link expired. Contact support for a new link.</span>
                </div>
              )}

              <a
                href={`${API_URL}/download/${downloadToken}`}
                id="download-book-btn"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  disabled={countdown === 0}
                  className="w-full brand-gradient text-white border-0 rounded-xl glow py-6 text-base mb-4"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Your eBook
                </Button>
              </a>

              <p className="text-xs text-muted-foreground">
                Having issues?{" "}
                <Link href="/contact" className="text-primary underline">
                  Contact support
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {status === "failed" && (
          <Card className="border-destructive/30 bg-destructive/5 text-center">
            <CardContent className="py-12 px-8">
              <div className="w-20 h-20 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
              <p className="text-muted-foreground mb-8">{message}</p>
              <div className="flex flex-col gap-3">
                <Link href="/books">
                  <Button
                    size="lg"
                    className="w-full brand-gradient text-white border-0 rounded-xl"
                  >
                    Try Again
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="w-full rounded-xl">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </main>
      }>
        <PaymentSuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
