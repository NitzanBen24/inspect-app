import { FormField } from "./types";


// Function to check if specific fields exist and have a non-empty value
export const elementsWithValueExist = (array: FormField[], fieldNames: string[]): boolean => {
    return fieldNames.every((fieldName) => {
        const field = array.find((item) => item.name === fieldName);
        return field?.value !== undefined && field.value.trim() !== ''; // Ensure value is non-empty
    });
};

export const getHebrewFormName = (fileName: string) : string => {
    const names: any = {inspection: 'בדיקה', elevator: 'מעליות', charge: 'טעינה'};

    return names[fileName] || '';
}

export const getEnglishFormName = (fileName: string) : string => {
    const names: any = { בדיקה: 'inspection', מעליות: 'elevator', טעינה: 'charge'};

    return names[fileName] || '';
}

export const getTableName = (fileName: string) : string => {
    const names: any = { בדיקה: 'inspection_forms', מעליות: 'equipment_forms', טעינה: 'equipment_forms'};

    return names[fileName] || '';
}


export function validatePDFResult(pdfFiles: any): any {
    if ('error' in pdfFiles) {
        throw new Error(`Failed to get pdfFiles: ${pdfFiles.error}`);
    }
    return pdfFiles;
}


export const getHebrewString = (str: string): string => {
    const options: Record<string, string> = 
      {
        files: 'בחר טופס',
        saved: 'שמורים',
        pending: 'מחכים לחיוב',
        sent: 'נשלחו לחיוב',
        inspection: 'בדיקה',
        storage: 'אגירה',
        charge: 'טעינה',
        elevator: 'מעליות',
        archvie: 'ארכיון'
      }
  
    return options[str];
  }

  export const isEmptyProps = (obj: Record<string, any>): boolean =>  Object.values(obj).every(value => !value);