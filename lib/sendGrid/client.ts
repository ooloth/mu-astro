import sendGrid from '@sendgrid/mail'

sendGrid.setApiKey(import.meta.env.SENDGRID_API_KEY ?? '')

export default sendGrid
