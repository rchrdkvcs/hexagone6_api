/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const LoginController = () => import('#auth/controller/login_controller')
const RegisterController = () => import('#auth/controller/register_controller')
const TeamsController = () => import('#teams/controller/teams_controller')
const PlayersController = () => import('#players/controller/players_controller')
const GenerateUrlsController = () =>
  import('../app/banphase/controller/generate_urls_controller.js')
const BanphaseMessageController = () =>
  import('../app/banphase/controller/banphase_message_controller.js')
const SheetsController = () => import('#google/controller/sheets_controller')

router.post('/login', [LoginController, 'execute'])
router.post('/register', [RegisterController, 'execute'])

router.get('/teams', [TeamsController, 'render'])
router.get('/team/:id', [TeamsController, 'show'])

router.get('/players', [PlayersController, 'render'])
router.get('/player/:id', [PlayersController, 'show'])

router.post('/banphase/generate/urls', [GenerateUrlsController, 'execute'])
router.post('/banphase/message', [BanphaseMessageController, 'execute'])

router.post('/sheet/sync', [SheetsController, 'execute'])
