const GEMINI_API_KEY = "AIzaSyA81SV6mvA9ShZasJgcVl4ps-YQm9DrKsc";

export async function generateSnapshot(text: string, userInterest?: string): Promise<{
  question: string;
  answer: string;
  summary: string;
  analogy: string;
  mnemonic: string;
  error?: string;
}> {
  try {
    // Updated API endpoint for Gemini 2.0 Flash
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    const prompt = `
    Create a memory aid for the following text: "${text}"
    ${userInterest ? `Create content that resonates with someone who loves ${userInterest}.` : ''}
    
    Please return the result in JSON format with these fields:
    - question: A question that tests understanding of the main concept
    - answer: The answer to the question (concise)
    - summary: A brief summary of the concept (max 2 sentences)
    - analogy: A metaphor or analogy that makes this concept easier to understand
    - mnemonic: A funny, comic-style, visual phrase to help remember this concept${userInterest ? ` (related to ${userInterest})` : ''}
    
    Example format:
    {
      "question": "What is...",
      "answer": "It is...",
      "summary": "...",
      "analogy": "...",
      "mnemonic": "..."
    }
    
    IMPORTANT: Only return the JSON object, nothing else.
    `;
    
    console.log("Making API request to Gemini with URL:", url);
    
    const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
        }
      })
    });

    if (!response.ok) {
      console.error("API request failed with status:", response.status, response.statusText);
      const errorBody = await response.text();
      console.error("Error response body:", errorBody);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini API response:", data);
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }
    
    const content = data.candidates[0].content;
    
    if (!content || !content.parts || content.parts.length === 0) {
      throw new Error("Invalid response structure from Gemini API");
    }
    
    const textResponse = content.parts[0].text;
    
    // Try to extract the JSON part from the response
    let jsonStr = textResponse;
    
    // Extract JSON if wrapped in backticks or other text
    const jsonMatch = textResponse.match(/```json([\s\S]*?)```/) || 
                      textResponse.match(/```([\s\S]*?)```/) ||
                      textResponse.match(/{[\s\S]*}/);
                      
    if (jsonMatch) {
      jsonStr = jsonMatch[0].replace(/```json|```/g, '').trim();
    }
    
    // Parse the JSON
    const parsedResponse = JSON.parse(jsonStr);
    
    return {
      question: parsedResponse.question,
      answer: parsedResponse.answer,
      summary: parsedResponse.summary,
      analogy: parsedResponse.analogy,
      mnemonic: parsedResponse.mnemonic || "Remember this like a visual comic strip in your mind!"
    };
  } catch (error) {
    console.error("Error generating snapshot with Gemini:", error);
    return {
      question: "",
      answer: "",
      summary: "",
      analogy: "",
      mnemonic: "",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}