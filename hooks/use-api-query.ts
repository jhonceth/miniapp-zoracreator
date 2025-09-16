import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface UseApiQueryOptions<TData, TBody = unknown>
  extends Omit<UseQueryOptions<TData>, "queryFn"> {
  url: string;
  method?: HttpMethod;
  body?: TBody;
  isProtected?: boolean;
  enabled?: boolean;
}

export const useApiQuery = <TData, TBody = unknown>(
  options: UseApiQueryOptions<TData, TBody>
) => {
  const {
    url,
    method = "GET",
    body,
    isProtected = false,
    enabled = true,
    ...queryOptions
  } = options;

  return useQuery<TData>({
    ...queryOptions,
    queryFn: async () => {
      console.log(`🔍 API Query: ${method} ${url}`, { isProtected, body });
      
      const response = await fetch(url, {
        method,
        headers: {
          ...(body && { "Content-Type": "application/json" }),
        },
        ...(isProtected && {
          credentials: "include",
        }),
        ...(body && { body: JSON.stringify(body) }),
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error: ${response.status}`, errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ API Success:`, data);
      return data;
    },
  });
};
