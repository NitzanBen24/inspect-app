import { FormField } from "./types";


export const isStorageForm = (block: FormField[]): boolean => {
     
    return block.filter((field) => field.name === 'batteries' || field.name === 'capacity' || field.name === 'bmanufacture').some((item) => {
        if (item.value && item.value.length > 0) {                          
            return true;            
        }                       
        return false;
    });
    
}

