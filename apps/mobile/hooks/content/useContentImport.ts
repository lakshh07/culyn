import { apiClient } from '@/lib/api';
import { ImportContentResponse } from '@culyn/shared/schemas';
import { useMutation } from '@tanstack/react-query';

export function useContentImport() {
  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiClient().post<ImportContentResponse>(
        '/content/import',
        { url }
      );
      return response.data;
    },
  });

  return {
    import: mutation.mutate,
    importAsync: mutation.mutateAsync,
    isImporting: mutation.isPending,
    jobId: mutation.data?.jobId,
    error: mutation.error,
    reset: mutation.reset,
  };
}
