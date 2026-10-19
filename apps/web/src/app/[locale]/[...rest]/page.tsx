import { notFound } from 'next/navigation';

// Cualquier ruta desconocida dentro de un idioma muestra la página 404 traducida
export default function CatchAll() {
  notFound();
}
