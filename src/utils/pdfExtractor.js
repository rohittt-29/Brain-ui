/**
 * pdfExtractor.js
 * Extracts plain text from a PDF File object entirely in the browser
 * using pdfjs-dist v3 — no backend needed, no memory pressure on server.
 */

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Point to the worker file served from the Vite public directory
// Vite will serve /node_modules via its dev server; in prod we copy the worker.
// Using unpkg as a reliable cross-env CDN fallback.
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js`;

const MAX_CHARS = 2500;

/**
 * @param {File} file  — The File object from <input type="file">
 * @returns {Promise<string>}  Extracted text (up to MAX_CHARS chars), or '' on failure
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const loadingTask = pdfjsLib.getDocument({ data: uint8 });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (fullText.length >= MAX_CHARS) break;
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += pageText + ' ';
    }

    const result = fullText.trim().substring(0, MAX_CHARS);
    console.log(`[pdfExtractor] Extracted ${result.length} chars from PDF`);
    return result;
  } catch (err) {
    console.warn('[pdfExtractor] Failed to extract PDF text:', err.message);
    return '';
  }
}
