// backend/api/station/station.service.js
import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'

export const stationService = {
  query,
  getById,
  remove,
  add,
  update,
  addSong,
  removeSong,
}

async function query(filterBy = {}) {
  try {
    const collection = await dbService.getCollection('stations')
    const stations = await collection.find(filterBy).toArray()
    return stations
  } catch (err) {
    console.error('Cannot query stations', err)
    throw err
  }
}

async function getById(stationId) {
  try {
    const collection = await dbService.getCollection('stations')
    const station = await collection.findOne({ _id: new ObjectId(stationId) })
    return station
  } catch (err) {
    console.error(`While finding station ${stationId}`, err)
    throw err
  }
}

async function remove(stationId) {
  try {
    const collection = await dbService.getCollection('stations')
    await collection.deleteOne({ _id: new ObjectId(stationId) })
  } catch (err) {
    console.error(`Cannot remove station ${stationId}`, err)
    throw err
  }
}

async function add(station) {
  try {
    const collection = await dbService.getCollection('stations')
    const res = await collection.insertOne(station)
    return { ...station, _id: res.insertedId }
  } catch (err) {
    console.error('Cannot insert station', err)
    throw err
  }
}

async function update(station) {
  try {
    const stationToSave = { ...station }
    delete stationToSave._id
    const collection = await dbService.getCollection('stations')
    await collection.updateOne(
      { _id: new ObjectId(station._id) },
      { $set: stationToSave }
    )
    return station
  } catch (err) {
    console.error(`Cannot update station ${station._id}`, err)
    throw err
  }
}

export async function addSong(stationId, song) {
  try {
    const collection = await dbService.getCollection('stations')
    console.log('Fetching station:', stationId)

    const station = await collection.findOne({ _id: new ObjectId(stationId) })
    if (!station) throw new Error('Station not found')

    console.log('Station found:', station.name)

    const isAlreadyAdded = station.songs?.some(s => s.id === song.id)
    if (isAlreadyAdded) throw new Error('Song already exists in station')

    if (!station.songs) station.songs = []
    station.songs.push(song)

    console.log('Updated songs:', station.songs.length)

    await collection.updateOne(
      { _id: new ObjectId(stationId) },
      { $set: { songs: station.songs } }
    )

    return station
  } catch (err) {
    console.error('❌ Failed to add song to station:', err.message)
    throw err
  }
}

export async function removeSong(stationId, songId) {
  try {
    const collection = await dbService.getCollection('stations')
    const station = await collection.findOne({ _id: new ObjectId(stationId) })
    if (!station) throw new Error('Station not found')

    // Remove the song
    station.songs = station.songs?.filter(song => song.id !== songId) || []

    await collection.updateOne(
      { _id: new ObjectId(stationId) },
      { $set: { songs: station.songs } }
    )

    return station
  } catch (err) {
    console.error('❌ Failed to remove song from station', err)
    throw err
  }
}
