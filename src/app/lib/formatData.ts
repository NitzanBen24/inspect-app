import { FieldsObject, FormField, PdfForm } from "../utils/types";

export const formToFields = (data: any,excludedFields: string[]): FieldsObject[] => {
  
  const queryData: FieldsObject = data.form.formFields
    .filter((field: FormField) => field.require === true || excludedFields.includes(field.name))
    .reduce((obj: any, field: FormField) => {
      const fieldName = field.name.includes("-ls") ? field.name.replace("-ls", "") : field.name;
      obj[fieldName] = field.value?.replace(/\u200F/g, '') || ''; 
      return obj;
  }, {});
  
  queryData.name      = data.form.name;
  queryData.userid    = data.userId;    
  queryData.status    = data.status;
  queryData.user_name = data.userName;

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
      name: record.name,
      formFields: formFields,
      status: record.status,
      id: record.id,
      userId: record.userid,
      userName: record.user_name,
      created: record.created_at,
    };
  });
};