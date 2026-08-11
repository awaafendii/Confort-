import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client using the required named parameter and environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSafetyTips = async (destination: string): Promise<string> => {
  try {
    // Use gemini-3-flash-preview for basic text tasks as per guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Donne-moi 3 conseils de sécurité brefs et concis pour un trajet en Taxi ou Moto-Taxi à Conakry (Guinée) vers ${destination}. Prends en compte les embouteillages et la sécurité routière locale.`,
    });
    // Use the .text property to extract output string (not a method).
    return response.text || "Restez vigilant, portez un casque en moto et vérifiez le prix avant de monter.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Service d'assistance indisponible pour le moment.";
  }
};

export const analyzeAdminData = async (activeDrivers: number, totalRevenue: number): Promise<string> => {
    try {
      // Use gemini-3-flash-preview for basic data analysis tasks.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `En tant qu'analyste de données pour une application de transport à Conakry, analyse ces chiffres actuels : ${activeDrivers} conducteurs actifs, ${totalRevenue} GNF de revenus aujourd'hui. Donne une suggestion stratégique brève pour optimiser la flotte dans la zone de Kaloum ou Dixinn.`,
      });
      // Use the .text property to extract output string.
      return response.text || "Analyse en cours...";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Impossible de générer l'analyse.";
    }
  };