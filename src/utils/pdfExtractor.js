/**
 * pdfExtractor.js
 * Extracts plain text from a PDF File object entirely in the browser
 * using pdfjs-dist v3 — works with Vite out of the box, no config needed.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Use the CDN-hosted worker — most reliable approach with Vite
// This avoids any worker bundling/import issues entirely
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MAX_CHARS = 2500; // Keep in sync with backend MAX_LENGTH

/**
 * @param {File} file  — The File object from <input type="file">
 * @returns {Promise<string>}  Extracted text (max MAX_CHARS chars), or '' on failure
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
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
