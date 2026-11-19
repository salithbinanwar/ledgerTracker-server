import mongoose from 'mongoose'

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    movementType: {
      type: String,
      enum: [
        'Stock Addition',
        'Sale',
        'Return',
        'Correction',
        'Adjustment',
        'Initial',
      ],
      required: true,
    },
    quantityBefore: {
      type: Number,
      required: true,
    },
    quantityAfter: {
      type: Number,
      required: true,
    },
    quantityChanged: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
)

export const InventoryMovement = mongoose.model(
  'InventoryMovement',
  inventoryMovementSchema,
)
