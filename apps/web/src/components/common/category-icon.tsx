import {
  Baby, ChefHat, ClipboardList, GraduationCap, HandHeart, type LucideIcon, PaintRoller, PartyPopper, PawPrint,
  Scissors, Shapes, Smartphone, SprayCan, Sprout, Truck, Wrench,
} from 'lucide-react';
import { tint } from '@ayudacerca/core';
import { cn } from '@/lib/utils';

// Importes explícitos: así el paquete final solo incluye estos iconos
const ICONS: Record<string, LucideIcon> = {
  'spray-can': SprayCan, truck: Truck, wrench: Wrench, 'clipboard-list': ClipboardList, 'hand-heart': HandHeart,
  'paw-print': PawPrint, 'graduation-cap': GraduationCap, sprout: Sprout, smartphone: Smartphone,
  'party-popper': PartyPopper, baby: Baby, scissors: Scissors, 'paint-roller': PaintRoller, 'chef-hat': ChefHat, shapes: Shapes,
};

export function CategoryIcon({ icon, color, size = 'md', className }: { icon: string; color: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const Icon = ICONS[icon] ?? Shapes;
  const box = size === 'sm' ? 'size-8 rounded-lg' : size === 'lg' ? 'size-16 rounded-2xl' : 'size-12 rounded-xl';
  const glyph = size === 'sm' ? 'size-4' : size === 'lg' ? 'size-8' : 'size-6';
  return (
    <span aria-hidden className={cn('inline-flex shrink-0 items-center justify-center', box, className)} style={{ backgroundColor: tint(color, 0.88), color }}>
      <Icon className={glyph} strokeWidth={2} />
    </span>
  );
}
