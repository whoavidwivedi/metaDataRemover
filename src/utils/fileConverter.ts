import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Convert PDF to DOCX
 * Extracts text from PDF and creates a DOCX document
 * Note: Formatting preservation is limited as PDFs are layout-based, not content-based
 */
export async function convertPDFToDOCX(file: File): Promise<Blob> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Ensure worker is initialized
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }
    
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0
    });
    const pdf = await loadingTask.promise;
    
    const paragraphs: Paragraph[] = [];
    const numPages = pdf.numPages;
    
    if (numPages === 0) {
      throw new Error('PDF has no pages');
    }
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      // pdf.js uses 0-indexed pages
      const pageIndex = pageNum - 1;
      
      // Validate page index
      if (pageIndex < 0 || pageIndex >= numPages) {
        console.warn(`Skipping invalid page index: ${pageIndex}, total pages: ${numPages}`);
        continue;
      }
      
      try {
        const page = await pdf.getPage(pageIndex);
        const textContent = await page.getTextContent();
        
        // Group text items into paragraphs (items with similar Y positions)
        const textItems = textContent.items as any[];
        let currentParagraph: string[] = [];
        let lastY = -1;
        
        for (const item of textItems) {
          if (item.str && item.str.trim()) {
            const itemY = item.transform[5]; // Y coordinate
            
            // If Y position changed significantly, start new paragraph
            if (lastY !== -1 && Math.abs(itemY - lastY) > 5) {
              if (currentParagraph.length > 0) {
                paragraphs.push(
                  new Paragraph({
                    children: [new TextRun(currentParagraph.join(' '))],
                  })
                );
                currentParagraph = [];
              }
            }
            
            currentParagraph.push(item.str);
            lastY = itemY;
          }
        }
        
        // Add remaining text as paragraph
        if (currentParagraph.length > 0) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun(currentParagraph.join(' '))],
            })
          );
        }
        
        // Add page break (except for last page)
        if (pageNum < numPages) {
          paragraphs.push(
            new Paragraph({
              text: '',
              heading: HeadingLevel.HEADING_1,
            })
          );
        }
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        // Continue with next page instead of failing completely
        continue;
      }
    }
    
    // Create DOCX document
    if (paragraphs.length === 0) {
      throw new Error('No text content could be extracted from PDF. The PDF may be image-based or encrypted.');
    }
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });
    
    // Generate DOCX blob
    const blob = await Packer.toBlob(doc);
    return blob;
  } catch (error) {
    throw new Error(`Failed to convert PDF to DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Sanitize text to remove or replace Unicode characters that can't be encoded in WinAnsi
 */
function sanitizeTextForPDF(text: string): string {
  // Replace common Unicode characters with ASCII equivalents
  const replacements: Record<string, string> = {
    '\u2022': '•', // Bullet
    '\u2013': '-', // En dash
    '\u2014': '--', // Em dash
    '\u2018': "'", // Left single quotation mark
    '\u2019': "'", // Right single quotation mark
    '\u201C': '"', // Left double quotation mark
    '\u201D': '"', // Right double quotation mark
    '\u2026': '...', // Horizontal ellipsis
    '\u00A0': ' ', // Non-breaking space
  };
  
  // Replace known problematic characters
  let sanitized = text;
  for (const [unicode, replacement] of Object.entries(replacements)) {
    sanitized = sanitized.replace(new RegExp(unicode, 'g'), replacement);
  }
  
  // Remove or replace other non-ASCII characters that can't be encoded
  // Keep only printable ASCII characters (32-126) and common whitespace
  return sanitized.split('').map(char => {
    const code = char.charCodeAt(0);
    // Allow ASCII printable (32-126), tab (9), newline (10), carriage return (13)
    if ((code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13) {
      return char;
    }
    // Replace other characters with a space or question mark
    return '?';
  }).join('');
}

/**
 * Convert DOCX to PDF
 * Note: This is a simplified conversion that extracts text and creates a basic PDF
 * Complex formatting, images, and tables may not be preserved perfectly
 */
export async function convertDOCXToPDF(file: File): Promise<Blob> {
  try {
    // Read DOCX file as ZIP (DOCX is a ZIP archive)
    const arrayBuffer = await file.arrayBuffer();
    const zip = await import('jszip');
    const JSZip = zip.default;
    const zipFile = await JSZip.loadAsync(arrayBuffer);
    
    // Read the main document XML
    const documentXml = await zipFile.file('word/document.xml')?.async('string');
    if (!documentXml) {
      throw new Error('Invalid DOCX file: document.xml not found');
    }
    
    // Parse XML to extract text (simplified - doesn't handle all formatting)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, 'text/xml');
    const paragraphs = xmlDoc.getElementsByTagName('w:p');
    
    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let yPosition = 800; // Start from top
    const lineHeight = 14;
    const margin = 50;
    const pageWidth = 595;
    let currentPage = page; // Track current page for multi-page documents
    
    // Extract text from paragraphs
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      const textRuns = para.getElementsByTagName('w:t');
      let paragraphText = '';
      
      for (let j = 0; j < textRuns.length; j++) {
        const textNode = textRuns[j].textContent || '';
        paragraphText += textNode;
      }
      
      if (paragraphText.trim()) {
        // Sanitize text to handle Unicode characters
        paragraphText = sanitizeTextForPDF(paragraphText);
        
        if (!paragraphText.trim()) continue; // Skip if all text was removed during sanitization
        
        // Check if we need a new page
        if (yPosition < margin + lineHeight) {
          currentPage = pdfDoc.addPage([595, 842]);
          yPosition = 800;
        }
        
        // Check if text is bold (simplified check)
        const isBold = para.getElementsByTagName('w:b').length > 0;
        const font = isBold ? helveticaBold : helvetica;
        
        // Word wrap text
        const words = paragraphText.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          let testLine = currentLine ? `${currentLine} ${word}` : word;
          
          // Try to calculate text width, catch errors for unsupported characters
          let textWidth: number;
          try {
            textWidth = font.widthOfTextAtSize(testLine, 12);
          } catch (error) {
            // If width calculation fails, sanitize the line and try again
            const sanitizedLine = sanitizeTextForPDF(testLine);
            try {
              textWidth = font.widthOfTextAtSize(sanitizedLine, 12);
              // Update testLine to sanitized version
              if (currentLine) {
                currentLine = sanitizeTextForPDF(currentLine);
                testLine = `${currentLine} ${sanitizeTextForPDF(word)}`;
              } else {
                testLine = sanitizeTextForPDF(word);
              }
            } catch {
              // If still fails, use a fallback width estimate
              textWidth = testLine.length * 7; // Rough estimate: 7 pixels per character
            }
          }
          
          if (textWidth > pageWidth - 2 * margin && currentLine) {
            // Draw current line
            try {
              currentPage.drawText(currentLine, {
                x: margin,
                y: yPosition,
                size: 12,
                font: font,
                color: rgb(0, 0, 0),
              });
            } catch (error) {
              // If drawing fails, try with sanitized text
              const sanitizedLine = sanitizeTextForPDF(currentLine);
              currentPage.drawText(sanitizedLine, {
                x: margin,
                y: yPosition,
                size: 12,
                font: font,
                color: rgb(0, 0, 0),
              });
            }
            yPosition -= lineHeight;
            currentLine = word;
            
            // Check for new page
            if (yPosition < margin + lineHeight) {
              currentPage = pdfDoc.addPage([595, 842]);
              yPosition = 800;
            }
          } else {
            currentLine = testLine;
          }
        }
        
        // Draw remaining text
        if (currentLine) {
          try {
            currentPage.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: 12,
              font: font,
              color: rgb(0, 0, 0),
            });
          } catch (error) {
            // If drawing fails, try with sanitized text
            const sanitizedLine = sanitizeTextForPDF(currentLine);
            currentPage.drawText(sanitizedLine, {
              x: margin,
              y: yPosition,
              size: 12,
              font: font,
              color: rgb(0, 0, 0),
            });
          }
          yPosition -= lineHeight * 1.5; // Extra space between paragraphs
        }
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  } catch (error) {
    throw new Error(`Failed to convert DOCX to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert EPUB to PDF
 * Extracts HTML content from EPUB and converts to PDF
 * Note: Formatting preservation is limited as EPUB uses HTML/CSS which may not translate perfectly to PDF
 */
export async function convertEPUBToPDF(file: File): Promise<Blob> {
  try {
    // EPUB is a ZIP archive
    const arrayBuffer = await file.arrayBuffer();
    const zip = await import('jszip');
    const JSZip = zip.default;
    const zipFile = await JSZip.loadAsync(arrayBuffer);
    
    // Read the OPF file to find content files
    const containerXml = await zipFile.file('META-INF/container.xml')?.async('string');
    if (!containerXml) {
      throw new Error('Invalid EPUB file: container.xml not found');
    }
    
    // Parse container.xml to find OPF file
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXml, 'text/xml');
    const rootfile = containerDoc.querySelector('rootfile');
    const opfPath = rootfile?.getAttribute('full-path');
    
    if (!opfPath) {
      throw new Error('Invalid EPUB file: OPF path not found');
    }
    
    // Read OPF file
    const opfXml = await zipFile.file(opfPath)?.async('string');
    if (!opfXml) {
      throw new Error('Invalid EPUB file: OPF file not found');
    }
    
    // Parse OPF to find manifest items (HTML files)
    const opfDoc = parser.parseFromString(opfXml, 'text/xml');
    const manifestItems = opfDoc.querySelectorAll('manifest item');
    const htmlFiles: string[] = [];
    
    manifestItems.forEach(item => {
      const href = item.getAttribute('href');
      const mediaType = item.getAttribute('media-type');
      if (href && (mediaType === 'application/xhtml+xml' || mediaType === 'text/html')) {
        // Resolve relative path
        const basePath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
        htmlFiles.push(basePath + href);
      }
    });
    
    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let currentPage = pdfDoc.addPage([595, 842]); // A4 size
    let yPosition = 800;
    const lineHeight = 14;
    const margin = 50;
    const pageWidth = 595;
    
    // Process each HTML file
    for (const htmlPath of htmlFiles) {
      const htmlContent = await zipFile.file(htmlPath)?.async('string');
      if (!htmlContent) continue;
      
      // Parse HTML and extract text
      const htmlDoc = parser.parseFromString(htmlContent, 'text/html');
      const body = htmlDoc.body;
      
      // Extract text from all elements
      const extractText = (element: Element | null): string[] => {
        if (!element) return [];
        const texts: string[] = [];
        
        for (const node of Array.from(element.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            const text = node.textContent.trim();
            if (text) texts.push(text);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = (node as Element).tagName.toLowerCase();
            if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
              const headingText = (node as Element).textContent?.trim();
              if (headingText) {
                texts.push('\n'); // Add spacing before heading
                texts.push(headingText);
                texts.push('\n');
              }
            } else {
              texts.push(...extractText(node as Element));
            }
          }
        }
        
        return texts;
      };
      
      const textBlocks = extractText(body);
      
      // Add text to PDF
      for (const text of textBlocks) {
        if (!text.trim()) {
          yPosition -= lineHeight;
          continue;
        }
        
        // Check if we need a new page
        if (yPosition < margin + lineHeight) {
          currentPage = pdfDoc.addPage([595, 842]);
          yPosition = 800;
        }
        
        // Determine if text is a heading (starts with newline)
        const isHeading = text.startsWith('\n') && text.trim().length > 0;
        const font = isHeading ? helveticaBold : helvetica;
        const fontSize = isHeading ? 16 : 12;
        const cleanText = text.trim();
        
        if (!cleanText) continue;
        
        // Word wrap text
        const words = cleanText.split(/\s+/);
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (textWidth > pageWidth - 2 * margin && currentLine) {
            // Draw current line
            currentPage.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight * (isHeading ? 1.5 : 1);
            currentLine = word;
            
            // Check for new page
            if (yPosition < margin + lineHeight) {
              currentPage = pdfDoc.addPage([595, 842]);
              yPosition = 800;
            }
          } else {
            currentLine = testLine;
          }
        }
        
        // Draw remaining text
        if (currentLine) {
          currentPage.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight * (isHeading ? 2 : 1.5);
        }
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  } catch (error) {
    throw new Error(`Failed to convert EPUB to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert PDF to EPUB
 * Extracts text from PDF and creates an EPUB file
 * Note: Formatting preservation is limited as PDFs are layout-based, not content-based
 */
export async function convertPDFToEPUB(file: File): Promise<Blob> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Ensure worker is initialized
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }
    
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0
    });
    const pdf = await loadingTask.promise;
    
    const numPages = pdf.numPages;
    if (numPages === 0) {
      throw new Error('PDF has no pages');
    }
    
    const chapters: { title: string; content: string }[] = [];
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      // pdf.js uses 0-indexed pages
      const pageIndex = pageNum - 1;
      
      // Validate page index
      if (pageIndex < 0 || pageIndex >= numPages) {
        console.warn(`Skipping invalid page index: ${pageIndex}, total pages: ${numPages}`);
        continue;
      }
      
      try {
        const page = await pdf.getPage(pageIndex);
        const textContent = await page.getTextContent();
        
        const textItems = textContent.items as any[];
        const pageText = textItems
          .map(item => item.str)
          .filter(str => str && str.trim())
          .join(' ');
        
        if (pageText.trim()) {
          chapters.push({
            title: `Page ${pageNum}`,
            content: pageText
          });
        }
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        // Continue with next page instead of failing completely
        continue;
      }
    }
    
    if (chapters.length === 0) {
      throw new Error('No text content could be extracted from PDF. The PDF may be image-based or encrypted.');
    }
    
    // Create EPUB structure using JSZip
    const zip = await import('jszip');
    const JSZip = zip.default;
    const epub = new JSZip();
    
    // MIME type
    epub.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
    
    // META-INF/container.xml
    const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
    const metaInfFolder = epub.folder('META-INF');
    if (!metaInfFolder) throw new Error('Failed to create META-INF folder');
    metaInfFolder.file('container.xml', containerXml);
    
    // Create HTML files for each chapter
    const htmlFiles: string[] = [];
    chapters.forEach((chapter, index) => {
      const htmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${chapter.title}</title>
  <style>
    body { font-family: serif; margin: 1em; line-height: 1.6; }
    h1 { font-size: 1.5em; margin-bottom: 1em; }
    p { margin-bottom: 1em; text-align: justify; }
  </style>
</head>
<body>
  <h1>${chapter.title}</h1>
  <p>${chapter.content.replace(/\n/g, '</p><p>')}</p>
</body>
</html>`;
      
      const filename = `chapter-${index + 1}.xhtml`;
      const oebpsFolder = epub.folder('OEBPS');
      if (!oebpsFolder) throw new Error('Failed to create OEBPS folder');
      oebpsFolder.file(filename, htmlContent);
      htmlFiles.push(filename);
    });
    
    // Create content.opf (package file)
    const manifestItems = htmlFiles.map((file, index) => 
      `    <item id="chapter-${index + 1}" href="${file}" media-type="application/xhtml+xml"/>`
    ).join('\n');
    
    const spineItems = htmlFiles.map((_, index) => 
      `    <itemref idref="chapter-${index + 1}"/>`
    ).join('\n');
    
    const opfContent = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">pdf-to-epub-${Date.now()}</dc:identifier>
    <dc:title>Converted PDF</dc:title>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString()}</meta>
  </metadata>
  <manifest>
${manifestItems}
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>`;
    
    const oebpsFolderFinal = epub.folder('OEBPS');
    if (!oebpsFolderFinal) throw new Error('Failed to access OEBPS folder');
    oebpsFolderFinal.file('content.opf', opfContent);
    
    // Generate EPUB blob
    const epubBlob = await epub.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
    return epubBlob;
  } catch (error) {
    throw new Error(`Failed to convert PDF to EPUB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download a file
 */
export function downloadFile(blob: Blob, filename: string) {
  saveAs(blob, filename);
}
