const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function suggestCategory(description) {
  try {
    const prompt = `
You are an expense categorization assistant.

Choose exactly ONE category from this list:
Food
Petrol
Salary
Shopping
Other

Expense description: "${description}"

Return only the category name. Do not explain.
`;

    const response = await genAI.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const category = response.text.trim();

    const validCategories = ["Food", "Petrol", "Salary", "Shopping", "Other"];

    if (validCategories.includes(category)) {
      return category;
    }

    return "Other";
  } catch (error) {
    console.log("Gemini AI Error:", error.message);
    return "Other";
  }
}

module.exports = {
  suggestCategory,
};
