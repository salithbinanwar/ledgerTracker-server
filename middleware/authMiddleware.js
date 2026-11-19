import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Not authorized, no token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password')

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ message: 'User account inactive or not found' })
    }

    req.user = user
    next()
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Not authorized, token validation failed' })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user.role}) is not authorized to perform this action`,
      })
    }
    next()
  }
}
