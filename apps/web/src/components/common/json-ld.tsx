import { headers } from 'next/headers';

/** Datos estructurados. Se escapa «<» para que el contenido no pueda cerrar la etiqueta script. */
export async function JsonLd({ data }: { data: Record<string, unknown> }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // biome-ignore lint: JSON serializado y escapado
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
