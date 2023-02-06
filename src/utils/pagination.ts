export const ITEMS_PER_PAGE = 10;

export const parsePaginationResponse = (
  data: any[],
  page: number,
  totalCount: number
) => {
  const lastPage = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return {
    data: data,
    previous: page > 1 ? page - 1 : null,
    next: page < lastPage ? page + 1 : null,
    lastPage: lastPage,
    totalCount: totalCount,
  };
};
