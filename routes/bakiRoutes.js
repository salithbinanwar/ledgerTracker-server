import express from 'express'
import {
  addBakiTransaction,
  getBakiCustomers,
} from '../controllers/bakiController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)
router.route('/').get(getBakiCustomers).post(addBakiTransaction)

export default router
