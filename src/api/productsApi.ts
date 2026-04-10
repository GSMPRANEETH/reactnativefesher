import type { ProductsApiResponse } from '../types/product';

const BASE_URL = 'https://dummyjson.com/products';

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchProducts(options: {
  query: string;
  page: number;
  limit: number;
}): Promise<ProductsApiResponse> {
  const { query, page, limit } = options;
  const skip = Math.max(0, (page - 1) * limit);
  const normalized = query.trim();

  const url = normalized
    ? `${BASE_URL}/search?q=${encodeURIComponent(
        normalized,
      )}&limit=${limit}&skip=${skip}`
    : `${BASE_URL}?limit=${limit}&skip=${skip}`;

  return getJson<ProductsApiResponse>(url);
}
