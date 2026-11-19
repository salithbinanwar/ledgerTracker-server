import { User } from '../models/User.js'
import { generateTokenAndSetCookie } from '../utils/generateToken.js'

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Please enter username and password' })
    }

    const user = await User.findOne({ username }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: 'Account is deactivated. Contact the Boss.' })
    }

    generateTokenAndSetCookie(res, user._id)

    res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
    })
  } catch (error) {
    next(error)
  }
}

export const logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  })
  res.status(200).json({ message: 'Logged out successfully' })
}

export const getMe = async (req, res) => {
  res.status(200).json(req.user)
}
