// app/api/email/sendEmail.ts
import nodemailer from 'nodemailer';
import { EmailInfo, FormField } from '../utils/types';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

interface MailOptions {
  pdfFile: any;
  options: EmailInfo;  
}

export const prepareEmail = (fields: FormField[]): EmailInfo | undefined => {
  
  const options: EmailInfo = {};  
  const emailFields = ['customer', 'provider', 'message', 'reciver'];
  
  fields.forEach((item) => {
    if (emailFields.includes(item.name) && item.value) {
      options[item.name as keyof EmailInfo] = item.value;
    }
  });

  // Alpha version => Testing
  options.reciver = 'hazanreport@gmail.com';//'tcelctric@gmail.com';
  const reciverField = fields.find((item) => item.name === 'reciver');
  if (reciverField) {    
    options.reciver = 'nitzanben24@gmail.com';
  }
  
  // Return the final EmailInfo object 
  return options;
};

// Send Email 
export async function sendEmail({ pdfFile, options }: MailOptions): Promise<void> {
  console.log('sendEmail.fileName::',options)

  if (!options.reciver || !options.customer) {
    console.error('Error sending email: file name or reciver is missing');
    throw new Error('Failed to send email: file name or reciver is missing!');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.reciver,
    subject: options.provider || '',
    text: options.message || '',
    attachments: [
      {
        filename: options.customer+'.pdf',
        content: pdfFile,
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
