const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const { name, category, sort, fields, numericFilters } = req.query;
  
  const queryObject = {};

  if (name) {
    queryObject.name = { $regex: name, $options: 'i' };
  }
  if (category) {
    queryObject.category = { $regex: category, $options: 'i' };
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
        queryObject[field] = { [operator]: Number(value) };
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
  res.status(StatusCodes.OK).json({ products, nbHits: products.length });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findByIdAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findByIdAndDelete({ _id: productId });
  if (!product) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};