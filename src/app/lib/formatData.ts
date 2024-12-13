import { FieldsObject, FormField, PdfForm } from "../utils/types";

export const formToFields = (data:{payload: PdfForm, userId: string,userName: string, status: string}): FieldsObject[] => {

    const excludedFields = ["ephone", "eemail", "elicense", "pphone", "pemail", "plicense"];
  
    const queryData: FieldsObject = data.payload.formFields
      .filter((field) => field.require === true || excludedFields.includes(field.name))
      .reduce((obj: any, field) => {
        const fieldName = field.name.includes("-ls") ? field.name.replace("-ls", "") : field.name;
        obj[fieldName] = field.value || ''; 
        return obj;
    }, {});
  
    queryData.name     = data.payload.name;
    queryData.userid   = data.userId;
    queryData.userName = data.userName;
    queryData.status   = data.status;
    
    return [queryData];
  
  }
  
  export const fieldsToForm = (records: FieldsObject[], form: PdfForm): PdfForm[] => {
    return records.map((record) => {
  
      if (!form) {
        return {
          name: record.name,
          formFields: [],
          status: 'unknown',
          id: record.id,
        };
      }
  
      const formFields: FormField[] = form.formFields.map((formField) => { 
        const recordFieldValue = record[formField.name.replace('-ls','')];         
        return {
          ...formField,
          value: recordFieldValue || '', // Default to empty string if no value in the record
        };
      });
      
      return {
        name: form.name,
        formFields: formFields,
        status: record.status,
        id: record.id,
        userId: record.userid,
        userName: record.userName,
        created: record.created_at,
      };
    });
  };