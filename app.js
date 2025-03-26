// app.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const Chat = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

// Endpoint to process chat messages
app.post('/api/chat', async (req, res) => {
  const { message, context } = req.body;
  try {
    // Optionally, save the incoming user message to the database.
    const userChat = new Chat({ role: 'user', content: message });
    await userChat.save();

    // Build conversation context for OpenAI
    // context is expected to be an array of {role, content} objects.
    const messages = context && context.length > 0 
      ? [ ...context, { role: 'user', content: message } ]
      : [ { role: 'user', content: message } ];

    const payload = {
      model: 'gpt-3.5-turbo',
      messages,
    };

    const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    const aiMessage = response.data.choices[0].message.content;

    // Save the AI response to the database.
    const assistantChat = new Chat({ role: 'assistant', content: aiMessage });
    await assistantChat.save();

    res.json({ aiMessage });
  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    res.status(500).json({ error: 'Error processing the chat message' });
  }
});

// Endpoint to fetch chat history (optional)
app.get('/api/chat/history', async (req, res) => {
  try {
    const history = await Chat.find().sort({ timestamp: 1 });
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving chat history' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
