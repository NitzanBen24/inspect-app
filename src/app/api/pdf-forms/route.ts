import { NextRequest, NextResponse } from 'next/server';
import { prepareEmail, sendEmail } from '@/app/services/emailService';
import { preparePdf, getAllForms } from '@/app/services/pdfService';
import { EmailInfo, PdfForm } from '@/app/utils/types';


export async function POST(req: NextRequest): Promise<NextResponse> {
  try {

    const form: PdfForm = await req.json();
    if (!form) {
      return NextResponse.json({ error: 'Missing form fields to send!' }, { status: 400 });
    }

    const pdfDoc = await preparePdf(form);

    // Send email
    try {

      
      const emailOptions: EmailInfo | undefined = prepareEmail(form.formFields);
      
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
    const forms = await getAllForms();     
    
    // Check if the service returned an error object
    if ('error' in forms) {
      return NextResponse.json({ error: forms.error }, { status: 500 });
    }

    // Successful response with forms data
    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error loading PDF template:', error);
    return NextResponse.json({ error: 'Failed to load PDF file' }, { status: 500 });
  }
} 


