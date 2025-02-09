import { formFieldMap } from "@/app/utils/AppContent";
import { elementsWithValueExist } from "@/app/utils/helper";
import { FieldsObject, FormField } from "@/app/utils/types";


// Utility function to get today's date in the format yyyy month (Hebrew) dd
export const formatHebrewDate = () => {
    const monthsHebrew = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    const today = new Date();
    const yy = today.getFullYear().toString(); 

    const mmHText = monthsHebrew[today.getMonth()];
    const dd = today.getDate().toString();
    
    return yy + "  " + mmHText + "  " + dd;
};

// Calculate power value => move to server
export const calcPower = (formNode:HTMLDivElement | null): number | false => {
    if (!formNode) return false;
    
    const modelNode = formNode.querySelector<HTMLInputElement>("[name='pmodel']");
    const unitNode = formNode.querySelector<HTMLInputElement>("[name='punits']");

    if (!modelNode || !unitNode) {     
        console.error('Model or Unit field not found');       
        return false;
    }

    const modelValue = parseFloat(modelNode.value);
    const unitValue = parseFloat(unitNode.value);
    const result = (unitValue * modelValue * 0.001).toFixed(2);
    return !isNaN(modelValue) && !isNaN(unitValue) ? parseFloat(result) : false;
    
}

// Bad function name
export const addInspectionFields = (formFields: FormField[], formRef: React.MutableRefObject<HTMLDivElement | null>): FieldsObject[] => {

    let addFields = [];

    // If mcurrent & rcurrent are filled add check and scurrent to formFields
    if (elementsWithValueExist(formFields,['mcurrent', 'rcurrent'])) {
        addFields.push({['check']: '*'}, {['scurrent']: '300'});             
    }

    //checkVoltage
    if (!elementsWithValueExist(formFields,['volt-n', 'volt-l'])) {
        addFields.push({['irrelavent']: '*'}, {['zero']: ''}, {['propper']: ''});            
    } else {
        addFields.push({['propper']: '*'}, {['zero']: '0'});            
    }

    let ocheckNode = formRef.current?.querySelector<HTMLInputElement>('[name="ocheck"]');       
    if (ocheckNode && ocheckNode.checked) {            
        addFields.push({['opass']: 'תקין'});            
    } else {            
        addFields.push({['ofail']: '*'});                  
    }

    return addFields;
}

export const generateFormBlocks = (formFields: FormField[]) => {
    return Object.entries(formFieldMap).map(([key, value]) => {
        return {            
            name: key,
            fields: formFields.filter((field: any) => value.includes(field.name) && field.require)
        };
    });
};

export const isStorageForm = (block: FormField[]): boolean => {     
    return block.filter((field) => field.name === 'batteries' || field.name === 'capacity' || field.name === 'bmanufacture').some((item) => {
        if (item.value && item.value.length > 0) {                          
            return true;            
        }                       
        return false;
    });    
}

export const reverseDateDirection = (date: string) => {
    return date.split('-').reverse().join('-')
}