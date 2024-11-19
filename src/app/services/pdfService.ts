import { PDFDocument as PDFLibDocument, PDFFont } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import fontkit from '@pdf-lib/fontkit';
import { FormField, PdfForm } from '../utils/types';


// Get all pdf files
export const getAllForms = async (): Promise<PdfForm[] | { error: unknown }> => {
  const forms: PdfForm[] = []; 

  try {    
      const pdfFolder = path.resolve('./public/templates');

      // Get all PDF files asynchronously
      const pdfFiles = (await fs.promises.readdir(pdfFolder)).filter(file => file.endsWith('.pdf'));      
      
      for (const file of pdfFiles) {
          const filePath = path.join(pdfFolder, file);
          const form: PdfForm = { name: file.replace('.pdf', ''), formFields: [] }; // Initialize form

          try {
              // Load and parse PDF document
              const existingPdfBytes = await fs.promises.readFile(filePath);
              const pdfDoc = await PDFLibDocument.load(existingPdfBytes);                                          
              const pdfForm = pdfDoc.getForm();  
              
              if (pdfForm) {
                form.formFields = pdfForm.getFields().map((item) => ({
                  name: item.getName(),
                  type: item.getName().includes('-ls') ? 'DropDown' : item.constructor.name.replace('PDF', ''),
                  require: item.isRequired(),
                }));
              }
      
              // Add needed fields that not in the pdf file
              //form.formFields.push(...addFormFields())

              // Only push forms with fields
              if (form.formFields.length > 0) {
                forms.push(form);
              }
              
          } catch (error) {
              console.error(`Error processing file ${file}:`, error);                   
          }                    
      }

      

      return forms.length > 0 ? forms : { error: 'No forms with fields found' };      
  } catch (pdfError) {      
      console.error('Error Failed to load files:', pdfError);
      return { error: pdfError }; 
  }
};

function addFormFields(): FormField[] {

  return [];
}


// Add user data to pdf file
export const preparePdf = async (file: PdfForm): Promise<Uint8Array | { error: unknown }> => {

  try {
    // Load the original PDF with pdf-lib
    const pdfPath = path.resolve('./public/templates/'+file.name+'.pdf');
    const existingPdfBytes = await fs.promises.readFile(pdfPath);
    const pdfDoc = await PDFLibDocument.load(existingPdfBytes);
    
    // Register fontkit to use custom fonts
    pdfDoc.registerFontkit(fontkit);

    // Load the Noto Sans Hebrew font from your local path
    const fontPath = path.resolve('./src/app/fonts/OpenSans-VariableFont_wdth,wght.ttf');
    const boldFontPath = path.resolve('./src/app/fonts/OpenSans-Bold.ttf');
    
    const fontBytes = fs.readFileSync(fontPath);
    const boldFontBytes = fs.readFileSync(boldFontPath); 
    
    const hebrewFont = await pdfDoc.embedFont(fontBytes);    
    const boldFont = await pdfDoc.embedFont(boldFontBytes);



    // Fill form fields in the main PDF with pdf-lib
    const form = pdfDoc.getForm();

    form.getFields().forEach((field) => {
      let formField = file.formFields.find((item: FormField) => item.name === field.getName());
      
      let fieldText = formField?.value || form.getTextField(field.getName()).getText() || '';      

      form.getTextField(field.getName()).setText(fieldText);
      if (containsHebrew(fieldText)) {                
        if (containsDigits(fieldText)) {          
          form.getTextField(field.getName()).setText(reverseNumbersInHebrewText(fieldText));
        }        
        form.getTextField(field.getName()).updateAppearances(hebrewFont);        
      }     
    });

    let statusField = file.formFields.find((item: FormField) => item.name === 'status')    
    if (statusField?.value) {      
      if (statusField.value == 'complete') {
        form.getTextField('approve').updateAppearances(boldFont);
      } else if ((statusField.value == 'incomplete')) {
        form.getTextField('decline').updateAppearances(boldFont);        
        pdfDoc.removePage(pdfDoc.getPages().length - 2)
      }
    }

    addComments(pdfDoc, file.formFields, hebrewFont)
   
    // Flatten the form fields (make them uneditable)
    form.flatten();
    // Save the edited PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (pdfError) {
    console.error('Error generating PDF=>', pdfError);
    return { error: pdfError };     
  }
};



function addComments(doc: PDFLibDocument, fields: FormField[], hebrewFont: PDFFont) {
  const comments = fields.find((item: FormField) => item.name === 'comments');    

  if (comments && comments.value) {
    const lastPage = doc.getPage(doc.getPages().length - 1);
    const pageSize = lastPage.getSize();
    const margin = 50;
    const maxWidth = pageSize.width - margin * 2;
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;

    // Split text by newlines first
    const lines = comments.value.split('\n').flatMap((line) => wrapText(line, hebrewFont, fontSize, maxWidth));

    let yPosition = pageSize.height - 200;

    lines.forEach((line) => {
      if (yPosition < margin) return;

      // Calculate the line width to align it to the right for RTL
      const lineWidth = hebrewFont.widthOfTextAtSize(line, fontSize);
      const xPosition = pageSize.width - margin - lineWidth;

      lastPage.drawText(line, {
        x: xPosition,
        y: yPosition,
        size: fontSize,
        font: hebrewFont,
      });

      yPosition -= lineHeight;
    });
  }
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);

  return lines;
}

const containsHebrew = (text: string) => /[\u0590-\u05FF]/.test(text);

const containsDigits = (text: string) => /\d/.test(text);

// Detect all digit sequences in the text and reverse them
const reverseNumbersInHebrewText = (text: string) => text.replace(/\d+/g, (match) => match.split('').reverse().join(''));


