
// import { Injectable } from '@angular/core';
// import { GoogleGenAI } from 'google';

// @Injectable({
//   providedIn: 'root'
// })
// export class GeminiService {
//   private ai: GoogleGenAI;

//   constructor() {
//     // Initialize with environment API Key
//     this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
//   }

//   async generateDescription(title: string): Promise<string> {
//     if (!title) return '';

//     try {
//       const prompt = `Write a concise, professional software issue description for a task titled: "${title}". 
//       Include "Acceptance Criteria". Keep it under 100 words. Format as plain text.`;
      
//       const response = await this.ai.models.generateContent({
//         model: 'gemini-2.5-flash',
//         contents: prompt,
//       });

//       return response.text || 'Could not generate description.';
//     } catch (error) {
//       console.error('Gemini API Error:', error);
//       return 'Error generating description. Please check your API key.';
//     }
//   }
// }
