import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'
import { userService } from '../user/user.service.js'

export async function login(req, res) {
	const { username, password } = req.body
	try {
		const user = await authService.login(username, password)
		const loginToken = authService.getLoginToken(user)

		logger.info('User login: ', user)

		res.cookie('loginToken', loginToken, {
			httpOnly: true,
			sameSite: 'Lax',  
			secure: false    
		})
		res.json(user)
	} catch (err) {
		logger.error('Failed to Login ' + err)
		res.status(401).send({ err: 'Failed to Login, ' + err })
	}
}

export async function signup(req, res) {
	try {
		const credentials = req.body

		// Never log passwords
		// logger.debug(credentials)

		const account = await authService.signup(credentials)
		logger.debug(`auth.route - new account created: ` + JSON.stringify(account))

		const user = await authService.login(credentials.username, credentials.password)
		logger.info('User signup:', user)

		const loginToken = authService.getLoginToken(user)
		res.cookie('loginToken', loginToken, {
  httpOnly: true,
  sameSite: 'Lax',
  secure: false
})
		res.json(user)
	} catch (err) {
		logger.error('Failed to signup ' + err)
		res.status(400).send({ err: 'Failed to signup ' + err })
	}
}

export async function logout(req, res) {
	try {
		res.clearCookie('loginToken')
		res.send({ msg: 'Logged out successfully' })
	} catch (err) {
		res.status(400).send({ err: 'Failed to logout' })
	}
}

export async function getLoggedinUser(req, res) {
  try {
    const loginToken = req.cookies?.loginToken
    if (!loginToken) return res.json(null)

    const loggedinUser = authService.validateToken(loginToken)
    if (!loggedinUser) return res.json(null) 

    const user = await userService.getById(loggedinUser._id)
    if (!user) return res.json(null) 

    res.json(user)
  } catch (err) {
    console.warn('getLoggedinUser failed silently:', err)
    res.json(null) 
  }
}