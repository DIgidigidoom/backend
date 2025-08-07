import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { reviewService } from '../review/review.service.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'

export const userService = {
    add, // Create (Signup)
    getById, // Read (Profile page)
    update, // Update (Edit profile)
    remove, // Delete (remove user)
    query, // List (of users)
    getByUsername, // Used for Login
    toggleLikedSong,
    changePassword
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('users')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            // Returning fake fresh data
            // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId, includePassword = false) {
    try {
        var criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('users')
        const user = await collection.findOne(criteria)
        if (!includePassword) delete user.password;
        console.log(user)

        criteria = { byUserId: userId }

        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('users')
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // peek only updatable properties
        const userToSave = {
            _id: ObjectId.createFromHexString(user._id),
        };

        // Add only allowed fields
        const allowedFields = ['fullname', 'password', 'email'];
        for (const field of allowedFields) {
            if (user[field] !== undefined) {
                userToSave[field] = user[field];
            }
        }

        const collection = await dbService.getCollection('users')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        const updatedUser = await collection.findOne({ _id: userToSave._id })

        if (updatedUser.password) delete updatedUser.password
        return updatedUser
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function changePassword(userToChange) {

    try {
        const collection = await dbService.getCollection('users')
        const userFromDB = await collection.findOne({ _id: ObjectId.createFromHexString(userToChange._id) })

        const isValid = await bcrypt.compare(userToChange.oldPassword, userFromDB.password)

        if (!isValid) {
            const err = new Error('Incorrect old password');
            err.status = 400; 
            throw err;
        }

        const saltRounds = 10
        const hash = await bcrypt.hash(userToChange.newPassword, saltRounds)
        userToChange.password = hash
        const updatedUser = await update(userToChange)
        return updatedUser
    } catch (err) {
        logger.error(`cannot change user password`, err)
        throw err
    }
}

async function add(user) {
    try {
        // peek only updatable fields!
        const userToAdd = {
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            isAdmin: user.isAdmin,
            likedSongsIds: Array.isArray(user.likedSongsIds) ? user.likedSongsIds : []
        }
        const collection = await dbService.getCollection('users')
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot add user', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                username: txtCriteria,
            },
            {
                fullname: txtCriteria,
            },
        ]
    }

    return criteria
}

export async function toggleLikedSong(userId, songId) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ _id: new ObjectId(userId) })
        if (!user) throw new Error('User not found')

        const likedSongsIds = user.likedSongsIds || []

        const idx = likedSongsIds.indexOf(songId)
        if (idx !== -1) {
            likedSongsIds.splice(idx, 1) // Unlike
        } else {
            likedSongsIds.push(songId) // Like
        }

        await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { likedSongsIds } }
        )

        user.likedSongsIds = likedSongsIds
        user._id = user._id.toString() // Ensure it's serialized

        return user
    } catch (err) {
        console.error('❌ Failed to toggle liked song', err)
        throw err
    }
}