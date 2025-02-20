import emitter from '@adonisjs/core/services/emitter'
import string from '@adonisjs/core/helpers/string'

emitter.on('http:request_completed', (event) => {
  const method = event.ctx.request.method()
  const url = event.ctx.request.url(true)
  const duration = event.duration
  const status = event.ctx.response.response.statusCode

  console.log(`${method} ${url}: ${status} ${string.prettyHrTime(duration)}`)
})
