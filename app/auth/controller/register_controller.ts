import User from '#database/models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class RegisterController {
  public async execute({ response, request }: HttpContext) {
    const { description, email, password } = request.only(['description', 'email', 'password'])

    if (!email || !password) {
      return response.badRequest('Missing required fields')
    }

    const user = await User.create({ description, email, password })

    return response.json(user)
  }
}
