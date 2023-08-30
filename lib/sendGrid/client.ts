import dotenv from 'dotenv'
import sendGrid from '@sendgrid/mail'

dotenv.config({ path: '.env.local' })

sendGrid.setApiKey(process.env.SENDGRID_API_KEY ?? '')

export default sendGrid
