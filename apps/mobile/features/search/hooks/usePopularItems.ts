import { apiClient } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import {
  ContentCategory,
  PlaceListItem,
  ProductListItem,
  RecipeListItem,
} from '@culyn/shared/schemas';
import { useQuery } from '@tanstack/react-query';

export interface PopularItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  category: ContentCategory;
}

function mapRecipePopular(recipes: RecipeListItem[]): PopularItem[] {
  return recipes.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.cookTime ? `${r.cookTime} min` : null,
    imageUrl: r.imageUrl,
    category: 'RECIPE' as ContentCategory,
  }));
}

function mapPlacePopular(places: PlaceListItem[]): PopularItem[] {
  return places.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.name ?? '',
    subtitle: p.city,
    imageUrl: p.imageUrl,
    category: 'PLACE' as ContentCategory,
  }));
}

function mapProductPopular(products: ProductListItem[]): PopularItem[] {
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.name ?? '',
    subtitle: p.brand,
    imageUrl: p.imageUrl,
    category: 'PRODUCT' as ContentCategory,
  }));
}

export function usePopularItems(category: ContentCategory) {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: ['v1', 'popular-items', category],
    queryFn: async () => {
      const params = { sortBy: 'popular', limit: 5, offset: 0 };

      switch (category) {
        case 'RECIPE': {
          const res = await apiClient().get<RecipeListItem[]>(
            '/recipes',
            { params },
          );
          return mapRecipePopular(res.data);
        }
        case 'PLACE': {
          const res = await apiClient().get<PlaceListItem[]>(
            '/places',
            { params },
          );
          return mapPlacePopular(res.data);
        }
        case 'PRODUCT': {
          const res = await apiClient().get<ProductListItem[]>(
            '/products',
            { params },
          );
          return mapProductPopular(res.data);
        }
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  });
}
