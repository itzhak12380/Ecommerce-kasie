const Product = require('../models/productModel')

class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filtering() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit']
        excludedFields.forEach(el => delete (queryObj[el]))
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => `$${match}`)
        this.query.find(JSON.parse(queryStr))
        return this
    }
    sorting() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('-createdAt')
        }
        return this
    }
    paginating() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 9
        const skip = (page - 1) * limit
        console.log(this.query.skip);
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}
const getProducts = async (req, res) => {
    try {
        const featers = new APIfeatures(Product.find(), req.query).filtering().sorting().paginating()
        const products = await featers.query
        res.status(200).json({
            result: products.length,
            products: products
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
const creatProduct = async (req, res) => {
    try {
        const { product_id, title, price, description, content, image, category } = req.body
        if (!image) return res.status(400).json({ message: "no image upload" })
        const product = await Product.findOne({ product_id: product_id }) /// product_id

        if (product) return res.status(400).json({ message: "this product already exists" })
        const newProduct = new Product({
            product_id, title: title.toLowerCase(), price, description, content, images: image, category
        })
        newProduct.save()
        res.status(200).json({ message: "created product" })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
const deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: "product deleted" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
const updateProduct = async (req, res) => {
    try {
        const { product_id, title, price, description, content, image, category } = req.body
        if (!image) return res.status(400).json({ message: "no image upload" })
        await Product.findOneAndUpdate({ _id: req.params.id }, {
            title: title.toLowerCase(), price, description, content, images:image, category
        })
        res.status(200).json({ message: "updated product" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = {
    updateProduct,
    deleteProduct,
    creatProduct,
    getProducts
}