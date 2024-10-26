
const advancedResults = (model, populate) => async (req, res, next) => {
    try {
      // Copy req.query
      const reqQuery = { ...req.query };
  
      // Fields to exclude from the query
      const removeFields = ["select", "sort", "page", "limit"];
  
      // Loop over removeFields and delete them from reqQuery
      removeFields.forEach((param) => delete reqQuery[param]);
  
      // Create query string
      let queryStr = JSON.stringify(reqQuery);
  
      // Create operators like $gt, $gte, etc.
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
  
      // Find resource (without pagination and populate initially)
      let query = model.find(JSON.parse(queryStr));
  
      // Select specific fields if requested
      if (req.query.select) {
        const fields = req.query.select.split(",").join(" ");
        query = query.select(fields);
      }
  
      // Sort
      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy);
      } else {
        query = query.sort("-createdAt");
      }
  
      // Pagination
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 25;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
  
      // Get the total count of documents before pagination
      const total = await model.countDocuments(JSON.parse(queryStr));
  
      // Apply pagination and limit
      query = query.skip(startIndex).limit(limit);
  
      // Populate if needed
      if (populate) {
        query = query.populate(populate);
      }
  
      // Execute the query
      const results = await query;
  
      // Pagination result
      const pagination = {};
  
      if (endIndex < total) {
        pagination.next = {
          page: page + 1,
          limit,
        };
      }
  
      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit,
        };
      }
  
      // Optional: Total pages for better client handling
      pagination.totalPages = Math.ceil(total / limit);
  
      // Response
      res.advancedResults = {
        success: true,
        count: results.length,
        total,
        pagination,
        data: results,
      };
  
      next();
    } catch (error) {
      next(error);
    }
  };
  

module.exports = advancedResults;