import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Guest Details", "Summary", "Payment"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const isCompleted = step < current;
        const isActive = step === current;

        return (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-semibold sm:size-9",
                  isActive || isCompleted
                    ? "bg-gold text-gold-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-4" /> : step}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {step < STEPS.length && (
              <div className="h-px w-8 bg-border sm:w-16" />
            )}
          </div>
        );
      })}
    </div>
  );
}
