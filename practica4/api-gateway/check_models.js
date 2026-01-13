const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log("📡 Conectando con Google para listar modelos disponibles...");
    const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init
    
    // Este método lista lo que realmente ve tu API Key
    // Nota: Usamos una instancia genérica para acceder al manager si es posible, 
    // pero la forma más cruda es via fetch directo si el SDK molesta.
    
    console.log("--- INTENTO DE LISTADO ---");
    // Hacemos un fetch manual para saltarnos validaciones del SDK
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.models) {
        console.log("✅ Modelos disponibles para ti:");
        data.models.forEach(m => {
            if (m.supportedGenerationMethods.includes("generateContent")) {
                console.log(`   - ${m.name.replace('models/', '')}`);
            }
        });
    } else {
        console.log("❌ Error leyendo modelos:", data);
    }

  } catch (error) {
    console.error("Error fatal:", error);
  }
}

listModels();