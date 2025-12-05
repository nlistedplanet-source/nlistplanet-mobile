/**
 * Re-summarize Existing News Script
 * 
 * This script re-summarizes all existing news articles to ensure
 * they follow the Inshorts-style 60 words max format.
 * 
 * Run: node scripts/resummarizeNews.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import News from '../models/News.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

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

// Summarize content to 60 words max (Inshorts style)
const summarizeContent = (content, maxWords = 60) => {
  if (!content) return '';
  
  // Remove HTML tags
  let text = content.replace(/<[^>]*>/g, '');
  
  // Remove URLs and special chars
  text = text.replace(/https?:\/\/[^\s]+/g, '');
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/\[\+\d+ chars\]/g, '');
  
  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  let summary = '';
  let wordCount = 0;
  
  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    const words = cleanSentence.split(/\s+/);
    
    if (wordCount + words.length <= maxWords) {
      summary += cleanSentence + '. ';
      wordCount += words.length;
    } else if (wordCount < 30) {
      const remaining = maxWords - wordCount;
      summary += words.slice(0, remaining).join(' ') + '...';
      break;
    } else {
      break;
    }
  }
  
  summary = summary.trim();
  if (summary && !summary.endsWith('.') && !summary.endsWith('...')) {
    summary += '.';
  }
  
  return summary || text.split(/\s+/).slice(0, maxWords).join(' ') + '...';
};

const countWords = (text) => {
  return text.split(/\s+/).filter(w => w.length > 0).length;
};

const resummarizeAll = async () => {
  console.log('\n📝 Re-summarizing all news articles...\n');
  
  await connectDB();
  
  const allNews = await News.find({});
  console.log(`Found ${allNews.length} articles\n`);
  
  let updated = 0;
  let alreadyGood = 0;
  
  for (const article of allNews) {
    const currentWords = countWords(article.summary || '');
    
    if (currentWords <= 60) {
      alreadyGood++;
      continue;
    }
    
    const sourceText = article.content || article.summary || '';
    const newSummary = summarizeContent(sourceText);
    const newWords = countWords(newSummary);
    
    if (newSummary && newWords <= 60) {
      await News.findByIdAndUpdate(article._id, { summary: newSummary });
      console.log(`✅ Updated: "${article.title.substring(0, 40)}..." (${currentWords} → ${newWords} words)`);
      updated++;
    } else {
      console.log(`⚠️ Skipped: "${article.title.substring(0, 40)}..." (couldn't reduce to 60 words)`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Total articles: ${allNews.length}`);
  console.log(`   Already ≤60 words: ${alreadyGood}`);
  console.log(`   Updated: ${updated}`);
  console.log('\n✅ Done!\n');
  
  await mongoose.connection.close();
  process.exit(0);
};

resummarizeAll().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
