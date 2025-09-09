// scripts/gen-pdfs.mjs
import { promises as fs } from "node:fs";
import { join } from "node:path";

const pdfDir = join(process.cwd(), "public", "pdf");
const outFile = join(process.cwd(), "public", "pdfs.json");

async function main() {
  try {
    const entries = await fs.readdir(pdfDir, { withFileTypes: true });
    const pdfs = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".pdf"))
      .map((e) => {
        const filename = e.name;
        const name = filename.replace(/\.pdf$/i, "");
        return { name, url: `/pdf/${filename}` };
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    await fs.writeFile(outFile, JSON.stringify(pdfs, null, 2));
    console.log(`Wrote ${pdfs.length} entries to ${outFile}`);
  } catch (err) {
    if (err.code === "ENOENT") {
      // If the folder doesn't exist, write empty list so fetch still works
      await fs.mkdir(pdfDir, { recursive: true });
      await fs.writeFile(outFile, "[]");
      console.log(`Created ${pdfDir} and wrote empty manifest to ${outFile}`);
    } else {
      console.error(err);
      process.exit(1);
    }
  }
}

main();