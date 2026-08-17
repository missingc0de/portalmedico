import fs from 'fs';

async function testVision() {
    const apiKey = process.env.GROQ_API_KEY || "";

    const payload = {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: "What runs on this track?" },
                    { type: "image_url", image_url: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg/1200px-Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg" } }
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
            console.log("ERROR:", await response.text());
        } else {
            const data = await response.json();
            console.log("SUCCESS:", data.choices[0].message.content);
        }
    } catch (e) {
        console.error("Fetch failed", e);
    }
}

testVision();
