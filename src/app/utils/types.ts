import { UseQueryOptions } from "@tanstack/react-query";

export interface FormField {
    name: string;
    type: string;
    require: boolean;
    value?:string;
}

export interface PdfForm {
    name: string;
    formFields: FormField[];
    status: string;
    id?: string;
    userId?: string;
    userName?: string;
    created?: any;
}

export type FormState = {
    [key: string]: string; // Dynamic key-value pairs for each form input
}

export type FieldsObject = {
    [key: string]: string; // Dynamic key-value pairs for each form input
}

export interface FormListObject {
    [key: string]: PdfForm[]; // Assuming key is the record status (saved, pending)
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

export type FetchOptions = {
    enabled?: boolean;
    retry?: boolean | number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at?: string;
    isLoggedIn?: boolean; 
}

interface UserAuthorize {
    id: number;
    email: string;
    created_at?: string;
    isLoggedIn?: boolean;
    iat?: string;
    exp?: string;
}

export interface AuthResponse {
    message: string;
    user: User;
}

export interface AuthFail {
    error: string;
}

export type ApiPostResponse = {
    success?: string;
    error?: string;
}

export type ErrorResponse = {
    error: string;
  };


export interface EmailInfo {
    customer?: string;
    provider?: string;
    message?: string;
    reciver?: string;
}

export interface ListOption {
    val: string;
    id?: number;
}

export type QueryConfig<T> = {
    key: string;
    path: string;
    options?: Omit<UseQueryOptions<T, Error, T>, "queryKey" | "queryFn">;
};