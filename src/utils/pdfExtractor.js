/**
 * pdfExtractor.js
 * Extracts plain text from a PDF File object entirely in the browser
 * using pdfjs-dist — no backend memory pressure, no payload size limits.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Point the worker at the bundled worker file shipped with pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const MAX_CHARS = 2500; // Keep in sync with backend MAX_LENGTH

/**
 * @param {File} file  — The File object from <input type="file">
 * @returns {Promise<string>}  Extracted text (max MAX_CHARS chars), or '' on failure
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (fullText.length >= MAX_CHARS) break; // Enough text collected
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += pageText + ' ';
    }

    return fullText.trim().substring(0, MAX_CHARS);
  } catch (err) {
    console.warn('[pdfExtractor] Failed to extract PDF text:', err.message);
    return '';
  }
}
