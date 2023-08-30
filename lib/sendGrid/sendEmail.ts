import sendGrid from './client'

export default async function sendEmail(subject: string, html: string): Promise<void> {
  const msg = {
    to: 'michaeluloth@gmail.com', // Your recipient
    from: 'hello@michaeluloth.com', // Your verified sender
    subject,
    html,
  }

  await sendGrid
    .send(msg)
    .then((): void => {
      console.log(`💌 Sent email "${subject}"\n`)
    })
    .catch(error => {
      console.error(`🚨 Error sending email "${subject}":`, error, '\n')
    })
}
