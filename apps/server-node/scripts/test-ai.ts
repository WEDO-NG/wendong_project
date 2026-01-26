import dotenv from 'dotenv';
import path from 'path';
import OpenAI from 'openai';

// 显式加载 .env 文件 (因为脚本不在根目录运行可能找不到)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const apiKey = process.env.AI_API_KEY;
  const baseURL = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL_NAME;

  console.log('--- AI Configuration Check ---');
  console.log(`API Key Exists: ${!!apiKey}`);
  console.log(`Base URL: ${baseURL}`);
  console.log(`Model: ${model}`);
  console.log('------------------------------\n');

  if (!apiKey || !baseURL || !model) {
    console.error('❌ Missing environment variables. Please check .env file.');
    process.exit(1);
  }

  const client = new OpenAI({
    apiKey,
    baseURL,
  });

  console.log('🚀 Sending test request to DeepSeek...');
  const startTime = Date.now();

  try {
    const stream = await client.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: 'Hello! Please say "DeepSeek is ready" in Chinese.' }],
      stream: true,
    });

    console.log('\n--- Response Stream ---');
    let fullContent = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      process.stdout.write(content);
      fullContent += content;
    }

    const duration = Date.now() - startTime;
    console.log('\n\n-----------------------');
    console.log(`✅ Test Passed!`);
    console.log(`⏱️ Duration: ${duration}ms`);
    console.log(`📝 Full Response: ${fullContent}`);

  } catch (error) {
    console.error('\n❌ Test Failed:');
    if (error instanceof OpenAI.APIError) {
      console.error(`Status: ${error.status}`);
      console.error(`Message: ${error.message}`);
      console.error(`Code: ${error.code}`);
      console.error(`Type: ${error.type}`);
    } else {
      console.error(error);
    }
  }
}

main();
