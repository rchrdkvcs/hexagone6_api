import User from '#database/models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class LoginController {
  public async execute({ response, request, auth }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)

    if (!user) {
      return response.badRequest('Invalid credentials')
    }

    await auth.use('web').login(user)

    return response.json(user)
  }
}
