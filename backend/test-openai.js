import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

console.log('🔑 Testing API Keys...\n');

// Test OpenAI
const testOpenAI = async () => {
  console.log('1️⃣ Testing OpenAI GPT-4o-mini...');
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a news summarizer. Convert to natural Hindi (aam bolchal wali Hindi). Use Hinglish where natural. Keep 40-50 words max.'
        },
        {
          role: 'user',
          content: 'Title: Reliance Industries shares hit all-time high\n\nSummary: Reliance Industries shares surged 5% to hit a new all-time high after the company reported better-than-expected Q3 results with net profit of Rs 18,540 crore.'
        }
      ],
      max_tokens: 200
    });
    
    console.log('   ✅ OpenAI Working!');
    console.log('   📝 Hindi Summary:', response.choices[0].message.content);
    return true;
  } catch (error) {
    console.log('   ❌ OpenAI Error:', error.message);
    return false;
  }
};

// Test Cloudinary
const testCloudinary = async () => {
  console.log('\n2️⃣ Testing Cloudinary...');
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    // Just verify config
    const result = await cloudinary.api.ping();
    console.log('   ✅ Cloudinary Connected! Status:', result.status);
    return true;
  } catch (error) {
    console.log('   ❌ Cloudinary Error:', error.message);
    return false;
  }
};

// Run tests
const runTests = async () => {
  const openaiOk = await testOpenAI();
  const cloudinaryOk = await testCloudinary();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Results:');
  console.log(`   OpenAI: ${openaiOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Cloudinary: ${cloudinaryOk ? '✅ Working' : '❌ Failed'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  process.exit(0);
};

runTests();
