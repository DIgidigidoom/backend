import express from 'express'

import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'

import { getUser, getUsers, deleteUser, updateUser, toggleLikedSong, changePassword } from './user.controller.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:id', getUser)
router.put('/:id', requireAuth, updateUser)
router.put('/change-password/:id', requireAuth, changePassword)
router.delete('/:id', requireAuth, requireAdmin, deleteUser)
router.post('/toggle-like', toggleLikedSong)

export const userRoutes = router