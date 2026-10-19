import { brand } from '@ayudacerca/core';
import Link from 'next/link';
import './globals.css';

// 404 fuera de cualquier idioma (p. ej. /api/xyz no existente renderizado como página)
export default function RootNotFound() {
  return (
    <html lang="es">
      <body className="flex min-h-dvh items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-3xl">404</h1>
          <p className="mt-2"><Link href="/" className="text-primary underline">{brand.name}</Link></p>
        </div>
      </body>
    </html>
  );
}
