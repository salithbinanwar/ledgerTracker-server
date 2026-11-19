import express from 'express'
import {
  archiveProduct,
  createProduct,
  getProducts,
  updateProduct,
} from '../controllers/productController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

// Both Boss and Manager can view, create, edit, and delete/archive products
router
  .route('/')
  .get(getProducts)
  .post(authorize('Boss', 'Manager'), createProduct)

router.route('/:id').put(authorize('Boss', 'Manager'), updateProduct)

router.patch('/:id/archive', authorize('Boss', 'Manager'), archiveProduct)

export default router
