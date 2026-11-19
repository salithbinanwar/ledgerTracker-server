import mongoose from 'mongoose'

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCostPrice: { type: Number, required: true }, // Locked historical cost
  unitSellingPrice: { type: Number, required: true }, // Locked historical price
  lineTotal: { type: Number, required: true }, // quantity * unitSellingPrice
  lineCostTotal: { type: Number, required: true }, // quantity * unitCostPrice
  lineProfit: { type: Number, required: true }, // lineTotal - lineCostTotal
})

const saleSchema = new mongoose.Schema(
  {
    saleId: {
      type: String,
      unique: true,
      required: true,
    },
    items: [saleItemSchema],
    totalAmount: { type: Number, required: true }, // Grand total
    totalCost: { type: Number, required: true }, // Total COGS
    totalProfit: { type: Number, required: true }, // Total Earned Profit
    amountPaid: { type: Number, required: true },
    bakiAmount: { type: Number, default: 0 },
    customer: {
      name: { type: String, default: 'Walking Customer' },
      phone: { type: String, default: '' },
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
)

export const Sale = mongoose.model('Sale', saleSchema)
