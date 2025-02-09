import { NextResponse } from "next/server";
import { addNewForm, getActiveForms, getFormById, getActiveFormsByUserId, updateForm, getSearchForms } from "../lib/db/forms";
import { EmailInfo, EmailResult, FieldsObject, FormData, PdfForm, SearchData } from "../utils/types";
import { prepareEmail, sendEmail } from "./emailService";
import { findPdfFile, getAllPDF, getPDFs, preparePdf } from "./pdfService";
import { fieldsToForm, formToFields, sanitizeFields } from "../lib/formatData";
import { getRole } from "../lib/db/users";
import { appStrings } from "../utils/AppContent";
import { getEnglishFormName, getHebrewFormName, getTableName, isEmptyProps, validatePDFResult } from "../utils/helper";
import sanitizeHtml from 'sanitize-html';

/** Remove to AppContent file */
const tableNamesMap: Record<string, string> = {inspection: 'inspection_forms', elevator: 'equipment_forms', charge: 'equipment_forms'}

function _addStorageForm(inspection: PdfForm, storage: PdfForm) {

    if (!inspection?.formFields?.length || !storage?.formFields?.length) {
        throw new Error("Invalid input: inspection or storage form fields are missing.");
    }

    // Create a lookup map for quick access to inspection values
    const inspectionLookup = Object.fromEntries(
        inspection.formFields.map((item) => [item.name.replace("-ls", ""), item.value])
    );
    
    // Extract batteries and capacity values only once
    const batteriesValue = parseFloat(
        inspection.formFields.find((field) => field.name === "batteries")?.value || "1"
    );
    const capacityValue = parseFloat(inspectionLookup["capacity"] || "0");
    
    // Pre-fetch bmanufacture and convertor values
    const bmanufactureValue = inspectionLookup["bmanufacture"] || "";
    const convertorValue = inspectionLookup["convertor"] || "";

    // Map storage fields with optimized logic
    const updatedSmallArray = storage.formFields.map((field) => {
        switch (field.name) {
            case "bmanufacture":
            case "convertor":
                return {
                    ...field,
                    value: bmanufactureValue || convertorValue || field.value,
                };
            case "capacity":
                return {
                    ...field,
                    value: `${(capacityValue * batteriesValue).toFixed(2)} KW`,
                };
            case "cpower":
                return {
                    ...field,
                    value: `${inspectionLookup[field.name] || field.value} KW`,
                };
            default:
                return {
                    ...field,
                    value: inspectionLookup[field.name] || field.value,
                };
        }
    });

    return updatedSmallArray;
}

function _getExcludedFields(formName: string): string[] {
    if (formName === "inspection") {
        return ["ephone", "eemail", "elicense", "pphone", "pemail", "plicense"];
    }
    return [];
}

async function _getUserActiveForms(userId: string, role: string, pdfFiles: PdfForm[]) {
    // Determine active forms based on role
    const activeInspection = (role === 'admin') 
        ? await getActiveForms('inspection_forms') 
        : await getActiveFormsByUserId(userId, 'inspection_forms');
    
    const activeEquipment = (role === 'supervisor') 
        ? await getActiveForms('equipment_forms') 
        : await getActiveFormsByUserId(userId, 'equipment_forms');
    
    // Filter active equipment into categories
    const equipmentCategories = ['charge', 'elevator'];
    const categorizedEquipment = equipmentCategories.map((category) => ({
        name: category,
        forms: activeEquipment.filter((item) => item.name === category),
    }));

    // Map fields to forms
    const forms = [
        ...fieldsToForm(activeInspection, findPdfFile(pdfFiles, 'inspection')),
        ...categorizedEquipment.flatMap(({ name, forms }) => 
            fieldsToForm(forms, findPdfFile(pdfFiles, name))
        ),
    ];

    return forms;
}

async function _saveData (form: PdfForm, fields:FieldsObject) {
    if (!form.id) {
        return await addNewForm(fields, tableNamesMap[form.name]);            
    } else {
        const existingForm = await getFormById(form.id, tableNamesMap[form.name]);
        if (existingForm.error) {
            return await addNewForm(fields, tableNamesMap[form.name]);
        } else {
            return await updateForm(form.id, fields, tableNamesMap[form.name]);
        }
    }
}

/** todo: Refactor => theres a lot of await, await in await | await in a map loop */
async function _prepareToSend (data: any): Promise<EmailInfo> {

    const pdfForms : PdfForm[] = [data.form];     
    //check for storage form
    if (data.hasStorageForm.current) {                
        const storageForms = await getPDFs(['storage']);                   
        storageForms[0].formFields = _addStorageForm(data.form, storageForms[0]);                                                        
        pdfForms.push(storageForms[0]);          
    }           
                        
    // Prepare PDF documents concurrently
    const pdfDocs = await Promise.all(pdfForms.map((form) => preparePdf(form)));            
    const { role } = (pdfForms[0].userId) ? await getRole(pdfForms[0].userId) : 'admin';
    const email = prepareEmail(pdfForms[0].formFields, role, pdfForms[0].name);
    email.attachments = pdfDocs;
    
    return email;
}


const _getQueryFields = (obj: Record<string, any>): Record<string, any> => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value) // Filter non-empty values
    );
  };

export async function getFormsDataByUserId(userId : string): Promise<any> {

    try {
        
        const { role } = await getRole(userId);
        
        if (!role) {
            return { success: false, message: 'User role was not found!' };
        }

        const pdfFiles = validatePDFResult(await getAllPDF());        
        const activeForms = await _getUserActiveForms(userId, role, pdfFiles);

        return { pdfFiles, activeForms };

    } catch (error) {
        console.error("Error in fetching data:", error);
        return { success: false, message: error };
    }

}

export async function handleFormSubmit(data: FormData): Promise<{ success?: boolean; message: string; data?:any; error?: unknown }> {
    try {
        
        if (!data?.form) {
            return { message: "Missing form data", error: "Invalid input" };
        }        
                
        const excludedFields = _getExcludedFields(data.form.name);

        // Prepare data to DB
        const fields: FieldsObject = formToFields(
            {
                form: data.form,
                userId: data.userId,
                userName: data.userName, // todo: change userName to username
                status: data.form.status,
            },
            excludedFields,
        );

        const sanitazedFields = sanitizeFields(fields);        

        // DB actions
        const dbResult = await _saveData(data.form, sanitazedFields);        

        let msg = appStrings.dataSaved;        
        let emailResult: EmailResult = { success: true, message: "" };

        if (data.sendMail) {
            const email = await _prepareToSend(data);
            emailResult = await sendEmail({ email });
            msg += emailResult.message;            
        }
        
        if (dbResult?.error || (data.sendMail && emailResult.error)) {
            return {                
                message: dbResult?.error ? appStrings.dataSavedError : emailResult.message,
                error: dbResult?.error || emailResult.error,
            };
        }                

        return { message: msg };

    } catch (error) {
        console.error("Error in handleFormSubmit:", error);
        return { success: false, message: "An unexpected error occurred", error };
    }
};

export async function searchForms(query: SearchData): Promise<{ message?: string; data?:any; error?: unknown }>  {
    
    try {

        if (!query || isEmptyProps(query)) {
            return { message: "Missing search fields", error: "Missind fields" };
        }
          
        const queryFields = _getQueryFields(query);
                
        const tableName = query.name ? getTableName(query.name) : 'inspection_forms';
        if (query.name) {            
            queryFields.name = getEnglishFormName(query.name);           
        } else {
            queryFields.name = 'inspection';
        }          
        
        const records = await getSearchForms(queryFields, tableName);

        const pdfFiles = validatePDFResult(await getAllPDF());
        const foundForms =  fieldsToForm(records, findPdfFile(pdfFiles, queryFields.name))

        return { data: foundForms };
    } catch (error) {
        console.error("Error in search forms:", { error, query });  
        return { message: error instanceof Error ? error.message : "An unexpected error occurred", error };
    }
    
    
}