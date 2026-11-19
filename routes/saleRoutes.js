import express from 'express'
import {
  createSale,
  getMonthlyEarnings,
  getSales,
} from '../controllers/saleController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)
router.route('/').get(getSales).post(createSale)
router.route('/monthly').get(getMonthlyEarnings)
router.route('/').get(getSales).post(createSale)

export default router
