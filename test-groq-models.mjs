import fs from 'fs';

async function testModel(modelName) {
    const apiKey = process.env.GROQ_API_KEY || "";
    
    // 5x5 red square
    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
    const mime = "image/png";

    const payload = {
        model: modelName,
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: "What color is this square?" },
                    { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } }
                ]
            }
        ],
        max_tokens: 10
    };

    console.log(`\nTesting ${modelName}...`);
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.log("ERROR:", await response.text());
        } else {
            const data = await response.json();
            console.log("SUCCESS:", data.choices[0].message.content);
        }
    } catch (e) {
        console.error("Fetch failed", e);
    }
}

async function run() {
    await testModel("llama-3.2-11b-vision");
    await testModel("llama-3.2-90b-vision");
    await testModel("meta-llama/llama-4-scout-17b-16e-instruct");
    await testModel("meta-llama/llama-3.2-11b-vision-instruct");
    await testModel("llama-3.2-11b-vision-instruct");
}

run();
