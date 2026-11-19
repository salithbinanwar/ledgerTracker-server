import { User } from '../models/User.js'

// @desc    Register a new user (Admin / Boss or Manager)
// @route   POST /api/users/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, username, password, role } = req.body

    if (!name || !username || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide all required fields.' })
    }

    const userExists = await User.findOne({ username })
    if (userExists) {
      return res.status(400).json({ message: 'Username is already taken.' })
    }

    const user = await User.create({
      name,
      username,
      password,
      plainPassword: password, // So admin can view/copy if needed
      role: role || 'Manager',
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      message: 'Account created successfully!',
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all users (For Admin management)
// @route   GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('+plainPassword')
    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'Boss') {
      return res.status(403).json({ message: 'Cannot delete Boss account' })
    }

    await user.deleteOne()
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    next(error)
  }
}
