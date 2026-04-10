export interface CategoryInfo {
  slug: string;
  name: string;
  url: string;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Request to ${url} failed with status ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

export async function fetchCategories(): Promise<CategoryInfo[]> {
  return getJson<CategoryInfo[]>('https://dummyjson.com/products/categories');
}
