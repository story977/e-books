import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, ExternalLink, Share2, Link2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";


const footerLinks = {

  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

};

const socials = [
  { Icon: Share2, href: "#", label: "X (Twitter)" },
  { Icon: Link2, href: "#", label: "GitHub" },
  { Icon: ExternalLink, href: "#", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="bg-muted/40 border-t border-border mt-20">
      <div className="container-max section-padding py-16">
        <div className="flex flex-col md:flex-row justify-between gap-10 items-start">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-border">
                <Image
                  src="/logo.png"
                  alt="Storytime With Sri Logo"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <span className="text-gradient">Storytime With Sri</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-6">
              Your portal to worlds unknown. Escape reality, unlock epic tales instantly, and carry a thousand lifetimes in your pocket — anywhere, anytime
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>srik13225@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>+91 63803 94753</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Salem, Tamil Nadu, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-16 md:text-right">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group} className="min-w-[120px]"> 
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                  {group}
                </h3>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors animated-underline"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Storytime With Sri. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Payments secured by</span>
            <span className="font-semibold text-primary">Cashfree</span>
            <span>·</span>
            <span>Files hosted on</span>
            <span className="font-semibold text-primary">Cloudinary</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center items-center gap-1.5 text-xs text-muted-foreground/60">
          <span>Made with</span>
          <span className="text-red-400">♥</span>
          <span>by</span>
          <a
            href="https://nodekraft.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary/70 hover:text-primary transition-colors hover:underline underline-offset-2"
          >
            NodeKraft
          </a>
        </div>
      </div>
    </footer>
  );
}
