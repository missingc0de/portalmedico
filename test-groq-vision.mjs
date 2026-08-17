import fs from 'fs';

async function testVision() {
    // 1x1 pixel base64 encoded PNG
    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkSAAAAC8AKyO85L0AAAAASUVORK5CYII=";
    const mime = "image/png";
    const apiKey = process.env.GROQ_API_KEY || "";

    const payload = {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: "Describe this image in one word." },
                    { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } }
                ]
            }
        ]
    };

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
            console.log(await response.text());
        } else {
            const data = await response.json();
            console.log("SUCCESS:", data.choices[0].message.content);
        }
    } catch (e) {
        console.error("Fetch failed", e);
    }
}

testVision();
