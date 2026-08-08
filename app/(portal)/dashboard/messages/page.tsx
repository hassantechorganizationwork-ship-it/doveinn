"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type ContactMessage = {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function PortalMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/messages");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to load messages");
      }
      setMessages(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const toggleExpand = async (msg: ContactMessage) => {
    const opening = expandedId !== msg.id;
    setExpandedId(opening ? msg.id : null);

    if (opening && !msg.is_read) {
      try {
        const res = await fetch(`/api/messages/${msg.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_read: true }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setMessages(
            (prev) => prev?.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)) ?? prev
          );
        }
      } catch {
        // Non-critical — the message still opens even if marking read fails.
      }
    }
  };

  const unreadCount = messages?.filter((m) => !m.is_read).length ?? 0;

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl text-primary">Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Messages guests have sent through the Contact page.
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge className="border-none bg-red-600 text-white">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      {loading && (
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-4 w-64" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-white py-16 text-center shadow-sm">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchMessages}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && messages?.length === 0 && (
        <div className="mt-6 rounded-xl bg-white py-16 text-center shadow-sm">
          <p className="text-muted-foreground">No messages yet.</p>
        </div>
      )}

      {!loading && !error && messages && messages.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {messages.map((msg) => {
            const isExpanded = expandedId === msg.id;
            return (
              <div
                key={msg.id}
                className="cursor-pointer rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                onClick={() => toggleExpand(msg)}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    {msg.is_read ? (
                      <MailOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <Mail className="mt-0.5 size-4 shrink-0 text-gold-text" />
                    )}
                    <div>
                      <p
                        className={
                          msg.is_read
                            ? "font-medium text-primary"
                            : "font-semibold text-primary"
                        }
                      >
                        {msg.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {msg.full_name} · {msg.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>

                {isExpanded && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="whitespace-pre-wrap text-sm text-primary">
                      {msg.message}
                    </p>
                    <a
                      href={`mailto:${msg.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 inline-block text-sm font-medium text-gold-text hover:underline"
                    >
                      Reply by email →
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
