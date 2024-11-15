import { useQuery, useMutation, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { FetchOptions } from "../utils/types";

const fetchData = async <T>(path: string): Promise<T> => {
    try {
        const { data } = await axios.get(`/api/${path}`);
        return data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch data');
    }
};

export const useFetch = <T>(key: string, path: string, options?: FetchOptions): UseQueryResult<T> => {
    return useQuery({
        queryKey: [key, path], 
        queryFn: () => fetchData<T>(path),
        refetchOnWindowFocus: false,
        //enabled: Boolean(key && path),
        enabled: options?.enabled ?? true, // Default to true if not specified
        retry: 1,
    });
};

// Function to handle POST requests (send data)
const postData = async <T, R>(path: string, payload: T): Promise<R> => {
    const { data } = await axios.post(`/api/${path}`, payload);
    return data;
};

export const usePost = <T, R = any>(
    path: string,
    onSuccess?: (data: R) => void, 
    onError?: (error: AxiosError) => void 
): UseMutationResult<R, AxiosError, T> => {
    return useMutation<R, AxiosError, T>({
        mutationFn: (payload: T) => postData<T, R>(path, payload), 
        onSuccess, 
        onError,  
    });
};


