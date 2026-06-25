"use client";

import { useQuery, type QueryKey } from "@tanstack/react-query";

type FetchService<TData, TParams> = (params: TParams) => Promise<TData>;

type UseFetchResult<TData, TError> = {
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  data: TData | undefined;
  error: TError | null;
  refetch: ReturnType<typeof useQuery<TData, TError>>["refetch"];
};

export const useFetch = <
  TData,
  TParams = Record<string, never>,
  TError = Error,
>(
  service: FetchService<TData, TParams>,
  name: string,
  dependencies: QueryKey = [],
  params = {} as TParams,
): UseFetchResult<TData, TError> => {
  const queryKey: QueryKey = ["data", name, params, ...dependencies];

  const { isLoading, isFetching, isError, isSuccess, data, error, refetch } =
    useQuery<TData, TError>({
      queryKey,
      queryFn: () => service(params),
    });

  return { isLoading, isFetching, isError, isSuccess, data, error, refetch };
};
