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
} from './station.controller.js'

const router = express.Router()

router.get('/', getStations)
router.get('/:id', getStationById)
router.post('/', addStation)
router.put('/:id', updateStation)
router.post('/:id/song', addStationSong)
router.delete('/:id/song/:songId', removeStationSong)

export const stationRoutes = router
