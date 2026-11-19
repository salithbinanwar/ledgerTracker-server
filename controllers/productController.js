import { InventoryMovement } from '../models/InventoryMovement.js'
import { Product } from '../models/Product.js'

export const getProducts = async (req, res, next) => {
  try {
    const { search, category, status } = req.query
    let query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ]
    }

    if (category) {
      query.category = category
    }

    query.status = status || 'Active'

    const products = await Product.find(query)
      .populate('createdBy', 'name username role')
      .sort({ createdAt: -1 })

    res.status(200).json(products)
  } catch (error) {
    next(error)
  }
}

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      stock,
      costPrice,
      sellingPrice,
      lowStockThreshold,
      description,
    } = req.body

    const product = await Product.create({
      name,
      category,
      stock: stock ? Number(stock) : 0,
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 5,
      description,
      createdBy: req.user._id, // Tracks who created the product
    })

    if (product.stock > 0) {
      await InventoryMovement.create({
        product: product._id,
        movementType: 'Initial',
        quantityBefore: 0,
        quantityAfter: product.stock,
        quantityChanged: product.stock,
        reason: 'Initial stock registration',
        performedBy: req.user._id,
      })
    }

    const populatedProduct = await Product.findById(product._id).populate(
      'createdBy',
      'name username role',
    )
    res.status(201).json(populatedProduct)
  } catch (error) {
    next(error)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      costPrice,
      sellingPrice,
      lowStockThreshold,
      description,
      stockAdjustment,
      reason,
    } = req.body
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    product.name = name || product.name
    product.category = category || product.category
    product.costPrice =
      costPrice !== undefined ? Number(costPrice) : product.costPrice
    product.sellingPrice =
      sellingPrice !== undefined ? Number(sellingPrice) : product.sellingPrice
    product.lowStockThreshold =
      lowStockThreshold !== undefined
        ? Number(lowStockThreshold)
        : product.lowStockThreshold
    product.description =
      description !== undefined ? description : product.description

    if (stockAdjustment && Number(stockAdjustment) !== 0) {
      const quantityBefore = product.stock
      const quantityAfter = quantityBefore + Number(stockAdjustment)

      if (quantityAfter < 0) {
        return res
          .status(400)
          .json({ message: 'Stock level cannot become negative.' })
      }

      product.stock = quantityAfter

      await InventoryMovement.create({
        product: product._id,
        movementType: 'Adjustment',
        quantityBefore,
        quantityAfter,
        quantityChanged: Number(stockAdjustment),
        reason: reason || 'Manual stock adjustment',
        performedBy: req.user._id,
      })
    }

    await product.save()
    const updated = await Product.findById(product._id).populate(
      'createdBy',
      'name username role',
    )
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const archiveProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    product.status = product.status === 'Active' ? 'Archived' : 'Active'
    await product.save()

    res
      .status(200)
      .json({ message: `Product status updated to ${product.status}`, product })
  } catch (error) {
    next(error)
  }
}
