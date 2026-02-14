import { apiClient } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import {
  ContentCategory,
  PlaceListItem,
  ProductListItem,
  RecipeListItem,
  UnifiedContentItem,
} from '@culyn/shared/schemas';
import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 20;

function mapRecipes(recipes: RecipeListItem[]): UnifiedContentItem[] {
  return recipes.map((r) => ({
    id: r.id,
    slug: r.slug,
    category: 'RECIPE' as ContentCategory,
    title: r.title,
    imageUrl: r.imageUrl ?? null,
    isFavorited: r.RecipeFavorite?.length > 0,
    createdAt: new Date().toISOString(),
    cookTime: r.cookTime ?? null,
    calories: r.calories ?? null,
  }));
}

function mapPlaces(places: PlaceListItem[]): UnifiedContentItem[] {
  return places.map((p) => ({
    id: p.id,
    slug: p.slug,
    category: 'PLACE' as ContentCategory,
    title: p.name,
    imageUrl: p.imageUrl ?? null,
    isFavorited: false,
    createdAt: new Date().toISOString(),
    city: p.city ?? null,
    placeType: p.type ?? null,
  }));
}

function mapProducts(products: ProductListItem[]): UnifiedContentItem[] {
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    category: 'PRODUCT' as ContentCategory,
    title: p.name,
    imageUrl: p.imageUrl ?? null,
    isFavorited: false,
    createdAt: new Date().toISOString(),
    brand: p.brand ?? null,
    price: p.price ?? null,
  }));
}

export interface UnifiedContentFilters {
  [key: string]: string | number | undefined;
}

export function useUnifiedContent(
  category?: ContentCategory,
  filters?: UnifiedContentFilters | null,
) {
  const { data: session } = authClient.useSession();

  const query = useInfiniteQuery({
    queryKey: ['v1', 'unified-content', category, filters],
    queryFn: async ({ pageParam = 0 }) => {
      const results: UnifiedContentItem[] = [];
      const fetches: Promise<void>[] = [];
      const extraParams = filters ?? {};

      if (!category || category === 'RECIPE') {
        fetches.push(
          apiClient()
            .get<RecipeListItem[]>('/recipes', {
              params: { limit: PAGE_SIZE, offset: pageParam, ...extraParams },
            })
            .then((r) => {
              results.push(...mapRecipes(r.data));
            })
        );
      }

      if (!category || category === 'PLACE') {
        fetches.push(
          apiClient()
            .get<PlaceListItem[]>('/places', {
              params: { limit: PAGE_SIZE, offset: pageParam, ...extraParams },
            })
            .then((r) => {
              results.push(...mapPlaces(r.data));
            })
        );
      }

      if (!category || category === 'PRODUCT') {
        fetches.push(
          apiClient()
            .get<ProductListItem[]>('/products', {
              params: { limit: PAGE_SIZE, offset: pageParam, ...extraParams },
            })
            .then((r) => {
              results.push(...mapProducts(r.data));
            })
        );
      }

      await Promise.all(fetches);

      results.sort(
        (a, b) =>
          new Date(b.createdAt as string).getTime() -
          new Date(a.createdAt as string).getTime()
      );

      return results;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.flat().length;
    },
    enabled: !!session?.user?.id,
    retry: 1,
  });

  const items = query.data?.pages.flat();

  return {
    items,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
