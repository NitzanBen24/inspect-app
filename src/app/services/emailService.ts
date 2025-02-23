// app/api/email/sendEmail.ts
import nodemailer from 'nodemailer';
import { EmailInfo, FormField } from '../utils/types';
import { appStrings, sysStrings } from '../utils/AppContent';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

interface MailOptions {
  email: EmailInfo;  
}

/** todo: consider make this private */
export const prepareEmail = (fields: FormField[], role: string, formName: string): EmailInfo => {
  
  const options: EmailInfo = {};  
  const emailFields = ['customer', 'provider', 'message', 'reciver'];

  fields.forEach((item) => {
    if (emailFields.includes(item.name as keyof EmailInfo) && item.value) {
      const key = item.name as keyof EmailInfo;
      options[key] = item.value as any;
    }
  });

  // Alpha version => Testing  
  options.reciver = (role === 'admin' || formName === 'inspection') ? 'hazanreport@gmail.com' : 'tcelctric@gmail.com';
  const reciverField = fields.find((item) => item.name === 'reciver');
  if (reciverField) {    
    options.reciver = 'nitzanben24@gmail.com';
  }
  
  // Return the final EmailInfo object 
  return options;
};

// todo: remove success is uneccessary => you can check with error
export async function sendEmail({ email }: MailOptions): Promise<{ success: boolean; message: string; response?: any; error?: unknown }> {
  
  if (!email.reciver || !email.customer || !email.attachments) {
    const error = sysStrings.email.failedMessage + sysStrings.email.missingInfo;
    console.error(error);
    return { success: false, message: error, error };
  }

  const attachments = email.attachments.map((item, index) => ({
    filename: `${email.customer}${(index === 0) ? '' : index}.pdf`,
    content: item,
    encoding: 'base64',
  }));

  const options = {
    from: process.env.EMAIL_USER,
    to: email.reciver,
    subject: email.provider || '',
    text: email.message || '',
    attachments,
  };

  try {

    const emailResponse = await transporter.sendMail(options);        

    //LOGS
    console.info(sysStrings.email.successMessage)

    return { success: true, message: appStrings.dataSaved +' '+ appStrings.email.success, response: emailResponse };
    
  } catch (mailError) {

    console.error(sysStrings.email.failedMessage, mailError);
    return { success: false, message: appStrings.email.failed, error: mailError };

  }
}
