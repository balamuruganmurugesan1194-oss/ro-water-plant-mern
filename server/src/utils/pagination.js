export const getPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || 25, 1),
    100,
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
