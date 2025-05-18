import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaLanguage, FaPaperPlane } from 'react-icons/fa';

// Add Kannada font
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// Predefined responses for demo
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

const languages = [
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'hi', name: 'हिंदी' },
];

const ChatBot = ({ isOpen, onClose }) => {
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
    
    // Clear any existing timeouts
    if (window.botResponseTimeout) {
      clearTimeout(window.botResponseTimeout);
    }
    
    window.botResponseTimeout = setTimeout(() => {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      
      {/* Chat Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-100 z-50">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white/50 to-teal-50/50 backdrop-blur-md z-0" />
        <div className="relative z-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FaRobot className="text-white text-xl" />
              <h2 className="text-white font-medium">EduBot</h2>
            </div>
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
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages Container */}
          <div 
            className="h-[400px] overflow-y-auto p-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50 scroll-smooth" 
            style={{ 
              fontFamily: selectedLanguage === 'kn' ? 'Noto Sans Kannada, sans-serif' : 'inherit',
              direction: selectedLanguage === 'hi' ? 'rtl' : 'ltr'
            }}
          >
            {/* Welcome Message */}
            <div className="text-center mb-4">
              <span className="inline-block px-4 py-2 bg-emerald-100/50 rounded-full text-emerald-600 text-sm">
                {selectedLanguage === 'en' && 'Welcome to EduBot Assistant!'}
                {selectedLanguage === 'es' && '¡Bienvenido a EduBot Assistant!'}
                {selectedLanguage === 'fr' && 'Bienvenue sur EduBot Assistant!'}
                {selectedLanguage === 'hi' && 'EduBot असिस्टेंट में आपका स्वागत है!'}
                {selectedLanguage === 'kn' && 'EduBot ಸಹಾಯಕಕ್ಕೆ ಸ್ವಾಗತ!'}
              </span>
            </div>
            <div className="space-y-4">
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
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl transform transition-all duration-300 hover:scale-[1.02] ${
                      message.isBot
                        ? 'bg-white shadow-md rounded-tl-none'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white/95 border-t border-emerald-100">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={selectedLanguage === 'kn' ? 'ನಿಮ್ಮ ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...' : 'Type your message...'}
                className="flex-1 px-4 py-2 rounded-xl border-2 border-emerald-100 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 transition-all duration-300"
                style={{ fontFamily: selectedLanguage === 'kn' ? 'Noto Sans Kannada, sans-serif' : 'inherit' }}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center"
                aria-label="Send message"
                disabled={!inputText.trim() || typing}
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
          <div ref={messagesEndRef} />
        </div>
      </div>
    </>
  );
};

export default ChatBot;
