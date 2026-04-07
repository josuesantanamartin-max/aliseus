import * as pdfjs from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Configuration for Vite/ESM environment
const PDFJS_VERSION = '4.0.379'; // Ensure consistency with package version
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

interface TextItem {
    str: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export type ExtractionProgress = {
    status: 'LOADING' | 'EXTRACTING' | 'OCR' | 'DONE';
    page: number;
    totalPages: number;
    message: string;
};

/**
 * Extracts text from a PDF file preserving tabular layout or using OCR if necessary.
 */
export const extractTextFromPDF = async (
    file: File, 
    onProgress?: (progress: ExtractionProgress) => void,
    forceOCR: boolean = false
): Promise<string> => {
    console.log("[Aliseus PDF Service] Starting extraction for:", file.name, file.size, "bytes", "ForceOCR:", forceOCR);
    
    onProgress?.({ status: 'LOADING', page: 0, totalPages: 0, message: 'Cargando lector de PDF...' });

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const typedArray = new Uint8Array(reader.result as ArrayBuffer);
                const loadingTask = pdfjs.getDocument({ 
                    data: typedArray,
                    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
                    cMapPacked: true
                });
                
                const timeout = setTimeout(() => {
                    reject(new Error("La carga del PDF ha tardado demasiado."));
                }, 20000);

                const pdf = await loadingTask.promise;
                clearTimeout(timeout);
                
                onProgress?.({ status: 'EXTRACTING', page: 0, totalPages: pdf.numPages, message: 'Analizando páginas...' });

                let fullText = '';
                let totalTextLength = 0;
                
                if (!forceOCR) {
                    for (let i = 1; i <= pdf.numPages; i++) {
                        onProgress?.({ status: 'EXTRACTING', page: i, totalPages: pdf.numPages, message: `Extrayendo texto de página ${i}...` });
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        
                        const items: TextItem[] = textContent.items
                            .filter((item: any) => item.str !== undefined)
                            .map((item: any) => ({
                                str: item.str,
                                x: item.transform[4],
                                y: item.transform[5],
                                width: item.width,
                                height: item.transform[0] // Approximation of font size
                            }));

                        if (items.length > 0) {
                            const pageText = reconstructSpatialText(items);
                            fullText += `--- Página ${i} ---\n${pageText}\n\n`;
                            totalTextLength += pageText.trim().length;
                        }
                    }
                }

                // Threshold check: If less than 100 characters extracted, or forceOCR is TRUE
                if (forceOCR || totalTextLength < 100) {
                    console.log("[Aliseus PDF Service] Image PDF or ForceOCR detected. Running OCR...");
                    onProgress?.({ status: 'OCR', page: 0, totalPages: pdf.numPages, message: 'Detectando texto en imágenes (OCR)...' });
                    fullText = await performOCR(pdf, onProgress);
                }
                
                onProgress?.({ status: 'DONE', page: pdf.numPages, totalPages: pdf.numPages, message: 'Extracción completada.' });
                resolve(fullText);
            } catch (error: any) {
                console.error('[Aliseus PDF Service] Critical Error:', error);
                reject(new Error(error.message || 'Error al procesar el PDF.'));
            }
        };

        reader.onerror = () => reject(new Error('Error al leer el archivo.'));
        reader.readAsArrayBuffer(file);
    });
};

function reconstructSpatialText(items: TextItem[]): string {
    // Dynamic threshold based on average item height
    const avgHeight = items.reduce((acc, it) => acc + (it.height || 10), 0) / items.length;
    const ROW_THRESHOLD = Math.max(4, avgHeight * 0.6); 
    
    // Sort primarily by Y descending (top to bottom)
    items.sort((a, b) => b.y - a.y);

    let rows: TextItem[][] = [];
    if (items.length === 0) return "";

    let currentRow: TextItem[] = [items[0]];
    let lastY = items[0].y;

    for (let i = 1; i < items.length; i++) {
        const item = items[i];
        // If Y is close enough to lastY, it's the same row
        if (Math.abs(item.y - lastY) <= ROW_THRESHOLD) {
            currentRow.push(item);
        } else {
            // Sort previous row by X and add to results
            currentRow.sort((a, b) => a.x - b.x);
            rows.push(currentRow);
            
            currentRow = [item];
            lastY = item.y;
        }
    }
    currentRow.sort((a, b) => a.x - b.x);
    rows.push(currentRow);

    // Format rows into structured lines with tab delimiters for columns
    return rows.map(row => {
        let line = "";
        let lastX = -1;
        
        for (const item of row) {
            if (lastX !== -1) {
                const gap = item.x - lastX;
                // Strong column detection: if gap is large, use Tab
                if (gap > 20) {
                    line += "\t";
                } else if (gap > 2) {
                    line += " ";
                }
            }
            line += item.str;
            lastX = item.x + (item.width || 0);
        }
        return line;
    }).join('\n');
}

/**
 * Performs OCR on all pages.
 */
async function performOCR(pdf: pdfjs.PDFDocumentProxy, onProgress?: (p: ExtractionProgress) => void): Promise<string> {
    let ocrText = "--- RESULTADO OCR (Imagen Detectada) ---\n\n";
    const worker = await createWorker('spa'); 

    try {
        for (let i = 1; i <= pdf.numPages; i++) {
            onProgress?.({ status: 'OCR', page: i, totalPages: pdf.numPages, message: `Procesando OCR en página ${i}...` });
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.5 }); // Higher quality
            
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
