import { tint } from '@ayudacerca/core';
import {
  Baby, ChefHat, ClipboardList, GraduationCap, HandHeart, type LucideIcon, PaintRoller, PartyPopper, PawPrint,
  Scissors, Shapes, Smartphone, SprayCan, Sprout, Truck, Wrench,
} from 'lucide-react-native';
import { View } from 'react-native';

const ICONS: Record<string, LucideIcon> = {
  'spray-can': SprayCan, truck: Truck, wrench: Wrench, 'clipboard-list': ClipboardList, 'hand-heart': HandHeart,
  'paw-print': PawPrint, 'graduation-cap': GraduationCap, sprout: Sprout, smartphone: Smartphone,
  'party-popper': PartyPopper, baby: Baby, scissors: Scissors, 'paint-roller': PaintRoller, 'chef-hat': ChefHat, shapes: Shapes,
};

export function CategoryIcon({ icon, color, size = 48 }: { icon: string; color: string; size?: number }) {
  const Icon = ICONS[icon] ?? Shapes;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: size * 0.25, backgroundColor: tint(color, 0.88), alignItems: 'center', justifyContent: 'center' }}>
      <Icon color={color} size={size * 0.5} strokeWidth={2} />
    </View>
  );
}
