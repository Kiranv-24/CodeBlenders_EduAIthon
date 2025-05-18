import React from 'react';
import { FaRobot, FaLanguage } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';

// Add Kannada font
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const languages = [
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'hi', name: 'हिंदी' }
];

const botResponses = {
  kn: [
    "ನಾನು ನಿಮ್ಮ ಅಧ್ಯಯನ ಮತ್ತು ಕಲಿಕೆಯ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
    "ಕೆಲವು ಅಭ್ಯಾಸಗಳನ್ನು ಪ್ರಯತ್ನಿಸಲು ಬಯಸುವಿರಾ?",
    "ಯಾವುದೇ ವಿಷಯವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಬೇಕಾದರೆ ತಿಳಿಸಿ.",
    "ನಾನು ಸಂಕೀರ್ಣ ಪರಿಕಲ್ಪನೆಗಳನ್ನು ಸರಳವಾಗಿ ವಿವರಿಸಬಲ್ಲೆ.",
  ],
  en: [
    "I can help you with your studies and learning materials.",
    "Would you like to practice some exercises?",
    "Let me know if you need help understanding any topic.",
    "I can explain complex concepts in a simple way.",
  ],
  es: [
    "Puedo ayudarte con tus estudios y materiales de aprendizaje.",
    "¿Te gustaría practicar algunos ejercicios?",
    "Avísame si necesitas ayuda para entender algún tema.",
    "Puedo explicar conceptos complejos de manera simple.",
  ],
  fr: [
    "Je peux vous aider avec vos études et vos supports d'apprentissage.",
    "Voulez-vous faire quelques exercices?",
    "Dites-moi si vous avez besoin d'aide pour comprendre un sujet.",
    "Je peux expliquer des concepts complexes simplement.",
  ],
  hi: [
    "मैं आपकी पढ़ाई और सीखने की सामग्री में मदद कर सकता हूं।",
    "क्या आप कुछ अभ्यास करना चाहेंगे?",
    "यदि आपको किसी विषय को समझने में मदद चाहिए तो मुझे बताएं।",
    "मैं जटिल अवधारणाओं को सरल तरीके से समझा सकता हूं।",
  ]
};

const ChatPage = () => {
  const messagesEndRef = useRef(null);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateBotResponse = () => {
    setTyping(true);
    const responses = botResponses[selectedLanguage];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    setTimeout(() => {
      setMessages(prev => [...prev, { text: randomResponse, isBot: true }]);
      setTyping(false);
    }, 1500);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages(prev => [...prev, { text: inputText, isBot: false }]);
    setInputText('');
    simulateBotResponse();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto pt-8 px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <FaRobot className="text-white text-2xl" />
            <h1 className="text-white text-xl font-medium">EduBot Assistant</h1>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-white/20 text-white rounded-lg pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none cursor-pointer hover:bg-white/30 transition-colors duration-300"
                style={{ fontFamily: selectedLanguage === 'kn' ? 'Noto Sans Kannada, sans-serif' : 'inherit' }}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code} className="text-gray-800">
                    {lang.name}
                  </option>
                ))}
              </select>
              <FaLanguage className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/80 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div 
          className="h-[600px] overflow-y-auto p-6 bg-white border-x border-emerald-100" 
          style={{ 
            fontFamily: selectedLanguage === 'kn' ? 'Noto Sans Kannada, sans-serif' : 'inherit',
            direction: selectedLanguage === 'hi' ? 'rtl' : 'ltr'
          }}
        >
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <span className="inline-block px-6 py-3 bg-emerald-100/50 rounded-full text-emerald-600 text-sm">
              {selectedLanguage === 'en' && 'Welcome to EduBot Assistant!'}
              {selectedLanguage === 'es' && '¡Bienvenido a EduBot Assistant!'}
              {selectedLanguage === 'fr' && 'Bienvenue sur EduBot Assistant!'}
              {selectedLanguage === 'hi' && 'EduBot असिस्टेंट में आपका स्वागत है!'}
              {selectedLanguage === 'kn' && 'EduBot ಸಹಾಯಕಕ್ಕೆ ಸ್ವಾಗತ!'}
            </span>
          </div>

          <div className="space-y-6">
            {/* Typing Indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white shadow-md rounded-2xl rounded-tl-none p-3 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-0"></div>
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl transform transition-all duration-300 hover:scale-[1.02] ${
                    message.isBot
                      ? 'bg-white shadow-md rounded-tl-none'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white rounded-b-2xl border border-t-0 border-emerald-100 shadow-lg">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={selectedLanguage === 'kn' ? 'ನಿಮ್ಮ ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...' : 'Type your message...'}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-emerald-100 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 transition-all duration-300"
              style={{ fontFamily: selectedLanguage === 'kn' ? 'Noto Sans Kannada, sans-serif' : 'inherit' }}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2"
              aria-label="Send message"
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
