import { userService } from './user.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'
import { authService } from '../auth/auth.service.js'


export async function getUser(req, res) {
    try {
        const user = await userService.getById(req.params.id)
        res.send(user)
    } catch (err) {
        logger.error('Failed to get user', err)
        res.status(400).send({ err: 'Failed to get user' })
    }
}

export async function getUsers(req, res) {
    try {
        const filterBy = {
            txt: req.query?.txt || '',
            minBalance: +req.query?.minBalance || 0
        }
        const users = await userService.query(filterBy)
        res.send(users)
    } catch (err) {
        logger.error('Failed to get users', err)
        res.status(400).send({ err: 'Failed to get users' })
    }
}

export async function deleteUser(req, res) {
    try {
        await userService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete user', err)
        res.status(400).send({ err: 'Failed to delete user' })
    }
}

export async function updateUser(req, res) {
    try {
        const user = req.body
        const savedUser = await userService.update(user)
        res.send(savedUser)
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(400).send({ err: 'Failed to update user' })
    }
}

export async function changePassword(req, res) {
    try {
        const user = req.body;
        logger.info('user is: ', user)
        const savedUser = await userService.changePassword(user)
        res.send(savedUser)

    } catch (err) {
        logger.error('Failed to change password:', err);
        res.status(err.status || 500).send({ msg: err.message || 'Internal server error' });
    }
}

export async function toggleLikedSong(req, res) {
    try {
        const loginToken = req.cookies?.loginToken
        if (!loginToken) return res.status(401).send('User not logged in')

        const loggedinUser = authService.validateToken(loginToken)
        if (!loggedinUser || !loggedinUser._id) return res.status(401).send('Invalid token')

        const { songId } = req.body
        const updatedUser = await userService.toggleLikedSong(loggedinUser._id, songId)

        // Re-issue token to keep cookie fresh (optional)
        const newToken = authService.getLoginToken(updatedUser)
        res.cookie('loginToken', newToken, {
            httpOnly: true,
            sameSite: 'Lax',
            secure: false
        })

        res.json(updatedUser)
    } catch (err) {
        console.error('❌ toggleLikedSong failed:', err)
        res.status(500).send('Cannot toggle liked song')
    }
}
