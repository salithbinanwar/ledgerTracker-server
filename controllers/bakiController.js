import { BakiCustomer } from '../models/BakiCustomer.js'
import { InventoryMovement } from '../models/InventoryMovement.js'
import { Product } from '../models/Product.js'

export const getBakiCustomers = async (req, res, next) => {
  try {
    const customers = await BakiCustomer.find({})
      .populate('transactions.recordedBy', 'name role')
      .sort({ updatedAt: -1 })
    res.status(200).json(customers)
  } catch (error) {
    next(error)
  }
}

export const addBakiTransaction = async (req, res, next) => {
  try {
    const { customerId, name, phone, items, type, note, paymentAmount } =
      req.body
    let customer

    if (type === 'Payment (Cash Received)') {
      const numAmount = Number(paymentAmount)
      customer = await BakiCustomer.findById(customerId)
      if (!customer)
        return res.status(404).json({ message: 'Customer not found' })

      customer.totalDue -= numAmount
      customer.transactions.push({
        type,
        amount: numAmount,
        note: note || 'Cash payment received',
        recordedBy: req.user._id,
      })

      await customer.save()
      const populated = await BakiCustomer.findById(customer._id).populate(
        'transactions.recordedBy',
        'name role',
      )
      return res.status(201).json(populated)
    }

    // Debit (Credit Given)
    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: 'Please select at least one product for Baki.' })
    }

    let processedItems = []
    let calculatedTotal = 0

    for (let itemReq of items) {
      const product = await Product.findById(itemReq.productId)
      if (!product)
        return res.status(404).json({ message: 'Product not found' })

      const qty = Number(itemReq.quantity)
      if (product.stock < qty) {
        return res
          .status(400)
          .json({
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          })
      }

      const lineTotal = qty * product.sellingPrice
      calculatedTotal += lineTotal

      processedItems.push({
        productName: product.name,
        sku: product.sku,
        quantity: qty,
        unitPrice: product.sellingPrice,
        lineTotal,
      })

      // Stock deduction
      const quantityBefore = product.stock
      product.stock -= qty
      await product.save()

      await InventoryMovement.create({
        product: product._id,
        movementType: 'Sale',
        quantityBefore,
        quantityAfter: product.stock,
        quantityChanged: -qty,
        reason: `Baki given to ${name}`,
        performedBy: req.user._id,
      })
    }

    const itemsSummaryText = processedItems
      .map((i) => `${i.quantity} ${i.productName}`)
      .join(', ')
    const finalNote = note ? `${note}` : `Took: ${itemsSummaryText}`

    if (customerId) {
      customer = await BakiCustomer.findById(customerId)
      if (!customer)
        return res.status(404).json({ message: 'Customer not found' })

      customer.totalDue += calculatedTotal
      customer.transactions.push({
        type: 'Debit (Credit Given)',
        amount: calculatedTotal,
        items: processedItems,
        note: finalNote,
        recordedBy: req.user._id,
      })

      await customer.save()
    } else {
      customer = await BakiCustomer.create({
        name,
        phone,
        totalDue: calculatedTotal,
        transactions: [
          {
            type: 'Debit (Credit Given)',
            amount: calculatedTotal,
            items: processedItems,
            note: finalNote,
            recordedBy: req.user._id,
          },
        ],
      })
    }

    const populated = await BakiCustomer.findById(customer._id).populate(
      'transactions.recordedBy',
      'name role',
    )
    res.status(201).json(populated)
  } catch (error) {
    next(error)
  }
}
