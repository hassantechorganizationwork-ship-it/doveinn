import {
  Wifi,
  Waves,
  Car,
  Dumbbell,
  Coffee,
  Wind,
  Tv,
  Sparkles,
  UtensilsCrossed,
  Wine,
  WashingMachine,
  Shield,
  PawPrint,
  Snowflake,
  Bed,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_KEYWORD_MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  internet: Wifi,
  pool: Waves,
  "swimming pool": Waves,
  parking: Car,
  car: Car,
  gym: Dumbbell,
  fitness: Dumbbell,
  breakfast: Coffee,
  coffee: Coffee,
  ac: Wind,
  aircon: Wind,
  "air conditioning": Wind,
  tv: Tv,
  television: Tv,
  spa: Sparkles,
  restaurant: UtensilsCrossed,
  food: UtensilsCrossed,
  bar: Wine,
  laundry: WashingMachine,
  security: Shield,
  pet: PawPrint,
  "pet friendly": PawPrint,
  ac_unit: Snowflake,
  bed: Bed,
};

function isEmoji(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) > 127) return true;
  }
  return false;
}

export function AmenityIcon({
  icon,
  className,
}: {
  icon: string | null;
  className?: string;
}) {
  if (!icon) {
    return <CheckCircle2 className={cn("size-6 text-gold", className)} />;
  }

  const normalized = icon.trim().toLowerCase();
  const MatchedIcon = ICON_KEYWORD_MAP[normalized];

  if (MatchedIcon) {
    return <MatchedIcon className={cn("size-6 text-gold", className)} />;
  }

  if (isEmoji(icon)) {
    return <span className={cn("text-2xl leading-none", className)}>{icon}</span>;
  }

  return <CheckCircle2 className={cn("size-6 text-gold", className)} />;
}
