import express from 'express'

import { login, signup, logout,getLoggedinUser  } from './auth.controller.js'

const router = express.Router()
router.get('/user', getLoggedinUser)
router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', logout)

export const authRoutes = router