// app/api/email/sendEmail.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

interface MailOptions {
  sendTo: string;
  pdfDoc: any;
}

/**
 * 
 * Add provider to subject email
 */
export async function sendEmail({ sendTo, pdfDoc }: MailOptions): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: sendTo,
    subject: 'Your PDF Document',
    text: 'Please find your PDF document attached.',
    attachments: [
      {
        filename: 'form-data.pdf',
        content: pdfDoc,
        encoding: 'base64',
      },
    ],
  };
  try {
    const info = await transporter.sendMail(mailOptions);    
  } catch (mailError) {
    console.error('Error sending email:', mailError);
    throw new Error('Failed to send email');
  }
}
