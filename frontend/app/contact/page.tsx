import { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with eBook Store support team. We're here to help with any questions about purchases, downloads, or technical issues.",
};

const contactInfo = [
  {
    icon: Mail,
    title: "Email Support",
    value: "support@ebookstore.com",
    desc: "We respond within 24 hours",
    href: "mailto:support@ebookstore.com",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+91 98765 43210",
    desc: "Mon–Fri, 9 AM – 6 PM IST",
    href: "tel:+919876543210",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Chennai, Tamil Nadu",
    desc: "India",
    href: "#",
  },
  {
    icon: Clock,
    title: "Response Time",
    value: "< 24 hours",
    desc: "Average response time",
    href: "#",
  },
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20 min-h-screen">
        {/* Header */}
        <div className="py-16 mb-16 text-foreground text-center border-b border-border">
          <div className="container-max section-padding">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Have a question or need help? We&apos;re here for you.
            </p>
          </div>
        </div>

        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
              <Card className="border-border/60">
                  <ContactForm />
              </Card>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {contactInfo.map(({ icon: Icon, title, value, desc, href }) => (
                  <a key={title} href={href}>
                    <Card className="card-hover border-border/60 h-full">
                      <CardContent className="p-5">
                        <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center mb-4">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          {title}
                        </p>
                        <p className="font-semibold text-sm">{value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Download Issues?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    If your download link expired or you&apos;re facing any issues
                    with your purchase, email us with your order ID and we&apos;ll
                    sort it out quickly.
                  </p>
                  <a href="mailto:support@ebookstore.com">
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <Mail className="w-3.5 h-3.5 mr-1.5" />
                      Email Support
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
