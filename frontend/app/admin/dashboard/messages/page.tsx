"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Mail, User, Clock, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fetchAdminMessages, markMessageRead } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import type { ContactMessage } from "@/types";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchAdminMessages(token, 1, 50);
      setMessages(data.messages);
    } catch (_e) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadMessages(); }, []);

  const handleMarkRead = async (id: string) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await markMessageRead(id, token);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, is_read: true } : msg))
      );
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to update message");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-muted-foreground text-sm">
            {messages.filter(m => !m.is_read).length} unread messages
          </p>
        </div>
        <Button variant="outline" onClick={loadMessages} disabled={loading} className="rounded-xl">
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-6">
                <div className="h-4 animate-shimmer rounded w-1/4 mb-3" />
                <div className="h-16 animate-shimmer rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No messages yet</p>
          <p className="text-sm">When customers contact you, messages will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card key={msg.id} className={`border-border/60 transition-colors ${!msg.is_read ? 'bg-primary/5 border-primary/20' : ''}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{msg.subject}</h3>
                      {!msg.is_read && (
                        <Badge className="bg-primary hover:bg-primary text-white text-xs">New</Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        {msg.name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${msg.email}`} className="hover:text-primary hover:underline">
                          {msg.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {new Date(msg.created_at).toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div className="bg-background rounded-lg p-4 text-sm mt-4 border border-border/40 whitespace-pre-wrap">
                      {msg.message}
                    </div>
                  </div>

                  <div className="flex-shrink-0 pt-1">
                    {!msg.is_read ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => handleMarkRead(msg.id)}
                      >
                        <Circle className="w-4 h-4 mr-2 text-muted-foreground" />
                        Mark Read
                      </Button>
                    ) : (
                      <div className="flex items-center text-sm text-muted-foreground px-3 py-1.5">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        Read
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
