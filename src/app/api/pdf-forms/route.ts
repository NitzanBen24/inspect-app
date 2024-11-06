import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/services/emailService';
import { preparePdf, getAllForms } from '@/app/services/pdfService';

export async function POST(req: NextRequest) {
  try {   

    const form = await req.json();
    if (!form) {
      return NextResponse.json({ error: 'Missing form to send!' }, { status: 400 });
    }

    // Generate PDF file
    let pdfDoc;
    try {
      pdfDoc = await preparePdf(form);
    } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    } 

    // Send email
    try {
      // Alpha version =>
      let clientEmail = 'nitzanben24@gmail.com';
      await sendEmail({ sendTo: clientEmail, pdfDoc: pdfDoc });
      return NextResponse.json({ success: 'PDF sent via email:'  }, { status: 200 });
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

export const GET = async (req: NextRequest) => {
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


