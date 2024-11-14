export interface FormField {
    name: string;
    type: string;
    require: boolean;
    value?:string;
}

export interface PdfForm {
    name: string;
    formFields: FormField[];
}

export interface FormState {
    [key: string]: string; // Dynamic key-value pairs for each form input
}

export interface Manufacture {
    created_at: string;
    id: number;
    name: string;
    type: string;
}

export interface Technicians {
    created_at: string;
    id: number;
    name: string;
    email: string;
    employer: string;
    license: string;
    phone: string;
    profession: string;
}

export interface User {
    //{"userId":1,"email":"nitzanben24@gmail.com","iat":1731228502,"exp":1731833302}
}