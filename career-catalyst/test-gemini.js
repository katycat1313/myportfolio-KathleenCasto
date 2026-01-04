const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
    const modelsToTry = [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-2.0-flash-exp',
        'models/gemini-pro',
        'models/gemini-1.5-pro',
        'models/gemini-1.5-flash'
    ];

    console.log('Testing Gemini API models...\n');
    console.log('API Key:', process.env.GEMINI_API_KEY.substring(0, 20) + '...\n');

    for (const modelName of modelsToTry) {
        try {
            console.log(`Testing: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say "test successful"');
            const response = await result.response;
            const text = response.text();
            console.log(`✅ SUCCESS: ${modelName}`);
            console.log(`   Response: ${text.substring(0, 50)}...\n`);
            break; // Stop after first success
        } catch (error) {
            console.log(`❌ FAILED: ${modelName}`);
            console.log(`   Error: ${error.message}\n`);
        }
    }
}

testModels().catch(console.error);
