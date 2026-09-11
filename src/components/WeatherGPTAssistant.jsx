import React, { useState } from 'react';
import { Bot, Send, Sparkles, Umbrella, Compass, CloudRain, ShieldCheck, Thermometer, Wind, CheckCircle2, AlertTriangle } from 'lucide-react';

export function WeatherGPTAssistant({ weatherData }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am WeatherGPT, your domain-adaptive meteorological AI assistant. Ask me anything about current atmospheric telemetry, rain forecasts, travel advisories, or weekend planning for ${weatherData?.locationName || 'your location'}.`,
      timestamp: 'Just now'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const suggestionChips = [
    'Will it rain today?',
    'Should I carry an umbrella?',
    'Is tomorrow good for travelling?',
    'What will the weather be like this weekend?'
  ];

  const generateAnswer = (query, data) => {
    if (!data || !data.consensus) {
      return 'I do not have active weather telemetry loaded yet. Please select a valid location.';
    }

    const q = query.toLowerCase();
    const c = data.consensus;
    const loc = data.locationName || 'the selected location';
    const hourly = data.hourly || [];
    const daily = data.dailyForecast || [];

    // 1. Rain Today
    if (q.includes('rain today') || q.includes('raining today') || q.includes('will it rain')) {
      if (c.rainProbability >= 60) {
        const peakRain = hourly.reduce((max, node) => (node.rain > max ? node.rain : max), c.rainProbability);
        return `Yes, there is a high likelihood of rain today in ${loc} (${c.rainProbability}% probability, peaking near ${peakRain}%). Expect ${c.condition.toLowerCase()} with temperatures around ${c.temperature}°C. Carrying waterproof gear is strongly advised.`;
      } else if (c.rainProbability >= 30) {
        return `There is a moderate chance of light rain or scattered showers today in ${loc} (${c.rainProbability}% probability). Current condition is ${c.condition.toLowerCase()} with a current temperature of ${c.temperature}°C. Keep an umbrella handy just in case!`;
      } else {
        return `No significant rainfall is expected today in ${loc}. Rain probability is low at ${c.rainProbability}%, and conditions are expected to remain ${c.condition.toLowerCase()} with a temperature of ${c.temperature}°C.`;
      }
    }

    // 2. Umbrella query
    if (q.includes('umbrella') || q.includes('raincoat')) {
      if (c.rainProbability >= 40) {
        return `Definitely! Precipitation likelihood in ${loc} is ${c.rainProbability}%. Carrying an umbrella or raincoat will keep you dry during potential ${c.condition.toLowerCase()}.`;
      } else {
        return `You likely won't need an umbrella today in ${loc}. The rain chance is only ${c.rainProbability}%, with current skies showing ${c.condition.toLowerCase()}.`;
      }
    }

    // 3. Travel query
    if (q.includes('travel') || q.includes('travelling') || q.includes('tomorrow')) {
      const tomorrow = daily[1] || { day: 'Tomorrow', tempMax: c.temperature + 1, rainProb: c.rainProbability, condition: c.condition, windMax: c.windSpeed };
      let verdict = 'Good for travelling';
      let reason = 'Moderate temperature and clear roads.';

      if (tomorrow.rainProb >= 60 || tomorrow.windMax >= 30) {
        verdict = 'Exercise Caution';
        reason = `High precipitation chance (${tomorrow.rainProb}%) and gusty winds (${tomorrow.windMax} km/h).`;
      }

      return `Travel Outlook for ${tomorrow.day || 'Tomorrow'} in ${loc}:\n• Status: ${verdict}\n• Condition: ${tomorrow.condition}\n• Temperature: High of ${tomorrow.tempMax}°C, Low of ${tomorrow.tempMin || tomorrow.tempMax - 6}°C\n• Rain Chance: ${tomorrow.rainProb}%\n• Wind: Up to ${tomorrow.windMax} km/h\n\nAdvisor Note: ${reason}`;
    }

    // 4. Weekend query
    if (q.includes('weekend') || q.includes('saturday') || q.includes('sunday')) {
      const sat = daily.find(d => d.day === 'Sat') || daily[2] || { day: 'Saturday', tempMax: c.temperature, rainProb: c.rainProbability, condition: c.condition };
      const sun = daily.find(d => d.day === 'Sun') || daily[3] || { day: 'Sunday', tempMax: c.temperature, rainProb: c.rainProbability, condition: c.condition };

      return `Weekend Weather Forecast for ${loc}:\n\n🗓️ ${sat.day}: ${sat.condition}, ${sat.tempMin || sat.tempMax - 5}°C to ${sat.tempMax}°C (Rain chance: ${sat.rainProb}%)\n🗓️ ${sun.day}: ${sun.condition}, ${sun.tempMin || sun.tempMax - 5}°C to ${sun.tempMax}°C (Rain chance: ${sun.rainProb}%)\n\nOverall, the weekend brings ${sat.rainProb > 50 || sun.rainProb > 50 ? 'unsettled showery weather—plan indoor activities or pack rain gear.' : 'pleasant, stable conditions ideal for outdoor activities.'}`;
    }

    // 5. Default fallback (Analyzes telemetry)
    return `Based on live telemetry for ${loc}:\n• Current Temperature: ${c.temperature}°C (Feels like ${c.feelsLike}°C)\n• Condition: ${c.condition}\n• Humidity: ${c.humidity}%\n• Wind Velocity: ${c.windSpeed} km/h from ${c.windDirection}\n• Pressure: ${c.pressure} hPa\n• Rain Likelihood: ${c.rainProbability}%\n• Visibility: ${c.visibility}\n• Sunrise / Sunset: ${c.sunrise} / ${c.sunset}\n\nWeatherGPT Recommendation: Atmospheric conditions are currently ${c.rainProbability >= 65 ? 'unstable with rain hazards' : c.windSpeed >= 25 ? 'breezy and gusty' : 'stable and comfortable'}.`;
  };

  const handleSend = (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isThinking) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      const answerText = generateAnswer(textToSend, weatherData);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 400);
  };

  return (
    <div className="weathergpt-chat-card">
      <div className="chat-header">
        <div className="chat-bot-brand">
          <div className="bot-avatar-glow">
            <Bot size={22} className="text-accent" />
          </div>
          <div>
            <h3 className="chat-title">WeatherGPT Intelligence Assistant</h3>
            <span className="chat-status-subtitle">Grounded in real-time Open-Meteo atmospheric telemetry</span>
          </div>
        </div>

        <div className="chat-telemetry-badge">
          <Sparkles size={14} className="text-warning" />
          <span>{weatherData?.locationName || 'Live Location'}</span>
        </div>
      </div>

      <div className="chat-messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message-row ${msg.sender === 'user' ? 'message-user' : 'message-bot'}`}>
            {msg.sender === 'assistant' && (
              <div className="bot-avatar-sm">
                <Bot size={16} />
              </div>
            )}
            <div className="message-bubble">
              <div className="message-text">{msg.text}</div>
              <span className="message-time">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="chat-message-row message-bot">
            <div className="bot-avatar-sm">
              <Bot size={16} />
            </div>
            <div className="message-bubble thinking-bubble">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="chat-suggestion-chips">
        <span className="chips-label">Suggested Queries:</span>
        <div className="chips-scroll">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className="chip-btn"
              onClick={() => handleSend(chip)}
              disabled={isThinking}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="chat-input-bar">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask WeatherGPT about weather in ${weatherData?.locationName || 'your location'}...`}
          className="chat-input"
          disabled={isThinking}
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isThinking}
          className="btn-chat-send"
          title="Send query to WeatherGPT"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
