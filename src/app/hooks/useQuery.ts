import { useQuery, useMutation, UseQueryResult, UseMutationResult, useQueries, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { FetchOptions, QueryConfig } from "../utils/types";

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

export const useMultiFetch = <T extends unknown[]>(queries: QueryConfig<T[number]>[]) => {    
    const queryResults = useQueries({
        queries: queries.map(({ key, path, options }) => ({
            queryKey: [key, path],
            queryFn: () => fetchData<T[number]>(path),
            ...options, // Spread additional options like `enabled`, `retry`, etc.
        })),
    }) as UseQueryResult<T[number]>[];

    // Derived global states for loading and error
    const isLoading = queryResults.some((result) => result.isLoading);
    const isError = queryResults.some((result) => result.isError);

    // Extracting data in a consistent shape
    const data = queryResults.map((result) => result.data ?? null);

    return { queryResults, isLoading, isError, data };
};


// Function to handle POST requests (send data)
const postData = async <T, R>(path: string, payload: T): Promise<R> => {
    const { data } = await axios.post(`/api/${path}`, payload);
    return data;
};

export const usePost = <T, R = any>(
    path: string,
    mutationKey: string | string[], // mutationKey for invalidating queries
    onSuccess?: (data: R) => void,
    onError?: (error: AxiosError) => void
): UseMutationResult<R, AxiosError, T> => {
    const queryClient = useQueryClient();

    return useMutation<R, AxiosError, T>({
        mutationFn: (payload: T) => postData<T, R>(path, payload),
        onSuccess: (data) => {
            // Invalidate the query using the mutationKey
            queryClient.invalidateQueries({
                queryKey: Array.isArray(mutationKey) ? mutationKey : [mutationKey],
            });

            // Call the optional onSuccess callback
            onSuccess?.(data);
        },
        onError: (error) => {
            // Call the optional onError callback
            onError?.(error);
        },
    });
};


// Function to handle PATCH requests (update data)
const patchData = async <T, R>(path: string, payload: T): Promise<R> => {
    const { data } = await axios.patch(`/api/${path}`, payload);
    return data;
};

export const usePatch = <T, R = any>(
    path: string,
    mutationKey: string | string[], // mutationKey for invalidating queries
    onSuccess?: (data: R) => void,
    onError?: (error: AxiosError) => void
): UseMutationResult<R, AxiosError, T> => {
    const queryClient = useQueryClient();

    return useMutation<R, AxiosError, T>({
        mutationFn: (payload: T) => patchData<T, R>(path, payload),
        onSuccess: (data) => {
            // Invalidate the query using the mutationKey
            queryClient.invalidateQueries({
                queryKey: Array.isArray(mutationKey) ? mutationKey : [mutationKey],
            });

            // Call the optional onSuccess callback
            onSuccess?.(data);
        },
        onError: (error) => {
            // Call the optional onError callback
            onError?.(error);
        },
    });
};
