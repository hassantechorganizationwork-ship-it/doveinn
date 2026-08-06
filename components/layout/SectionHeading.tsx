import { cn } from "@/lib/utils";

/**
 * A centred section title with a short gold rule under it. The rule is what
 * ties the marketing sections together visually — without it each `h2` reads
 * as an isolated line of text rather than the start of a section.
 */
export function SectionHeading({
  children,
  subtitle,
  onDark = false,
  className,
}: {
  children: React.ReactNode;
  subtitle?: string;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <h2
        className={cn(
          "font-heading text-3xl md:text-4xl",
          onDark ? "text-primary-foreground" : "text-primary"
        )}
      >
        {children}
      </h2>
      <div className="mx-auto mt-4 h-px w-16 bg-gold" />
      {subtitle && (
        <p
          className={cn(
            "mx-auto mt-4 max-w-xl text-sm",
            onDark ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
