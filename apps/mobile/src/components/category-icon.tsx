import { tint } from '@ayudacerca/core';
import {
  Baby, ChefHat, ClipboardList, Code, FileCheck, FileSpreadsheet, GraduationCap, HandHeart, Languages, type LucideIcon,
  MonitorSmartphone, PaintRoller, Palette, PartyPopper, PawPrint, Scissors, Shapes, Smartphone, SprayCan, Sprout, Truck, Wrench,
} from 'lucide-react-native';
import { View } from 'react-native';

const ICONS: Record<string, LucideIcon> = {
  'spray-can': SprayCan, truck: Truck, wrench: Wrench, 'clipboard-list': ClipboardList, 'hand-heart': HandHeart,
  'paw-print': PawPrint, 'graduation-cap': GraduationCap, sprout: Sprout, smartphone: Smartphone,
  'party-popper': PartyPopper, baby: Baby, scissors: Scissors, 'paint-roller': PaintRoller, 'chef-hat': ChefHat, shapes: Shapes,
  'monitor-smartphone': MonitorSmartphone, code: Code, palette: Palette, 'file-spreadsheet': FileSpreadsheet, 'file-check': FileCheck,
  languages: Languages,
};

/** Icono de categoría sobre su color suave; `round` lo convierte en burbuja (filas y portada). */
export function CategoryIcon({ icon, color, size = 48, round = false }: { icon: string; color: string; size?: number; round?: boolean }) {
  const Icon = ICONS[icon] ?? Shapes;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: round ? size / 2 : size * 0.3, backgroundColor: tint(color, 0.88), alignItems: 'center', justifyContent: 'center' }}>
      <Icon color={color} size={size * 0.5} strokeWidth={2} />
    </View>
  );
}
