const express = require('express')
const fetch = require('node-fetch')
const app = express()
require('dotenv').config()

app.use(express.json())
app.use(express.static('public'))

app.post('/api/chat', async (req, res) => {
  const { message, model } = req.body
  const apiKey = process.env.OPENAI_API_KEY

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }]
      })
    })
    const data = await response.json()
    res.json({ reply: data.choices[0].message.content })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(3000, () => console.log('✅ Server ready at http://localhost:3000'))
