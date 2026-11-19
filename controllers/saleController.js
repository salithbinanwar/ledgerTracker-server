import { InventoryMovement } from '../models/InventoryMovement.js'
import { Product } from '../models/Product.js'
import { Sale } from '../models/Sale.js'

// @desc    Get all sales history with recorder details
// @route   GET /api/sales
export const getSales = async (req, res, next) => {
  try {
    const sales = await Sale.find({})
      .populate('recordedBy', 'name role')
      .sort({ createdAt: -1 })
    res.status(200).json(sales)
  } catch (error) {
    next(error)
  }
}

// @desc    Record a new sale, automatically deduct stock & calculate profits
// @route   POST /api/sales
export const createSale = async (req, res, next) => {
  try {
    const { items, amountPaid, customer } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items selected for sale.' })
    }

    let processedItems = []
    let totalAmount = 0
    let totalCost = 0

    for (let itemReq of items) {
      const product = await Product.findById(itemReq.product)
      if (!product) {
        return res.status(404).json({ message: 'Product not found' })
      }

      const qty = Number(itemReq.quantity)
      if (product.stock < qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${qty}`,
        })
      }

      const lineTotal = qty * product.sellingPrice
      const lineCostTotal = qty * product.costPrice
      const lineProfit = lineTotal - lineCostTotal

      totalAmount += lineTotal
      totalCost += lineCostTotal

      processedItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: qty,
        unitCostPrice: product.costPrice,
        unitSellingPrice: product.sellingPrice,
        lineTotal,
        lineCostTotal,
        lineProfit,
      })
    }

    const paid = amountPaid !== undefined ? Number(amountPaid) : totalAmount
    const bakiAmount = Math.max(0, totalAmount - paid)
    const totalProfit = totalAmount - totalCost

    const saleId = `SAL-${Math.floor(1000 + Math.random() * 9000)}`

    const sale = await Sale.create({
      saleId,
      items: processedItems,
      totalAmount,
      totalCost,
      totalProfit,
      amountPaid: paid,
      bakiAmount,
      customer: customer || { name: 'Walking Customer' },
      recordedBy: req.user._id,
    })

    for (let item of processedItems) {
      const product = await Product.findById(item.product)
      const quantityBefore = product.stock
      const quantityAfter = quantityBefore - item.quantity

      product.stock = quantityAfter
      await product.save()

      await InventoryMovement.create({
        product: product._id,
        movementType: 'Sale',
        quantityBefore,
        quantityAfter,
        quantityChanged: -item.quantity,
        reason: `Sold via Invoice ${saleId}`,
        referenceSale: sale._id,
        performedBy: req.user._id,
      })
    }

    const populatedSale = await Sale.findById(sale._id).populate(
      'recordedBy',
      'name role',
    )
    res.status(201).json({
      message: 'Sale recorded successfully and stock updated!',
      sale: populatedSale,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get monthly aggregated earnings & profit report
// @route   GET /api/sales/monthly
export const getMonthlyEarnings = async (req, res, next) => {
  try {
    const sales = await Sale.find({})
    const monthlyMap = {}

    sales.forEach((sale) => {
      const date = new Date(sale.createdAt)
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`

      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = {
          month: monthYear,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
          totalSalesCount: 0,
        }
      }

      monthlyMap[monthYear].totalRevenue += sale.totalAmount
      monthlyMap[monthYear].totalCost += sale.totalCost
      monthlyMap[monthYear].totalProfit += sale.totalProfit
      monthlyMap[monthYear].totalSalesCount += 1
    })

    const report = Object.values(monthlyMap)
    res.status(200).json(report)
  } catch (error) {
    next(error)
  }
}
