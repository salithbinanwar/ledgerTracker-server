import mongoose from 'mongoose'

const bakiItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
})

const bakiTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Debit (Credit Given)', 'Payment (Cash Received)'],
    required: true,
  },
  amount: { type: Number, required: true },
  items: [bakiItemSchema], // Multiple items taken on baki
  note: { type: String, trim: true },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
})

const bakiCustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    totalDue: {
      type: Number,
      default: 0,
    },
    transactions: [bakiTransactionSchema],
  },
  { timestamps: true },
)

export const BakiCustomer = mongoose.model('BakiCustomer', bakiCustomerSchema)
