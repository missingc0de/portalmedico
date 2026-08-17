export enum Type {
  STRING = "STRING",
  NUMBER = "NUMBER",
  INTEGER = "INTEGER",
  BOOLEAN = "BOOLEAN",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT"
}

export class UniversalAIClient {
  apiKey: string;
  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }

  models = {
    generateContent: async (request: any) => {
      let userMessageContent: any[] = [];
      let hasImage = false;

      const parts = request.contents?.parts || request.contents?.[0]?.parts || [];
      
      for (const part of parts) {
        if (part.text) {
          userMessageContent.push({ type: "text", text: part.text });
        } else if (part.inlineData) {
           const mime = part.inlineData.mimeType;
           const base64 = part.inlineData.data;
           userMessageContent.push({
             type: "image_url",
             image_url: { url: `data:${mime};base64,${base64}` }
           });
           hasImage = true;
        }
      }

      let targetModel = "llama3-70b-8192";
      if (hasImage) {
         targetModel = "meta-llama/llama-4-scout-17b-16e-instruct";
      }

      let contentPayload: any = userMessageContent;
      if (!hasImage) {
         // Collapse into a single string if no images, to be absolutely safe with Groq standard parsing
         contentPayload = userMessageContent.map(c => c.text).join('\n');
      }

      const payload: any = {
        model: targetModel,
        messages: [{ role: "user", content: contentPayload }],
        temperature: 0.1,
      };

      if (!hasImage && (request.config?.responseMimeType === 'application/json' || request.config?.responseSchema)) {
        payload.response_format = { type: "json_object" };
      } else if (hasImage && (request.config?.responseMimeType === 'application/json' || request.config?.responseSchema)) {
         // Vision model might not support response_format strict json, inject instruction
         if (typeof contentPayload === 'string') {
             contentPayload += "\n\nIMPORTANT: Return ONLY a valid JSON object matching the requested schema. No conversational text.";
             payload.messages = [{ role: "user", content: contentPayload }];
         } else if (Array.isArray(contentPayload)) {
             contentPayload.push({ type: "text", text: "\n\nIMPORTANT: Return ONLY a valid JSON object matching the requested schema. No conversational text." });
         }
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Error en el motor de IA (Groq): ${response.status} - ${err}`);
      }

      const data = await response.json();
      let textResponse = data.choices[0].message.content;

      // Sometimes models wrap JSON in markdown blocks
      if (textResponse.startsWith('```json')) {
         textResponse = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      return {
        text: textResponse
      };
    }
  };
}

export const getAiClient = () => {
    // Injecting Groq API key from environment variable
    return new UniversalAIClient({ apiKey: process.env.GROQ_API_KEY || '' });
};
