import { PDFDocument as PDFLibDocument, PDFPage, PDFFont, TextAlignment, PDFImage, PDFForm } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import fontkit from '@pdf-lib/fontkit';
import { FormField, PdfForm } from '../utils/types';


const _containsHebrew = (text: string) => /[\u0590-\u05FF]/.test(text);
const _reverseEnglishAndNumbers = (text: string): string  => {
    return text.replace(/\b([^\u0590-\u05FF\s]+)\b/g, (match) => {
        return [...match].reverse().join('');
    });
}
const _containsDigits = (text: string) => /\d/.test(text);
const _reverseNumbersInHebrewText = (text: string) => text.replace(/\d+/g, (match) => match.split('').reverse().join(''));

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

      //also revese parentheses
      line = _reverseEnglishAndNumbers(line).replace(/[()]/g, (char) => (char === '(' ? ')' : '('));

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

    const words = text.split(' ')
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

const _loafPDF = async (path: string): Promise<PDFLibDocument> => {
    const existingPdfBytes = await fs.promises.readFile(path);
    return await PDFLibDocument.load(new Uint8Array(existingPdfBytes));                                          
}

const _embedToPngOrJpg = async (pdf: PDFLibDocument, images: any[]): Promise<PDFImage[]> => {
    
    const embedImages = [];
    for (const img of images) {

        if (!img.data) continue; // Skip if there's an error
    
        const fileType = img.data.type; // Extract MIME type
        if (fileType !== 'image/png' && fileType !== 'image/jpeg' && fileType !== 'image/jpg') {
            console.warn(`Skipping unsupported image type: ${fileType}`);
            continue;
        }
    
        const arrayBuffer = await img.data.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
    
        const image = fileType === 'image/png' 
            ? await pdf.embedPng(uint8Array) 
            : await pdf.embedJpg(uint8Array);
    
        embedImages.push(image);
    }        

    return embedImages;
    

    
}

const _addImagesToDoc = async (pdf: PDFLibDocument, lastPage: PDFPage, images: PDFImage[]) => {    
    
    try {
        const padding = 20; // Space from the top
        const imagesPerPage = 4; // Adjust as needed
        
        let currentPage: PDFPage | null = null;
        //Limit to 1 page with max 4 images inside
        for (let i = 0; i < images.length && i < 4; i++) {
            
            const image = images[i];            
            
            if (!image) continue;

            if (i % imagesPerPage === 0) {                                
                currentPage = pdf.addPage(lastPage);
            }
        
            const maxWidth = 260; // Adjust based on PDF size
            const originalWidth = image.width;
            const originalHeight = image.height;

            // Scale proportionally
            const scaleFactor = maxWidth / originalWidth;
            const newWidth = maxWidth;
            const newHeight = originalHeight * scaleFactor;

            const x = (i % 2) * 300 + 20; // Two columns        
            const y = 400 - Math.floor((i % imagesPerPage) / 2) * 300 - padding; // Adjust for padding

            currentPage?.drawImage(image, {
                x,
                y,
                width: newWidth,
                height: newHeight,
            });
        }
    } catch(error) {
        console.log('Error, could not add images to pdf:',error);                
    }
}

const _markInspectionResult = (pdfForm: PDFForm, pdfDoc: PDFLibDocument, fields: FormField[], bold: PDFFont) => {
    let statusField = fields.find((item: FormField) => item.name === 'status');
    if (statusField?.value) {      
        if (statusField.value == 'complete') {
            pdfForm.getTextField('approve').updateAppearances(bold);
        } else if ((statusField.value == 'incomplete')) {
            pdfForm.getTextField('decline').updateAppearances(bold);
            if (pdfDoc.getPages().length - 2) {
                pdfDoc.removePage(pdfDoc.getPages().length - 2)
            }        
        }
    }
}

const _fillPdfFields = async (pdfForm: PDFForm, pdfFormData: PdfForm, font: PDFFont) => {
    pdfForm.getFields().forEach((field) => {
        const fieldName = field.getName();
        const textField = pdfForm.getTextField(fieldName);

        if (!textField) return; // Ensure field exists before setting values

        let formField = pdfFormData.formFields.find((item: FormField) => item.name === fieldName);
        let fieldText = formField?.value || textField.getText() || '';

        const hasHebrew = _containsHebrew(fieldText);
        const hasDigits = _containsDigits(fieldText);

        if (hasHebrew && hasDigits) {
            fieldText = _reverseNumbersInHebrewText(fieldText);
        }

        textField.setText(fieldText);

        if (hasHebrew) {
            textField.setAlignment(TextAlignment.Right);
            textField.updateAppearances(font);
        } else {
            textField.setAlignment(TextAlignment.Left);
        }
    });
};

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
              const pdfDoc = await _loafPDF(filePath);              
              const pdfForm = pdfDoc.getForm();  
              
              if (pdfForm) {                 
                form.formFields = pdfForm.getFields().map((field) => {                   
                  const fieldName = field.getName();
                  const isDropDown = fieldName.endsWith('-ls');

                  return ({
                    name: fieldName,
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
export const preparePdf = async (pdfFormData: PdfForm): Promise<Uint8Array | { error: unknown }> => {

  try {
    // Load the original PDF with pdf-lib
    const pdfPath = path.resolve('./public/templates/'+pdfFormData.name+'.pdf');    
    const pdfDoc = await _loafPDF(pdfPath);
    
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
    const pdfForm = pdfDoc.getForm();

    _fillPdfFields(pdfForm, pdfFormData, hebrewFont);
 
    // only for ispections form
    if (pdfFormData.name === 'inspection') {    
        _markInspectionResult(pdfForm, pdfDoc, pdfFormData.formFields, boldFont)        
    }

    const pageCount = pdfDoc.getPageCount();    
    let lastPage: PDFPage | null = null;

    if (pageCount > 0) {
        [ lastPage ] =  await pdfDoc.copyPages(pdfDoc, [pageCount - 1]);        
    }
    
    if (pdfFormData.name !== 'storage') {        
        _addComments(pdfDoc, pdfFormData.formFields, hebrewFont);
    }
    
    if (pdfFormData.images && lastPage) {   
        const embedImages = await _embedToPngOrJpg(pdfDoc, pdfFormData.images);     
        if (embedImages.length > 0) {
            await _addImagesToDoc(pdfDoc,lastPage, embedImages)
        }        
    }
    
    //Make file read only
    //form.flatten();
    
    // Save the edited PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;

  } catch (pdfError) {
    console.error('Error generating PDF:', pdfError);
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
            const pdfDoc = await _loafPDF(filePath);
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

//export 


/** todo: Remove to Utils repo  */
export function findPdfFile(pdfFiles: PdfForm[], name: string): PdfForm {
  return pdfFiles.find((file) => file.name === name) as PdfForm;
}