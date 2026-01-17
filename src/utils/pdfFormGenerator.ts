import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface FormField {
  id: string;
  type: 'text' | 'checkbox' | 'textarea' | 'radio' | 'dropdown' | 'signature' | 'label' | 'ul' | 'ol';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  options?: string[]; // For dropdown/radio/lists
}

export async function generateFormPDF(fields: FormField[]): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const form = pdfDoc.getForm();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Height of A4 is 842. We need to flip Y coordinates because
  // DOM (0,0) is top-left, PDF (0,0) is bottom-left.
  const pageHeight = 842;

  for (const field of fields) {
    // Invert Y coordinate.
    // field.y is from top. PDF expects from bottom.
    const pdfY = pageHeight - field.y - field.height;

    // Draw Label
    // For 'label' type (Static Text), we draw the text AT the box position.
    if (field.type === 'label') {
        page.drawText(field.label, {
            x: field.x,
            y: pdfY + field.height - 10, // Align top-ish inside the box
            size: 12,
            font: helvetica,
            color: rgb(0, 0, 0),
        });
        continue; // Skip creating a form widget
    }

    // Draw Lists (UL/OL)
    if (field.type === 'ul' || field.type === 'ol') {
        const items = field.options || ['Item 1', 'Item 2', 'Item 3'];
        const fontSize = 10;
        const lineHeight = 14;
        
        items.forEach((item, index) => {
            const prefix = field.type === 'ul' ? '• ' : `${index + 1}. `;
            page.drawText(`${prefix}${item}`, {
                x: field.x,
                y: (pdfY + field.height - 10) - (index * lineHeight), // Start top-ish and go down
                size: fontSize,
                font: helvetica,
                color: rgb(0, 0, 0),
            });
        });
        continue;
    }

    // For other fields, we do NOT draw a label. The entry box is standalone.

    if (field.type === 'text' || field.type === 'textarea') {
      const textField = form.createTextField(field.id);
      textField.setText('');
      if (field.type === 'textarea') {
        textField.enableMultiline();
      }
      textField.addToPage(page, {
        x: field.x,
        y: pdfY,
        width: field.width,
        height: field.height,
      });
    } else if (field.type === 'checkbox') {
      const checkBox = form.createCheckBox(field.id);
      checkBox.addToPage(page, {
        x: field.x,
        y: pdfY,
        width: field.width,
        height: field.height,
      });
    } else if (field.type === 'radio') {
      // Create a unique group for this single button for now
      const radioGroup = form.createRadioGroup(`group_${field.id}`);
      radioGroup.addOptionToPage(field.id, page, {
          x: field.x,
          y: pdfY,
          width: field.width,
          height: field.height,
      });
    } else if (field.type === 'dropdown') {
        const dropdown = form.createDropdown(field.id);
        if (field.options) {
            dropdown.setOptions(field.options);
        } else {
            dropdown.setOptions(['Option 1', 'Option 2', 'Option 3']);
        }
        dropdown.addToPage(page, {
            x: field.x,
            y: pdfY,
            width: field.width,
            height: field.height,
        });
    } else if (field.type === 'signature') {
        // Signature field is essentially a form field but often handled by specific signature handlers.
        // We can create a text field intended for digital signatures or a button.
        // pdf-lib doesn't support creating digital signature fields easily yet.
        // We will fallback to a visual box (rectangle) and a text field.
        const sigField = form.createTextField(field.id);
        sigField.enableMultiline();
        sigField.setText('Sign Here');
        sigField.addToPage(page, {
            x: field.x,
            y: pdfY,
            width: field.width,
            height: field.height,
        });
        
        // Add a visual border using vector graphics purely for print
        page.drawRectangle({
            x: field.x,
            y: pdfY,
            width: field.width,
            height: field.height,
            borderWidth: 1,
            borderColor: rgb(0, 0, 0),
            opacity: 0.1 // Subtle background
        });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}
