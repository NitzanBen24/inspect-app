import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import fontkit from '@pdf-lib/fontkit';
import { FormField, PdfForm } from '../models/models';


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
              const pdfDoc = await PDFDocument.load(existingPdfBytes);                                          
              const pdfForm = pdfDoc.getForm();  
              
              if (pdfForm) {
                form.formFields = pdfForm.getFields().map((item) => ({
                  name: item.getName(),
                  type: item.constructor.name.replace('PDF', ''),
                  require: item.isRequired(),
                }));
              }
      
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

// insert user data to pdf file
export const preparePdf = async (file: PdfForm) => {

  try {
    // Path to your existing PDF template
    const pdfPath = path.resolve('./public/templates/'+file.name+'.pdf');
    const existingPdfBytes = await fs.promises.readFile(pdfPath);

    // Load the PDFDocument from the existing PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Register fontkit to use custom fonts
    pdfDoc.registerFontkit(fontkit);

    // Load the Noto Sans Hebrew font from your local path
    const fontPath = path.resolve('./src/app/fonts/OpenSans-VariableFont_wdth,wght.ttf');
    const fontBytes = fs.readFileSync(fontPath);

    // Embed the custom Hebrew font in the PDF
    const hebrewFont = await pdfDoc.embedFont(fontBytes);    

    // Get the form and fill fields
    const form = pdfDoc.getForm();

    // insert data to pdf file
    form.getFields().map((field) => {
      let formField = file.formFields.find((item: FormField) => item.name === field.getName());
      
      let fieldText = formField?.value || '';      

      form.getTextField(field.getName()).setText(fieldText);
      if (containsHebrew(fieldText)) {                
        if (containsDigits(fieldText)) {          
          form.getTextField(field.getName()).setText(reverseNumbersInHebrewText(fieldText));
        }        
        form.getTextField(field.getName()).updateAppearances(hebrewFont);
      }             

    });
 
    const comments = file.formFields.find((item: FormField) => item.name === 'comments');    
    if (comments && comments.value) {
      const lastPage = pdfDoc.getPage(pdfDoc.getPages().length-1);
      const pageSize = lastPage.getSize();
      lastPage.setFont(hebrewFont);
      lastPage.drawText(comments.value, {
        x: pageSize.width - 100,
        y: pageSize.height - 200,
        size: 12,
      });
    }

    // Flatten the form fields (make them uneditable)
    form.flatten();
    // Save the edited PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (pdfError) {
    //console.error('Error generating PDF=>', pdfError);
    return { error: pdfError };     
  }
};

const containsHebrew = (text: string) => /[\u0590-\u05FF]/.test(text);

const containsDigits = (text: string) => /\d/.test(text);

const reverseNumbersInHebrewText = (text: string) => {
  // Detect all digit sequences in the text and reverse them
  return text.replace(/\d+/g, (match) => match.split('').reverse().join(''));
};


