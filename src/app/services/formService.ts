import { NextResponse } from "next/server";
import { addNewForm, getFormById, updateForm } from "../lib/dbObject";//formToFields,
import { EmailInfo, FieldsObject } from "../utils/types";
import { prepareEmail, sendEmail } from "./emailService";
import { preparePdf } from "./pdfService";
import { formToFields } from "../lib/formatData";

export const handleFormSubmit = async (data: any): Promise<{ success: boolean; message: string; data?:any; error?: unknown }> => {
    try {
        if (!data?.form) {
            return { success: false, message: "Missing form data", error: "Invalid input" };
        }

        const fields: FieldsObject[] = formToFields({
            payload: data.form,
            userId: data.userId,
            userName: data.userName,
            status: data.form.status,
        });
        
        let dbResult;
        if (!data.form.id) {
            dbResult = await addNewForm(fields);
        } else {
            const existingForm = await getFormById(data.form.id);
            if (existingForm.error) {
                dbResult = await addNewForm(fields);
            } else {
                dbResult = await updateForm(data.form.id, fields);
            }
        }

        if (dbResult?.error) {
            return { success: false, message: "Database operation failed", error: dbResult.error };
        }

        let message = ".הפרטים נשמרו בהצלחה";

        if (data.sendMail) {         

            const pdfDoc = await preparePdf(data.form);
            const emailOptions: EmailInfo | undefined = prepareEmail(data.form.formFields);

            if (!emailOptions) {
                return { success: false, message: "Send email failed", error: "Missing email options" };
            }

            await sendEmail({ pdfFile: pdfDoc, options: emailOptions });            
            message += "הטופס נשלח";
        }

        return { success: true, message , data};
    } catch (error) {
        console.error("Error in handleFormSubmit:", error);
        return { success: false, message: "An unexpected error occurred", error };
    }
};


