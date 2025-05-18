import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Gemini with proper error handling and explicit API URL
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey, {
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1'  // Force complete v1 endpoint URL
});

// Validate API key
if (!apiKey || apiKey === '') {
  console.warn("⚠️ WARNING: No Gemini API key provided. Local Mode will be used.");
}

// Models to try (in order of preference)
const MODEL_NAMES = [
  "gemini-pro",        // Standard format often works despite docs
  "models/gemini-pro"  // Full path with models/ prefix
];

// Chat endpoint - handles bot responses
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], language = 'en' } = req.body;
    
    // Verify API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === '') {
      console.log("No API key, using Local Mode");
      return res.status(200).json({ 
        reply: getLocalResponse(language, message),
        useLocalMode: true 
      });
    }
    
    // User instruction with language preference
    const userInstruction = `You are EduBot, a helpful and friendly educational assistant. 
    Keep responses concise, informative and engaging. Focus on providing accurate information 
    and encouraging learning. The user's language preference is: ${getLanguageName(language)}.`;
    
    // Try multiple models
    let lastError = null;
    
    for (const modelName of MODEL_NAMES) {
      try {
        console.log(`Trying ${modelName}...`);
        
        // Using model with full path 
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 2048,
          }
        });
        
        // Simplest possible approach for more reliable API compatibility
        const prompt = [
          { text: userInstruction },
          { text: `User query: ${message}` }
        ];
        
        const result = await model.generateContent(prompt);
        
        console.log(`${modelName} succeeded!`);
        const text = result.response.text();
        return res.json({ reply: text });
      } catch (error) {
        console.log(`${modelName} failed: ${error.message}`);
        lastError = error;
        // Continue to next model
      }
    }
    
    // If we get here, all models failed
    console.log("All API models failed, using Local Mode");
    
    // Return local response
    return res.status(200).json({ 
      reply: getLocalResponse(language, message),
      useLocalMode: true 
    });
    
  } catch (finalError) {
    console.error('Gemini chat error:', finalError);
    
    // Return local response for any errors
    return res.status(200).json({ 
      reply: getLocalResponse(req.body.language || 'en', req.body.message || ''),
      useLocalMode: true 
    });
  }
});

// Translation endpoint using Gemini's language capabilities
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    
    // Verify API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === '') {
      // Just return the original text for Local Mode
      return res.json({ translatedText: text });
    }
    
    if (!text || !targetLanguage) {
      return res.json({ translatedText: text });
    }
    
    const languageName = getLanguageName(targetLanguage);
    
    // Simple prompt for translation
    const transPrompt = [
      { text: `Translate the following text to ${languageName}. Only return the translated text, no explanations.` },
      { text: text }
    ];
    
    // Try multiple models for translation
    for (const modelName of MODEL_NAMES) {
      try {
        console.log(`Trying ${modelName} for translation...`);
        
        // Using model with full path
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.1,  // Lower temp for more accurate translation
          }
        });
        
        const result = await model.generateContent(transPrompt);
        const translatedText = result.response.text();
        
        // Clean up the response - remove quotes or extra spaces if present
        const cleanedText = translatedText.replace(/^["'\s]+|["'\s]+$/g, '');
        return res.json({ translatedText: cleanedText });
      } catch (error) {
        // Continue to next model
        console.log(`Translation with ${modelName} failed: ${error.message}`);
      }
    }
    
    // If all models fail, just return the original text
    return res.json({ translatedText: text });
    
  } catch (error) {
    console.error('Gemini translation error:', error);
    // Return original text on error
    return res.json({ translatedText: req.body.text || '' });
  }
});

// Language detection using Gemini's AI capabilities
router.post('/detect', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Default to English for missing API key or text
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === '' || !text) {
      return res.json({ languageCode: 'en' });
    }
    
    // Simple prompt for language detection
    const detectPrompt = [
      { text: 'Detect the language of the following text. Respond with just the language code (e.g. \'en\' for English, \'es\' for Spanish, etc.).' },
      { text: text }
    ];
    
    // Try multiple models for language detection
    for (const modelName of MODEL_NAMES) {
      try {
        console.log(`Trying ${modelName} for language detection...`);
        
        // Using model with full path
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0,  // Zero temp for deterministic language detection
          }
        });
        
        const result = await model.generateContent(detectPrompt);
        const detectedLanguage = result.response.text().trim().toLowerCase();
        
        // Extract just the language code if the model returns more than that
        const languageCode = detectedLanguage.match(/^([a-z]{2})/) ? 
                            detectedLanguage.match(/^([a-z]{2})/)[0] : 'en';
        
        return res.json({ languageCode });
      } catch (error) {
        // Continue to next model
        console.log(`Language detection with ${modelName} failed: ${error.message}`);
      }
    }
    
    // Default to English if all models fail
    return res.json({ languageCode: 'en' });
    
  } catch (error) {
    console.error('Gemini language detection error:', error);
    // Default to English for any errors
    return res.json({ languageCode: 'en' });
  }
});

// Helper function to get full language name from code
function getLanguageName(langCode) {
  const languages = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'hi': 'Hindi',
    'kn': 'Kannada',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'ru': 'Russian',
    'te': 'Telugu',
    'ta': 'Tamil',
    'ml': 'Malayalam',
    'mr': 'Marathi',
    'bn': 'Bengali'
  };
  
  return languages[langCode] || langCode;
}

// Helper function to generate local responses
function getLocalResponse(language, message) {
  // General educational responses across languages
  const responses = {
    'en': [
      "I can help you with your studies and learning materials.",
      "Would you like to practice some exercises?",
      "Let me know if you need help understanding any topic.",
      "I can explain complex concepts in a simple way.",
      "Education is the key to success. How can I help you today?",
      "I'm here to assist with your educational needs.",
      "What subject are you currently studying?",
      "Learning is a lifelong journey. I'm here to help."
    ],
    'hi': [
      "मैं आपकी पढ़ाई और सीखने की सामग्री में मदद कर सकता हूं।",
      "क्या आप कुछ अभ्यास करना चाहेंगे?",
      "यदि आपको किसी विषय को समझने में मदद चाहिए तो मुझे बताएं।",
      "मैं जटिल अवधारणाओं को सरल तरीके से समझा सकता हूं।",
      "शिक्षा सफलता की कुंजी है। मैं आज आपकी कैसे मदद कर सकता हूं?",
      "मैं आपकी शैक्षिक जरूरतों में सहायता के लिए यहां हूँ।"
    ],
    'kn': [
      "ನಾನು ನಿಮ್ಮ ಅಧ್ಯಯನ ಮತ್ತು ಕಲಿಕೆಯ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
      "ಕೆಲವು ಅಭ್ಯಾಸಗಳನ್ನು ಪ್ರಯತ್ನಿಸಲು ಬಯಸುವಿರಾ?",
      "ಯಾವುದೇ ವಿಷಯವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಬೇಕಾದರೆ ತಿಳಿಸಿ.",
      "ನಾನು ಸಂಕೀರ್ಣ ಪರಿಕಲ್ಪನೆಗಳನ್ನು ಸರಳವಾಗಿ ವಿವರಿಸಬಲ್ಲೆ.",
      "ಶಿಕ್ಷಣವು ಯಶಸ್ಸಿನ ಕೀಲಿಕೈ. ನಾನು ಇಂದು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
      "ನಿಮ್ಮ ಶೈಕ್ಷಣಿಕ ಅಗತ್ಯತೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ."
    ],
    'te': [
      "నేను మీ చదువులు మరియు నేర్చుకోవడానికి సహాయం చేయగలను.",
      "మీరు కొన్ని అభ్యాసాలను ప్రయత్నించాలనుకుంటున్నారా?",
      "ఏదైనా విషయాన్ని అర్థం చేసుకోవడానికి సహాయం కావాలంటే నాకు తెలియజేయండి.",
      "నేను క్లిష్టమైన భావనలను సరళంగా వివరించగలను.",
      "విద్య విజయానికి కీలకం. నేను ఈరోజు మీకు ఎలా సహాయం చేయగలను?",
      "మీ విద్యా అవసరాలకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను."
    ],
    'ta': [
      "நான் உங்கள் படிப்பு மற்றும் கற்றல் பொருட்களில் உதவ முடியும்.",
      "சில பயிற்சிகளை முயற்சிக்க விரும்புகிறீர்களா?",
      "ஏதேனும் தலைப்பை புரிந்துகொள்ள உதவி தேவைப்பட்டால் என்னிடம் தெரிவிக்கவும்.",
      "நான் சிக்கலான கருத்துக்களை எளிய முறையில் விளக்க முடியும்.",
      "கல்வி வெற்றிக்கு திறவுகோல். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
      "உங்கள் கல்வித் தேவைகளுக்கு உதவ நான் இங்கே இருக்கிறேன்."
    ],
    'es': [
      "Puedo ayudarte con tus estudios y materiales de aprendizaje.",
      "¿Te gustaría practicar algunos ejercicios?",
      "Hazme saber si necesitas ayuda para entender cualquier tema.",
      "Puedo explicar conceptos complejos de manera simple.",
      "La educación es la clave del éxito. ¿Cómo puedo ayudarte hoy?",
      "Estoy aquí para ayudarte con tus necesidades educativas."
    ],
    'fr': [
      "Je peux vous aider avec vos études et votre matériel d'apprentissage.",
      "Aimeriez-vous pratiquer quelques exercices ?",
      "Faites-moi savoir si vous avez besoin d'aide pour comprendre un sujet.",
      "Je peux expliquer des concepts complexes de manière simple.",
      "L'éducation est la clé du succès. Comment puis-je vous aider aujourd'hui ?",
      "Je suis là pour vous aider dans vos besoins éducatifs."
    ],
    'de': [
      "Ich kann Ihnen bei Ihrem Studium und Lernmaterialien helfen.",
      "Möchten Sie einige Übungen ausprobieren?",
      "Lassen Sie mich wissen, wenn Sie Hilfe beim Verständnis eines Themas benötigen.",
      "Ich kann komplexe Konzepte auf einfache Weise erklären.",
      "Bildung ist der Schlüssel zum Erfolg. Wie kann ich Ihnen heute helfen?",
      "Ich bin hier, um Ihnen bei Ihren Bildungsbedürfnissen zu helfen."
    ]
  };
  
  // Topic-specific responses (for basic keyword detection)
  const topicResponses = {
    'math': {
      'en': "Mathematics is a beautiful subject! I can help you with concepts from basic arithmetic to advanced calculus.",
      'hi': "गणित एक सुंदर विषय है! मैं आपको बुनियादी अंकगणित से लेकर उन्नत कलन तक की अवधारणाओं में मदद कर सकता हूं।",
      'kn': "ಗಣಿತವು ಸುಂದರವಾದ ವಿಷಯ! ಮೂಲ ಅಂಕಗಣಿತದಿಂದ ಸುಧಾರಿತ ಕಲನಶಾಸ್ತ್ರದವರೆಗಿನ ಪರಿಕಲ್ಪನೆಗಳಲ್ಲಿ ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ."
    },
    'science': {
      'en': "Science helps us understand the world around us. Which branch of science are you interested in?",
      'hi': "विज्ञान हमें अपने आसपास की दुनिया को समझने में मदद करता है। आप विज्ञान की किस शाखा में रुचि रखते हैं?",
      'kn': "ವಿಜ್ಞಾನವು ನಮ್ಮ ಸುತ್ತಲಿನ ಜಗತ್ತನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ನೀವು ವಿಜ್ಞಾನದ ಯಾವ ಶಾಖೆಯಲ್ಲಿ ಆಸಕ್ತಿ ಹೊಂದಿದ್ದೀರಿ?"
    },
    'history': {
      'en': "History teaches us about our past and helps shape our future. What period of history interests you?",
      'hi': "इतिहास हमें अपने अतीत के बारे में सिखाता है और हमारे भविष्य को आकार देने में मदद करता है। इतिहास का कौन सा काल आपको आकर्षित करता है?",
      'kn': "ಇತಿಹಾಸವು ನಮ್ಮ ಭೂತಕಾಲದ ಬಗ್ಗೆ ನಮಗೆ ಕಲಿಸುತ್ತದೆ ಮತ್ತು ನಮ್ಮ ಭವಿಷ್ಯವನ್ನು ರೂಪಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಇತಿಹಾಸದ ಯಾವ ಅವಧಿ ನಿಮಗೆ ಆಸಕ್ತಿ ಉಂಟುಮಾಡುತ್ತದೆ?"
    }
  };
  
  // Simple keyword detection for topic-specific responses
  const lowerMessage = message.toLowerCase();
  for (const [topic, responses] of Object.entries(topicResponses)) {
    if (lowerMessage.includes(topic)) {
      return responses[language] || responses['en'];
    }
  }
  
  // Get responses for the requested language or fallback to English
  const availableResponses = responses[language] || responses['en'];
  
  // Return a random response from the available ones
  return availableResponses[Math.floor(Math.random() * availableResponses.length)];
}

export default router; 