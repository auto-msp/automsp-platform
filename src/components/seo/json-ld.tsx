/**
 * Renders a JSON-LD block. `data` is built by the schema helpers in
 * src/lib/seo.ts — never assemble schema objects inline in a page.
 *
 * JSON.stringify output is escaped for the two sequences that would otherwise
 * be able to break out of the script element.
 */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
