"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/lib/api";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id.replace("contact-", "")]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await submitContactForm(form);
      toast.success("Message sent successfully! We will get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            placeholder="Your name"
            className="rounded-xl"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            placeholder="your@email.com"
            className="rounded-xl"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          placeholder="How can we help?"
          className="rounded-xl"
          value={form.subject}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          placeholder="Describe your issue or question..."
          className="rounded-xl min-h-[140px] resize-none"
          value={form.message}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      <Button
        id="contact-submit"
        type="submit"
        className="w-full brand-gradient text-white border-0 rounded-xl py-6"
        size="lg"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <MessageSquare className="w-4 h-4 mr-2" />
        )}
        {loading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
