export const PAGE_SIZE = 48;

export function paginate<T>(
  items: T[],
  page: number,
  pageSize = PAGE_SIZE
) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    pageApps: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
  };
}

export function totalPagesOf(
  totalItems: number,
  pageSize = PAGE_SIZE
) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}