import { GoogleGenerativeAI } from "@google/generative-ai";
import chatbotContext from "@/data/chatbotContext.json";
import { Car } from "@/types/car";
import { UserFinancialProfile } from "@/types/userProfile";
import { FinancingOption } from "@/types/car";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  selectedCars: Car[];
  userProfile: UserFinancialProfile;
  financingOptions: Map<string, { lease: FinancingOption; finance: FinancingOption }>;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file");
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    } catch (error) {
      console.error("Failed to initialize Gemini AI:", error);
    }
  }

  private buildContextPrompt(context: ChatContext): string {
    const { selectedCars, userProfile, financingOptions } = context;

    // Build selected cars information
    const carsInfo = selectedCars.map(car => {
      const financing = financingOptions.get(car.id);
      const carContext = chatbotContext.vehicles.find(v => v.id === car.id);

      let info = `- ${car.year} ${car.name} ${car.model} (${car.category}): $${car.basePrice.toLocaleString()}`;

      if (carContext) {
        info += `\n  Description: ${carContext.description}`;
        info += `\n  Fuel Economy: ${carContext.fuelEconomy}`;
        info += `\n  Best For: ${carContext.bestFor}`;
      }

      if (financing) {
        info += `\n  Lease Options: $${financing.lease.downPayment.toLocaleString()} down, ${financing.lease.interestRate}% APR, ${financing.lease.term} months`;
        info += `\n  Finance Options: $${financing.finance.downPayment.toLocaleString()} down, ${financing.finance.interestRate}% APR, ${financing.finance.term} months`;
      }

      return info;
    }).join('\n\n');

    // Build user profile information
    const profileInfo = `
Monthly Income: $${userProfile.monthlyIncome.toLocaleString()}
Credit Score: ${userProfile.creditScore}
Max Down Payment Available: $${userProfile.maxDownPayment.toLocaleString()}
Preferred Monthly Payment: $${userProfile.preferredMonthlyPayment.toLocaleString()}
Trade-in: ${userProfile.hasTradeIn ? `Yes ($${userProfile.tradeInValue.toLocaleString()})` : 'No'}
`;

    // Calculate affordability insights
    const paymentToIncomeRatio = (userProfile.preferredMonthlyPayment / userProfile.monthlyIncome) * 100;
    const affordabilityNote = paymentToIncomeRatio <= 15
      ? "This is within the recommended 15% payment-to-income ratio - financially healthy."
      : paymentToIncomeRatio <= 20
      ? "This is at the upper limit (15-20% of income). Consider if this fits your budget comfortably."
      : "This exceeds the recommended 20% limit. You may want to consider a lower payment.";

    return `
CONTEXT: You are a Toyota vehicle financing assistant. Use the following information to help the user make informed decisions.

SYSTEM KNOWLEDGE:
${JSON.stringify(chatbotContext, null, 2)}

USER'S CURRENT SELECTION:
${selectedCars.length > 0 ? `The user is currently comparing ${selectedCars.length} vehicle(s):\n${carsInfo}` : 'No vehicles selected yet.'}

USER'S FINANCIAL PROFILE:
${profileInfo}
Affordability Assessment: ${affordabilityNote}

GUIDELINES:
1. Be conversational, helpful, and educational
2. Reference the user's specific selections and financial situation
3. Provide concrete calculations when discussing payments
4. Suggest alternatives if their current selection may strain their budget
5. Explain financing concepts in simple terms
6. Always consider total cost of ownership, not just monthly payment
7. Be honest about affordability without being judgmental
8. Highlight Toyota's reliability and resale value when relevant
9. If user hasn't selected cars yet, help them narrow down based on their needs and budget

Remember: Your goal is to help users make the best financial decision for their situation.
`;
  }

  async sendMessage(
    message: string,
    context: ChatContext,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    if (!this.model) {
      return "I'm sorry, but the chatbot is not configured. Please add your Gemini API key to the .env file (VITE_GEMINI_API_KEY=your_api_key) and restart the development server.";
    }

    try {
      const contextPrompt = this.buildContextPrompt(context);

      // Log user message to terminal
      console.log("\n" + "=".repeat(80));
      console.log("📨 USER MESSAGE:");
      console.log("=".repeat(80));
      console.log(message);
      console.log("=".repeat(80));

      // Build conversation history
      const history = conversationHistory.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

      // Start a chat session with history
      const chat = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: contextPrompt }]
          },
          {
            role: "model",
            parts: [{ text: "I understand. I'm ready to help you with your Toyota vehicle financing questions. I have all the context about your selected vehicles and financial profile." }]
          },
          ...history
        ],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const responseText = response.text();

      // Log AI response to terminal
      console.log("\n" + "=".repeat(80));
      console.log("🤖 AI RESPONSE:");
      console.log("=".repeat(80));
      console.log(responseText);
      console.log("=".repeat(80));
      console.log(`📊 Response length: ${responseText.length} characters`);
      console.log("=".repeat(80) + "\n");

      return responseText;
    } catch (error) {
      console.error("❌ Error sending message to Gemini:", error);

      if (error instanceof Error) {
        if (error.message.includes("API_KEY")) {
          return "There's an issue with the API key. Please check that VITE_GEMINI_API_KEY is correctly set in your .env file.";
        }
        return `I encountered an error: ${error.message}. Please try again.`;
      }

      return "I'm having trouble connecting to the AI service. Please try again in a moment.";
    }
  }

  isConfigured(): boolean {
    return this.model !== null;
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
