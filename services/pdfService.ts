import * as pdfjs from 'pdfjs-dist';
// @ts-ignore - this is a Vite-specific import for the worker URL
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extracts text from a PDF file.
 * @param file The PDF file to process
 * @returns A promise that resolves to the full text content of the PDF
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const typedArray = new Uint8Array(reader.result as ArrayBuffer);
                const loadingTask = pdfjs.getDocument({ data: typedArray });
                const pdf = await loadingTask.promise;
                
                let fullText = '';
                
                // Iterate through all pages
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items
                        .map((item: any) => item.str)
                        .join(' ');
                    
                    fullText += `--- Página ${i} ---\n${pageText}\n\n`;
                }
                
                resolve(fullText);
            } catch (error) {
                console.error('Error extracting PDF text:', error);
                reject(new Error('No se pudo leer el archivo PDF. Asegúrate de que no esté protegido.'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Error al cargar el archivo.'));
        };

        reader.readAsArrayBuffer(file);
    });
};
