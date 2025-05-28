const { ChatGroq } = require("@langchain/groq");
const prompt = require('prompt-sync')();

module.exports = {
  run: async (name, apiKey, behavior) => {

    console.clear();
    process.emitWarning = () => {};

    const llm = new ChatGroq({
      model: "llama3-8b-8192",
      temperature: 0,
      maxTokens: undefined,
      maxRetries: 2,
      apiKey: apiKey
    });

    let conversationHistory = [
      { role: "system", content: `Meu nome é ${name}. ${behavior}` }
    ];

    console.log("Groq - com Llama 3 (digite 'sair' para encerrar):");

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

        console.log("IA: " + aiMsg.content);
      } catch (error) {
        console.error("Erro ao se comunicar com o modelo:", error.message);
        break;
      }
    }

}}