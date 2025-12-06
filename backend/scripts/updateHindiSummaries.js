/**
 * Update Hindi Summaries for Existing News
 * 
 * This script fetches all news without Hindi summary and generates them using GPT-4o-mini.
 * Run manually: node scripts/updateHindiSummaries.js
 */

import mongoose from 'mongoose';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import News from '../models/News.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Generate Hindi summary
const generateHindiSummary = async (title, englishSummary) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a news summarizer. Convert English news to natural, conversational Hindi (aam bolchal wali Hindi). 

Rules:
- Use simple Hindi that common people speak, NOT formal/translated Hindi
- Keep it 50-60 words max
- Make it sound like a friend is telling you the news
- Use Hinglish where natural (common English words like "shares", "market", "company" can stay)
- Don't use heavy Sanskrit-based Hindi words
- The tone should be casual but informative`
        },
        {
          role: 'user',
          content: `Title: ${title}\n\nEnglish Summary: ${englishSummary}\n\nConvert this to natural Hindi:`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });
    
    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.log(`  ⚠️ Error: ${error.message}`);
    return '';
  }
};

// Main function
const updateAllNews = async () => {
  console.log('\n🚀 Updating Hindi Summaries for Existing News...');
  console.log(`📅 ${new Date().toISOString()}\n`);
  
  await connectDB();
  
  // Find news without Hindi summary
  const newsWithoutHindi = await News.find({
    $or: [
      { hindiSummary: { $exists: false } },
      { hindiSummary: '' },
      { hindiSummary: null }
    ]
  }).sort({ publishedAt: -1 });
  
  console.log(`📰 Found ${newsWithoutHindi.length} news articles without Hindi summary\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (let i = 0; i < newsWithoutHindi.length; i++) {
    const news = newsWithoutHindi[i];
    console.log(`[${i + 1}/${newsWithoutHindi.length}] ${news.title.substring(0, 50)}...`);
    
    const hindiSummary = await generateHindiSummary(news.title, news.summary);
    
    if (hindiSummary) {
      await News.updateOne(
        { _id: news._id },
        { $set: { hindiSummary } }
      );
      console.log(`   ✅ Hindi: ${hindiSummary.substring(0, 60)}...`);
      updated++;
    } else {
      console.log(`   ❌ Failed to generate`);
      failed++;
    }
    
    // Rate limiting - wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log(`   Total: ${newsWithoutHindi.length}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Failed: ${failed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  await mongoose.connection.close();
  process.exit(0);
};

updateAllNews().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
