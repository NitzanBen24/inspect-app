import { PDFDocument as PDFLibDocument, PDFFont, TextAlignment } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import fontkit from '@pdf-lib/fontkit';
import { FormField, PdfForm } from '../utils/types';


const _containsHebrew = (text: string) => /[\u0590-\u05FF]/.test(text);
const _containsDigits = (text: string) => /\d/.test(text);
// Detect all digit sequences in the text and reverse them
const reverseNumbersInHebrewText = (text: string) => text.replace(/\d+/g, (match) => match.split('').reverse().join(''));

function _addFormFields(fileName: string): FormField[] {
  const moreFields = ['comments'];
  if (fileName === 'inspection') {
    moreFields.push('message', 'provider','batteries','capacity', 'bmanufacture');
  }
  
  return moreFields.map((item) => ({
    name: item,
    type: 
    item === 'provider' ? 'DropDown' : 
    item === 'comments' || item === 'message' ? 'TextArea' : 'TextField',
    require: true,
  }));
}

function _addComments(doc: PDFLibDocument, fields: FormField[], hebrewFont: PDFFont) {
  const comments = fields.find((item: FormField) => item.name === 'comments');    

  if (comments && comments.value) {
    const lastPage = doc.getPage(doc.getPages().length - 1);
    const pageSize = lastPage.getSize();
    const margin = 50;
    const maxWidth = pageSize.width - margin * 2;
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;

    // Split text by newlines first
    const lines = comments.value.split('\n').flatMap((line) => _wrapText(line, hebrewFont, fontSize, maxWidth));

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

function _wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
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

// Get all pdf files
export const getAllPDF = async (): Promise<PdfForm[] | { error: unknown }> => {
  const forms: PdfForm[] = []; 

  try {    
      const pdfFolder = path.resolve('./public/templates');

      // Get all PDF files asynchronously
      const pdfFiles = (await fs.promises.readdir(pdfFolder)).filter(file => file.endsWith('.pdf'));      
      /** 
       * Consider to change file to fileName
      */
      for (const file of pdfFiles) {
          const filePath = path.join(pdfFolder, file);
          const form: PdfForm = { name: file.replace('.pdf', ''), formFields: [], status: 'new' }; // Initialize form                    

          try {
              // Load and parse PDF document
              const existingPdfBytes = await fs.promises.readFile(filePath);
              const pdfDoc = await PDFLibDocument.load(new Uint8Array(existingPdfBytes));                                          
              const pdfForm = pdfDoc.getForm();  
              
              if (pdfForm) {                 
                form.formFields = pdfForm.getFields().map((field) => {                   
                  const fieldName = field.getName();
                  const isDropDown = fieldName.endsWith('-ls');

                  return ({
                    name: fieldName,//isDropDown ? fieldName.replace('-ls','') :
                    type: isDropDown ? 'DropDown' : 'TextField',
                    require: field.isRequired(),
                  })
                });
              }
                    
              // Add needed fields that not in the pdf file
              form.formFields.push(..._addFormFields(form.name));
              
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

// Add user data to pdf file
export const preparePdf = async (file: PdfForm): Promise<Uint8Array | { error: unknown }> => {

  try {
    // Load the original PDF with pdf-lib
    const pdfPath = path.resolve('./public/templates/'+file.name+'.pdf');
    const existingPdfBytes = await fs.promises.readFile(pdfPath);
    const pdfDoc = await PDFLibDocument.load(new Uint8Array(existingPdfBytes));    
    
    // Register fontkit to use custom fonts
    pdfDoc.registerFontkit(fontkit);

    // Load the Noto Sans Hebrew font from your local path
    const fontPath = path.resolve('./src/app/fonts/OpenSans-VariableFont_wdth,wght.ttf');
    const boldFontPath = path.resolve('./src/app/fonts/OpenSans-Bold.ttf');
    
    const fontBytes = fs.readFileSync(fontPath);
    const boldFontBytes = fs.readFileSync(boldFontPath); 
    
    const hebrewFont = await pdfDoc.embedFont(new Uint8Array(fontBytes));    
    const boldFont = await pdfDoc.embedFont(new Uint8Array(boldFontBytes));

    // Fill form fields in the main PDF with pdf-lib
    const form = pdfDoc.getForm();

    form.getFields().forEach((field) => {
      
      let formField = file.formFields.find((item: FormField) => item.name === field.getName());      
      let fieldText = formField?.value || form.getTextField(field.getName()).getText() || '';      

      form.getTextField(field.getName()).setText(fieldText);
      if (_containsHebrew(fieldText)) {                
        // if (_containsDigits(fieldText)) {          
        //   form.getTextField(field.getName()).setText(reverseNumbersInHebrewText(fieldText));
        // }        

        form.getTextField(field.getName()).setAlignment(TextAlignment.Right);
        form.getTextField(field.getName()).updateAppearances(hebrewFont);        
        
      } else {
        form.getTextField(field.getName()).setAlignment(TextAlignment.Right);
      }
      
    });

    /**
     * only for inspection form
     * remove to a function
     */    
    let statusField = file.formFields.find((item: FormField) => item.name === 'status')    
    if (statusField?.value) {      
      if (statusField.value == 'complete') {
        form.getTextField('approve').updateAppearances(boldFont);
      } else if ((statusField.value == 'incomplete')) {
        form.getTextField('decline').updateAppearances(boldFont);        
        pdfDoc.removePage(pdfDoc.getPages().length - 2)
      }
    }

    if (file.name !== 'storage') {
      _addComments(pdfDoc, file.formFields, hebrewFont);
    }
    
    //Make file read only
    //form.flatten();
    
    // Save the edited PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;

  } catch (pdfError) {
    console.error('Error generating PDF=>', pdfError);
    return { error: pdfError };     
  }
};

export const getPDFs = async (fileNames: string[]): Promise<PdfForm[]> => {
  const forms: PdfForm[] = []; 

  const pdfFolder = path.resolve('./public/templates');

  // Get all PDF files asynchronously
  const pdfFiles = (await fs.promises.readdir(pdfFolder)).filter(file => file.endsWith('.pdf'));      
  /** 
   * Consider to change file to fileName
  */
  for (const file of pdfFiles) {
      const filePath = path.join(pdfFolder, file);
      const form: PdfForm = { name: file.replace('.pdf', ''), formFields: [], status: 'new' }; // Initialize form                    
                          
      if (fileNames.includes(form.name)) {              
        try {
            // Load and parse PDF document
            const existingPdfBytes = await fs.promises.readFile(filePath);
            const pdfDoc = await PDFLibDocument.load(new Uint8Array(existingPdfBytes));                                          
            const pdfForm = pdfDoc.getForm();                  
            if (pdfForm) {                 
              form.formFields = pdfForm.getFields().map((field) => {                   
                const fieldName = field.getName();
                const isDropDown = fieldName.endsWith('-ls');

                return ({
                  name: fieldName,//isDropDown ? fieldName.replace('-ls','') :
                  type: isDropDown ? 'DropDown' : 'TextField',
                  require: field.isRequired(),
                })
              });
            }
            
            // Add needed fields that not in the pdf file
            form.formFields.push(..._addFormFields(form.name));
            
            // Only push forms with fields
            if (form.formFields.length > 0) {
              forms.push(form);
            }
            
        } catch (error) {
            console.error(`Error processing file ${file}:`, error);                   
        }                    
      }
  }

  return forms;
};



/** todo: Remove to Utils repo  */
export function findPdfFile(pdfFiles: PdfForm[], name: string): PdfForm {
  return pdfFiles.find((file) => file.name === name) as PdfForm;
}