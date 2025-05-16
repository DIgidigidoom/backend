// backend/api/station/station.controller.js
import { stationService } from './station.service.js'

export async function getStations(req, res) {
	try {
		const stations = await stationService.query()
		res.json(stations)
	} catch (err) {
		console.error('Failed to get stations', err)
		res.status(500).send({ err: 'Failed to get stations' })
	}
}

export async function getStationById(req, res) {
	try {
		const station = await stationService.getById(req.params.id)
		res.json(station)
	} catch (err) {
		console.error('Failed to get station', err)
		res.status(500).send({ err: 'Failed to get station' })
	}
}

export async function deleteStation(req, res) {
	try {
		await stationService.remove(req.params.id)
		res.send({ msg: 'Deleted successfully' })
	} catch (err) {
		console.error('Failed to delete station', err)
		res.status(500).send({ err: 'Failed to delete station' })
	}
}

export async function addStation(req, res) {
	try {
		const station = req.body
		const savedStation = await stationService.add(station)
		res.json(savedStation)
	} catch (err) {
		console.error('Failed to add station', err)
		res.status(500).send({ err: 'Failed to add station' })
	}
}

export async function updateStation(req, res) {
	try {
		const station = req.body
		const savedStation = await stationService.update(station)
		res.json(savedStation)
	} catch (err) {
		console.error('Failed to update station', err)
		res.status(500).send({ err: 'Failed to update station' })
	}
}

export async function addStationSong(req, res) {
  const { id } = req.params
  const song = req.body 

  try {
    const updatedStation = await stationService.addSong(id, song)
    res.json(updatedStation)
  } catch (err) {
    console.error('Failed to add song', err)
    res.status(500).send({ err: 'Failed to add song to station' })
  }
}

export async function removeStationSong(req, res) {
	const { id, songId } = req.params
	try {
		const updatedStation = await stationService.removeSong(id, songId)
		res.json(updatedStation)
	} catch (err) {
		console.error('Failed to remove song', err)
		res.status(500).send({ err: 'Failed to remove song from station' })
	}
}
