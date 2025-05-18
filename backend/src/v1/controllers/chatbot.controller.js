const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Validate API key
if (!apiKey || apiKey === '') {
  console.warn("⚠️ WARNING: No Gemini API key provided for chatbot controller. Local Mode will be used.");
}

const chatWithBot = async (req, res) => {
  try {
    const { message, language } = req.body;

    // Verify API key is configured
    if (!apiKey || apiKey === '') {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured or invalid',
        useLocalMode: true
      });
    }

    // Create chat context focused on education
    const context = `You are EduBot, an educational assistant focused on helping students learn. 
    You specialize in:
    - Explaining complex concepts in simple terms
    - Providing step-by-step solutions to problems
    - Offering study tips and learning strategies
    - Answering questions across various academic subjects
    - Helping with homework and assignments
    Current language: ${language}
    Response style: Clear, concise, and encouraging`;

    // Create a prompt format that directly includes the context
    const fullPrompt = `${context}\n\nUser: ${message}\nAssistant:`;
    
    // Try different approaches to connect to the API
    try {
      // First try standard model
      console.log("Trying gemini-pro model in controller...");
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();
      console.log("gemini-pro model succeeded in controller!");
      return res.json({ success: true, response: text });
    } catch (firstError) {
      console.log("First attempt failed in controller:", firstError.message);
      
      try {
        // Try alternative model name
        console.log("Trying gemini-1.0-pro model in controller...");
        const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
        const result = await model.generateContent(fullPrompt);
        const text = result.response.text();
        console.log("gemini-1.0-pro model succeeded in controller!");
        return res.json({ success: true, response: text });
      } catch (secondError) {
        console.log("Second attempt failed in controller:", secondError.message);
        console.log("All attempts failed, using Local Mode");
        
        // Return error indicating we should use Local Mode
        return res.status(500).json({
          success: false,
          error: 'All API attempts failed',
          details: 'No suitable API model found or connection issues',
          useLocalMode: true
        });
      }
    }
  } catch (error) {
    console.error('Chatbot Error:', error);
    
    // Check for specific errors
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      return res.status(401).json({ 
        success: false,
        error: 'API key is invalid or expired', 
        details: 'Please check your Gemini API key',
        useLocalMode: true
      });
    }
    
    // Check for rate limit errors
    if (error.status === 429) {
      return res.status(429).json({ 
        success: false,
        error: 'Rate limit exceeded', 
        details: 'The API quota has been exceeded. Please try again later.',
        useLocalMode: true
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate response',
      details: error.message,
      useLocalMode: true
    });
  }
};

module.exports = {
  chatWithBot
};
