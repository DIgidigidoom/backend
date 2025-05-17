// backend/api/station/station.routes.js
import express from 'express'
import {
    getStations,
    getStationById,
    deleteStation,
    addStation,
    updateStation,
    addStationSong,
    removeStationSong,
    addToLikedSongs,
    removeFromLikedSongs
} from './station.controller.js'

const router = express.Router()

router.get('/', getStations)
router.get('/:id', getStationById)
router.post('/', addStation)
router.delete('/:id', deleteStation)
router.put('/:id', updateStation)
router.post('/:id/song', addStationSong)
router.delete('/:stationId/song/:songId', removeStationSong)
router.post('/:userId/liked-songs', addToLikedSongs)
router.delete('/:userId/liked-songs/:songId', removeFromLikedSongs)

export const stationRoutes = router
