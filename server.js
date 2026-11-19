import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDB } from './config/db.js'
import { errorHandler } from './middleware/errorMiddleware.js'
import { User } from './models/User.js'
import authRoutes from './routes/authRoutes.js'
import bakiRoutes from './routes/bakiRoutes.js'
import productRoutes from './routes/productRoutes.js'
import saleRoutes from './routes/saleRoutes.js'
import userRoutes from './routes/userRoutes.js'

dotenv.config()
connectDB()

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
)

const seedDefaultAccounts = async () => {
  try {
    // Seed Boss (Monir)
    const bossExists = await User.findOne({ role: 'Boss' })
    if (!bossExists) {
      await User.create({
        name: 'Monir',
        username: 'monir',
        password: 'monir 22',
        role: 'Boss',
      })
      console.log(
        'Default Boss account created -> Username: monir | Password: monir 22',
      )
    }
  } catch (err) {
    console.error('Failed to seed default user:', err.message)
  }
}
seedDefaultAccounts()

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

app.use('/api/products', productRoutes)
app.use('/api/sales', saleRoutes)
app.use('/api/baki', bakiRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})
