import mongoose from 'mongoose'

const generateProductId = () => {
  const letters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ' // Excludes 'O'
  const randomLetter = letters.charAt(
    Math.floor(Math.random() * letters.length),
  )
  const randomDigits = Math.floor(1000 + Math.random() * 9000)
  return `${randomLetter}${randomDigits}`
}

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      default: generateProductId,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    costPrice: {
      type: Number,
      required: [true, 'Unit cost price is required'],
      min: [0, 'Cost price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Unit selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
)

export const Product = mongoose.model('Product', productSchema)
