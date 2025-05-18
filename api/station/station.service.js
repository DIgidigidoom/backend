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
  addToLikedSongs,
  removeFromLikedSongs
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

export async function remove(stationId) {
  try {
    const collection = await dbService.getCollection('stations')

    const criteria = isValidObjectId(stationId)
      ? { _id: new ObjectId(stationId) }
      : { _id: stationId } // fallback for legacy string IDs

    await collection.deleteOne(criteria)
  } catch (err) {
    console.error(`❌ Cannot remove station ${stationId}`, err)
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

async function addSong(stationId, song) {
  try {
    const collection = await dbService.getCollection('stations')

    const criteria = isValidObjectId(stationId)
      ? { _id: new ObjectId(stationId) }
      : { _id: stationId }

    const station = await collection.findOne(criteria)
    if (!station) throw new Error('Station not found')

    // Prevent duplicates
    const alreadyExists = station.songs?.some(s => s.id === song.id)
    if (alreadyExists) throw new Error('Song already in station')

    station.songs = [...(station.songs || []), song]

    await collection.updateOne(criteria, { $set: { songs: station.songs } })
    return station
  } catch (err) {
    console.error('❌ Failed to add song to station', err)
    throw err
  }
}

export async function removeSong(stationId, songId) {
  try {
    const collection = await dbService.getCollection('stations')
    const station = await collection.findOne({ _id: new ObjectId(stationId) })
    if (!station) throw new Error('Station not found')

    console.log('🟡 stationId:', stationId)
    console.log('🟡 songId to remove:', songId)
    console.log('🟡 songs before:', station.songs?.map(song => song.id))

    // Remove the song
    const filteredSongs = station.songs?.filter(song => song.id !== songId) || []

    console.log('🟢 songs after:', filteredSongs.map(song => song.id))

    await collection.updateOne(
      { _id: new ObjectId(stationId) },
      { $set: { songs: filteredSongs } }
    )

    const updatedStation = await collection.findOne({ _id: new ObjectId(stationId) })
    return updatedStation
  } catch (err) {
    console.error('❌ Failed to remove song from station', err)
    throw err
  }
}

function isValidObjectId(id) {
  return typeof id === 'string' && id.length === 24 && /^[a-f\d]{24}$/i.test(id)
}


export async function addToLikedSongs(userId, userInfo, song) {
  const collection = await dbService.getCollection('stations')

  let station = await collection.findOne({ type: 'liked station', 'createdBy._id': userId })

  const alreadyExists = station.songs.some(s => s.id === song.id)
  if (!alreadyExists) station.songs.push(song)

  await collection.updateOne(
    { _id: new ObjectId(station._id) },
    { $set: { songs: station.songs } }
  )

  return station
}

export async function removeFromLikedSongs(userId, songId) {
  const collection = await dbService.getCollection('stations')

  const station = await collection.findOne({
    type: 'liked station',
    'createdBy._id': userId
  })

  if (!station) throw new Error('Liked Songs station not found')

  station.songs = station.songs.filter(song => song.id !== songId)

  await collection.updateOne(
    { _id: new ObjectId(station._id) },
    { $set: { songs: station.songs } }
  )

  return station
}