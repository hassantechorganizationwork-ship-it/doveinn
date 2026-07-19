"use client";

const WHATSAPP_NUMBER = "923240041300";
const WHATSAPP_MESSAGE = "Hi, I want to inquire about a room booking";

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.7.44 3.36 1.28 4.82L2 22l5.4-1.42a9.9 9.9 0 0 0 4.64 1.18h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2Zm0 1.67c2.24 0 4.35.87 5.93 2.46a8.23 8.23 0 0 1 2.42 5.84c0 4.55-3.7 8.25-8.36 8.25a8.3 8.3 0 0 1-4.22-1.15l-.3-.18-3.2.84.85-3.12-.2-.32a8.19 8.19 0 0 1-1.26-4.4c0-4.56 3.71-8.22 8.34-8.22Zm-4.42 4.55c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03s.87 2.36.99 2.52c.12.16 1.68 2.7 4.19 3.68 2.08.82 2.5.66 2.95.61.45-.04 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.16.24-.63.8-.78.97-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.22-.72-.65-1.21-1.44-1.35-1.68-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.36-.77-1.86-.2-.48-.4-.42-.55-.42h-.47Z" />
    </svg>
  );
}

export function WhatsAppButton({ className }: { className?: string }) {
  return (
    <div className={`group/wa relative inline-flex ${className ?? ""}`}>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="flex size-10 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_0_14px_-2px_rgba(34,197,94,0.7)] transition-all duration-200 hover:scale-105 hover:bg-green-600 hover:shadow-[0_0_20px_-1px_rgba(34,197,94,0.9)] active:scale-95"
      >
        <WhatsAppIcon className="size-5" />
      </a>

      {/* TOOLTIP */}
      <span className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground opacity-0 transition-opacity duration-150 group-hover/wa:opacity-100">
        Chat with us
      </span>
    </div>
  );
}
