
const buildWhere = (query) => {
  const where = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'object' && value !== null) {
      // Comparison operators: { gte: '5000' } → { gte: 5000 }
      where[key] = {};
      for (const [op, val] of Object.entries(value)) {
        if (!isNaN(val) && val !== '') {
          where[key][op] = Number(val);
        } else if (val === 'true') {
          where[key][op] = true;
        } else if (val === 'false') {
          where[key][op] = false;
        } else {
          where[key][op] = val;
        }
      }
    } else {
      if (value === 'true') where[key] = true;
      else if (value === 'false') where[key] = false;
      else if (!isNaN(value) && value !== '') where[key] = Number(value);
      else where[key] = value;
    }
  }
  return where;
};

const advancedResults = (prismaModel, include) => async (req, res, next) => {
  try {
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Build Prisma where clause from remaining query params
    const where = buildWhere(reqQuery);

    // Sort: "-createdAt,name" → [{ createdAt: 'desc' }, { name: 'asc' }]
    let orderBy = [{ createdAt: 'desc' }];
    if (req.query.sort) {
      orderBy = req.query.sort.split(',').map((field) => {
        if (field.startsWith('-')) {
          return { [field.slice(1)]: 'desc' };
        }
        return { [field]: 'asc' };
      });
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    const queryOptions = { where, orderBy, skip, take: limit };
    if (include) queryOptions.include = include;

    const [results, total] = await Promise.all([
      prismaModel.findMany(queryOptions),
      prismaModel.count({ where }),
    ]);

    // Filter selected fields post-query
    let data = results;
    if (req.query.select) {
      const fields = req.query.select.split(',');
      data = results.map((item) => {
        const obj = {};
        fields.forEach((f) => {
          if (item[f] !== undefined) obj[f] = item[f];
        });
        return obj;
      });
    }

    const pagination = {};
    if (skip + limit < total) pagination.next = { page: page + 1, limit };
    if (skip > 0) pagination.prev = { page: page - 1, limit };
    pagination.totalPages = Math.ceil(total / limit);

    res.advancedResults = {
      success: true,
      count: results.length,
      total,
      pagination,
      data,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = advancedResults;
