// src/ChatComponent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatComponent = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [latestResponse, setLatestResponse] = useState('');

  // Optionally, fetch chat history from backend on component mount.
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await axios.get('http://localhost:3001/api/chat/history');
        setChatHistory(result.data.history);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };
    fetchHistory();
  }, []);

  const handleSend = async () => {
    try {
      // Send message and existing context to the backend
      const result = await axios.post('http://localhost:3001/api/chat', { 
        message, 
        context: chatHistory.map(({ role, content }) => ({ role, content })) 
      });
      const aiMessage = result.data.aiMessage;

      // Update local chat history
      const updatedHistory = [
        ...chatHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: aiMessage },
      ];
      setChatHistory(updatedHistory);
      setLatestResponse(aiMessage);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Gen AI Chatbot</h2>
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          cols={50}
          placeholder="Enter your query..."
        />
      </div>
      <div>
        <button onClick={handleSend}>Send</button>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <h3>Chat History:</h3>
        <ul>
          {chatHistory.map((entry, index) => (
            <li key={index}>
              <strong>{entry.role}:</strong> {entry.content}
            </li>
          ))}
        </ul>
      </div>
      {latestResponse && (
        <div>
          <h3>Latest Response:</h3>
          <p>{latestResponse}</p>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
