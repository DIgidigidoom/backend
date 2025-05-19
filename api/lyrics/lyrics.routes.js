import express from 'express'
import axios from 'axios'

const router = express.Router()


router.get('/', async (req, res) => {
    const AUDD_API_KEY = process.env.AUDD_API_KEY
    const { title, artist } = req.query
    
    const rawQuery = `${artist} ${title}`
    const cleanedQuery = rawQuery
        .replace(/\(.*?\)|\[.*?\]|feat\..*/gi, '') // remove brackets & 'feat.'
        .replace(/[^a-zA-Z0-9\s]/g, '') // remove punctuation
        .trim()

    try {
        const response = await axios.get(`https://api.audd.io/findLyrics/`, {

            params: {
                q: cleanedQuery,
                api_token: AUDD_API_KEY,
            }
        })
       

        const result = response.data.result
        let lyrics = 'Lyrics not found.'

        if (Array.isArray(result) && result[0]?.lyrics) {
            lyrics = result[0].lyrics
        } else if (typeof result === 'object' && result?.lyrics) {
            lyrics = result.lyrics
        }

        res.send({ lyrics })
    } catch (err) {
        console.error('Error fetching lyrics:', err.message)
        res.status(500).send({ lyrics: 'Error fetching lyrics.' })
    }
})

export default router
