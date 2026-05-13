import { readFile } from "node:fs/promises";
import path from "node:path";

const htmlDocs = new Set([
  "speaking-module-flow.html",
  "vocabulary-business-flow.html",
  "vocabulary-module-flow.html",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const fileName = slug.join("/");

  if (!htmlDocs.has(fileName)) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "doc", fileName);
  const html = await readFile(filePath, "utf8");

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
