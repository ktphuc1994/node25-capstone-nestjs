export const pagiRes = (
  currentPage: number,
  itemPerPage: number,
  totalItems: number,
  items: any,
) => ({
  currentPage,
  itemPerPage,
  totalPages: Math.ceil(totalItems / itemPerPage),
  totalItems,
  items,
});
