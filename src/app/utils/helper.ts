import { FormField } from "./types";


// Function to check if specific fields exist and have a non-empty value
export const elementsWithValueExist = (array: FormField[], fieldNames: string[]): boolean => {
    return fieldNames.every((fieldName) => {
        const field = array.find((item) => item.name === fieldName);
        return field?.value !== undefined && field.value.trim() !== ''; // Ensure value is non-empty
    });
};