import express from 'express'
import {
  deleteUser,
  getUsers,
  registerUser,
} from '../controllers/userController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public registration route
router.post('/register', registerUser)

// Protected Admin routes
router.use(protect, authorize('Boss'))
router.route('/').get(getUsers).post(registerUser)
router.route('/:id').delete(deleteUser)

export default router
