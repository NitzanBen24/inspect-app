import { NextRequest, NextResponse } from 'next/server';
import { prepareEmail, sendEmail } from '@/app/services/emailService';
import { preparePdf, getAllPDF } from '@/app/services/pdfService';
import { EmailInfo, FieldsObject, PdfForm } from '@/app/utils/types';
import { addNewForm, getForms } from '@/app/lib/dbObject';
import { fieldsToForm, formToFields } from '@/app/lib/formatData';


export async function POST(req: NextRequest): Promise<NextResponse> {
  try {   

    const data = await req.json();
    if (!data || !data.form) {
      return NextResponse.json({ error: 'Missing form fields to send!' }, { status: 400 });
    }

    //save form
    const fields: FieldsObject[] = formToFields({payload:data.form, userId: data.userId, userName: data.userName, status: data.status});
    const queryResult = await addNewForm(fields);    
    const pdfDoc = await preparePdf(data.form);

    // Send email
    try {

      
      const emailOptions: EmailInfo | undefined = prepareEmail(data.form.formFields);
      
      if (emailOptions === undefined) {
        return NextResponse.json({ error: 'Send email failed: Missing Email Options' }, { status: 500 });
      }        

      await sendEmail({ pdfFile: pdfDoc, options: emailOptions});      
      return NextResponse.json({ success: 'Form has been sent successfuly:' }, { status: 200 });
    } catch (mailError) {
      console.error('Route.Error sending email:', mailError);
      return NextResponse.json({ error: 'Post.send.email: ' + mailError }, { status: 500 });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Server-side error:', error.message);
      return NextResponse.json({ error: 'An unknown error occurred', details: error.message }, { status: 500 });
    }
    console.error('Unknown error:', error);
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const forms = await getAllPDF();     
    // Check if the service returned an error object
    if ('error' in forms) {
      return NextResponse.json({ error: forms.error }, { status: 500 });
    }

    const formFields = await getForms();     
        
    // Check if the service returned an error object
    if ('error' in formFields) {
        return NextResponse.json({ error: formFields.error }, { status: 500 });
    }

    const inspectionForm = forms.find((form) => form.name === 'inspection') || [];
  
    const records = fieldsToForm(formFields, inspectionForm as PdfForm)
    // Successful response with forms data
    return NextResponse.json({ forms, records });
  } catch (error) {
    console.error('Error loading PDF template:', error);
    return NextResponse.json({ error: 'Failed to load PDF file' }, { status: 500 });
  }
} 


