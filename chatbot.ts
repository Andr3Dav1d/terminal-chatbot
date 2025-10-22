import { ChatGroq } from "@langchain/groq";
import promptSync from 'prompt-sync';

const prompt = promptSync();

const run = async (name: string, apiKey: string, behavior: string) => {

    console.clear();
    process.emitWarning = () => {};

    const llm = new ChatGroq({
      model: "groq/compound",
      temperature: 0,
      maxTokens: undefined,
      maxRetries: 2,
      apiKey: apiKey
    });

    let conversationHistory: { role: string; content: any }[] = [
      { role: "system", content: `Meu nome é ${name}. ${behavior}` }
    ];

    console.log("Groq - Chatbot (digite 'sair' para encerrar):");

    while (true) {
      const question = prompt('Você: ');
      
      if (question.toLowerCase() === "sair") {
        console.log("IA: Até logo!");
        break;
      }

      conversationHistory.push({ role: "user", content: question });

      try {
        const aiMsg = await llm.invoke(conversationHistory);
        conversationHistory.push({ role: "assistant", content: aiMsg.content });

        const resultText = (() => {
          const c: any = aiMsg.content;
          if (typeof c === "string") return c;
          if (Array.isArray(c)) {
            return c
              .map((part: any) => {
                if (typeof part === "string") return part;
                if (part && typeof part === "object" && "text" in part) return part.text;
                return JSON.stringify(part);
              })
              .join("");
          }
          if (c && typeof c === "object" && "text" in c) return c.text;
          return String(c);
        })();

        console.log("IA: " + resultText);
      } catch (error: any) {
        console.error("Erro ao se comunicar com o modelo:", error.message);
        break;
      }
    }

}

export default run;