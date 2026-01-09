const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const createProduct = async (req, res, next) => {
  try {
    const { name, price, stock, images, description, category, brand } = req.body;
    
    if (!name) {
      throw new BadRequestError("Product name is required");
    }
    
    if (price === undefined || price === null) {
      throw new BadRequestError("Product price is required");
    }
    
    if (stock === undefined || stock === null) {
      throw new BadRequestError("Product stock is required");
    }
    
    if (name.length > 200) {
      throw new BadRequestError("Product name cannot exceed 200 characters");
    }
    
    if (typeof price !== 'number' || price < 0) {
      throw new BadRequestError("Price must be a positive number");
    }
    
    const priceStr = price.toString();
    const decimalParts = priceStr.split('.');
    if (decimalParts.length > 1 && decimalParts[1].length > 2) {
      throw new BadRequestError("Price can have maximum 2 decimal places");
    }
    
    if (typeof stock !== 'number' || stock < 0) {
      throw new BadRequestError("Stock cannot be negative");
    }
    
    if (images && !Array.isArray(images)) {
      throw new BadRequestError("Images must be an array");
    }
    
    if (images && images.length > 0) {
      const imageRegex = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|bmp)$/i;
      for (const imageUrl of images) {
        if (typeof imageUrl !== 'string' || !imageRegex.test(imageUrl)) {
          throw new BadRequestError("Each image must be a valid image URL with supported extension (jpg, jpeg, png, gif, webp, bmp)");
        }
      }
    }
    
    if (description && description.length > 1000) {
      throw new BadRequestError("Product description cannot exceed 1000 characters");
    }
    
    if (category && category.length > 100) {
      throw new BadRequestError("Category name cannot exceed 100 characters");
    }
    
    if (category && !/^[a-zA-Z0-9\s\-]+$/.test(category)) {
      throw new BadRequestError("Category name can only contain letters, numbers, spaces, and hyphens");
    }
    
    if (brand && brand.length > 100) {
      throw new BadRequestError("Brand name cannot exceed 100 characters");
    }
    
    if (brand && !/^[a-zA-Z0-9\s\-&]+$/.test(brand)) {
      throw new BadRequestError("Brand name can only contain letters, numbers, spaces, hyphens, and ampersands");
    }
    
    const productData = { ...req.body };
    
    if (productData.price !== undefined) {
      productData.price = parseFloat(parseFloat(productData.price).toFixed(2));
    }

    const product = await Product.create(productData);
    res.status(StatusCodes.CREATED).json({ product });
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const { name, category, brand, minPrice, maxPrice, sort, fields, numericFilters } = req.query;
    
    const queryObject = {};

    if (name) {
      queryObject.name = { $regex: name, $options: 'i' };
    }
    
    if (category) {
      queryObject.category = { $regex: category, $options: 'i' };
    }
    
    if (brand) {
      queryObject.brand = { $regex: brand, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      queryObject.price = {};
      if (minPrice) {
        queryObject.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        queryObject.price.$lte = Number(maxPrice);
      }
    }

    let result = Product.find(queryObject);

    if (numericFilters) {
      const operatorMap = {
        '>': '$gt',
        '>=': '$gte',
        '=': '$eq',
        '!=': '$ne',
        '<': '$lt',
        '<=': '$lte',
      };
      const regEx = /\b(<|>|>=|=|!=|<|<=)\b/g;
      let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`);
      const options = ['price', 'stock'];
      
      filters = filters.split(',');
      filters.forEach((item) => {
        const [field, operator, value] = item.split('-');
        if (options.includes(field)) {
          if (!queryObject[field]) queryObject[field] = {};
          queryObject[field][operator] = Number(value);
        }
      });
    }

    if (sort) {
      const sortList = sort.split(',').join(' ');
      result = result.sort(sortList);
    } else {
      result = result.sort('-createdAt');
    }

    if (fields) {
      const fieldsList = fields.split(',').join(' ');
      result = result.select(fieldsList);
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    result = result.skip(skip).limit(limit);

    const products = await result;
    
    const totalProducts = await Product.countDocuments(queryObject);
    
    res.status(StatusCodes.OK).json({ 
      products, 
      nbHits: products.length,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page
    });
  } catch (error) {
    next(error);
  }
};

const getSingleProduct = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
  
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError(`No product with id: ${productId}`);
    }
  
    res.status(StatusCodes.OK).json({ product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const { name, price, stock, images, description, category, brand } = req.body;
    
    if (name && name.length > 200) {
      throw new BadRequestError("Product name cannot exceed 200 characters");
    }
    
    if (price !== undefined && price !== null) {
      if (typeof price !== 'number' || price < 0) {
        throw new BadRequestError("Price must be a positive number");
      }
      
      const priceStr = price.toString();
      const decimalParts = priceStr.split('.');
      if (decimalParts.length > 1 && decimalParts[1].length > 2) {
        throw new BadRequestError("Price can have maximum 2 decimal places");
      }
    }
    
    if (stock !== undefined && stock !== null) {
      if (typeof stock !== 'number' || stock < 0) {
        throw new BadRequestError("Stock cannot be negative");
      }
    }
    
    if (images && !Array.isArray(images)) {
      throw new BadRequestError("Images must be an array");
    }
    
    if (images && images.length > 0) {
      const imageRegex = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|bmp)$/i;
      for (const imageUrl of images) {
        if (typeof imageUrl !== 'string' || !imageRegex.test(imageUrl)) {
          throw new BadRequestError("Each image must be a valid image URL with supported extension (jpg, jpeg, png, gif, webp, bmp)");
        }
      }
    }
    
    if (description && description.length > 1000) {
      throw new BadRequestError("Product description cannot exceed 1000 characters");
    }
    
    if (category && category.length > 100) {
      throw new BadRequestError("Category name cannot exceed 100 characters");
    }
    
    if (category && !/^[a-zA-Z0-9\s\-]+$/.test(category)) {
      throw new BadRequestError("Category name can only contain letters, numbers, spaces, and hyphens");
    }
    
    if (brand && brand.length > 100) {
      throw new BadRequestError("Brand name cannot exceed 100 characters");
    }
    
    if (brand && !/^[a-zA-Z0-9\s\-&]+$/.test(brand)) {
      throw new BadRequestError("Brand name can only contain letters, numbers, spaces, hyphens, and ampersands");
    }
    
    const updateData = { ...req.body };
    
    if (updateData.price !== undefined) {
      updateData.price = parseFloat(parseFloat(updateData.price).toFixed(2));
    }
    
    const product = await Product.findByIdAndUpdate({ _id: productId }, updateData, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      throw new NotFoundError(`No product with id: ${productId}`);
    }
  
    res.status(StatusCodes.OK).json({ product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
  
    const product = await Product.findByIdAndDelete({ _id: productId });
    if (!product) {
      throw new NotFoundError(`No product with id: ${productId}`);
    }
  
    res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};