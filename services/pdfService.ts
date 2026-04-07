import * as pdfjs from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// More robust worker loading for Vite/ESM
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface TextItem {
    str: string;
    x: number;
    y: number;
    width: number;
}

/**
 * Extracts text from a PDF file preserving tabular layout or using OCR if necessary.
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
    console.log("[Aliseus PDF Service] Starting extraction for:", file.name, file.size, "bytes");
    
    // Ensure worker is set (using both local and CDN fallback)
    try {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
        ).toString();
    } catch (e) {
        console.warn("[Aliseus PDF Service] Local worker path failed, falling back to CDN");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const typedArray = new Uint8Array(reader.result as ArrayBuffer);
                const loadingTask = pdfjs.getDocument({ data: typedArray });
                
                // Add a timeout for the loading task
                const timeout = setTimeout(() => {
                    reject(new Error("La carga del PDF ha tardado demasiado (posible error de worker)."));
                }, 15000);

                const pdf = await loadingTask.promise;
                clearTimeout(timeout);
                
                console.log("[Aliseus PDF Service] PDF loaded. Pages:", pdf.numPages);
                
                let fullText = '';
                let totalTextLength = 0;
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    
                    console.log(`[Aliseus PDF Service] Page ${i}: Found ${textContent.items.length} text items`);
                    
                    const items: TextItem[] = textContent.items
                        .filter((item: any) => item.str !== undefined)
                        .map((item: any) => ({
                            str: item.str,
                            x: item.transform[4],
                            y: item.transform[5],
                            width: item.width
                        }));

                    if (items.length > 0) {
                        const pageText = reconstructSpatialText(items);
                        fullText += `--- Página ${i} ---\n${pageText}\n\n`;
                        totalTextLength += pageText.trim().length;
                    }
                }

                console.log("[Aliseus PDF Service] Native Extraction Total Length:", totalTextLength);

                if (totalTextLength < 100) {
                    console.log("[Aliseus PDF Service] PDF appears to be an image or protected. Starting OCR fallback...");
                    const ocrResult = await performOCR(pdf);
                    fullText = ocrResult;
                    console.log("[Aliseus PDF Service] OCR Results Length:", ocrResult.length);
                }
                
                resolve(fullText);
            } catch (error) {
                console.error('[Aliseus PDF Service] Critical Error:', error);
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Error al cargar el archivo en el lector.'));
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Groups text items by row and sorts them by column to preserve layout.
 */
function reconstructSpatialText(items: TextItem[]): string {
    // Sort by Y coordinate (top to bottom) - PDF Y starts from bottom
    // So we group by roughly the same Y value
    const ROW_THRESHOLD = 5; // pixels tolerance for a row
    
    // Sort primarily by Y (descending) and secondarily by X (ascending)
    items.sort((a, b) => b.y - a.y || a.x - b.x);

    let rows: TextItem[][] = [];
    let currentRow: TextItem[] = [];
    let lastY = -1;

    for (const item of items) {
        if (lastY === -1 || Math.abs(item.y - lastY) < ROW_THRESHOLD) {
            currentRow.push(item);
        } else {
            rows.push(currentRow);
            currentRow = [item];
        }
        lastY = item.y;
    }
    if (currentRow.length > 0) rows.push(currentRow);

    // Format rows into structured lines
    return rows.map(row => {
        // Sort items in row by X coordinate
        row.sort((a, b) => a.x - b.x);
        
        // Build a string for the row, inserting extra spaces for large horizontal gaps
        let line = "";
        let lastX = -1;
        
        for (const item of row) {
            if (lastX !== -1) {
                const gap = item.x - lastX;
                // If gap is large, treat as new column
                if (gap > 20) {
                    line += "    "; // 4 spaces as column delimiter
                } else if (gap > 2) {
                    line += " ";
                }
            }
            line += item.str;
            lastX = item.x + item.width;
        }
        return line;
    }).join('\n');
}

/**
 * Performs OCR on all pages of the PDF.
 */
async function performOCR(pdf: pdfjs.PDFDocumentProxy): Promise<string> {
    let ocrText = "--- RESULTADO OCR (Imagen Detectada) ---\n\n";
    const worker = await createWorker('spa'); // Spanish

    try {
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (!context) continue;

            await page.render({
                canvasContext: context,
                viewport: viewport,
                canvas: canvas,
            }).promise;

            const { data: { text } } = await worker.recognize(canvas);
            ocrText += `--- Página ${i} (OCR) ---\n${text}\n\n`;
        }
    } finally {
        await worker.terminate();
    }

    return ocrText;
}
