// Auto News Fetcher Script for Mobile Backend
// 
// This script automatically fetches news from RSS feeds and APIs,
// summarizes them (Inshorts-style 60 words max), and stores in database.
// 
// NEW FEATURES:
// - Hindi summarization using OpenAI GPT-4 (natural conversational Hindi)
// - AI image generation using DALL-E 3 for articles without thumbnails
// 
// Run via cron job every 6 hours or manually: node scripts/fetchNews.js
// GitHub Actions workflow: .github/workflows/fetch-news.yml

import mongoose from 'mongoose';
import Parser from 'rss-parser';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import News from '../models/News.js';

// Fix path for dotenv when running from scripts folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Check if OpenAI is configured
const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
if (!isOpenAIConfigured) {
  console.log('⚠️ OPENAI_API_KEY not set - Hindi summaries and AI images will be skipped');
}

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

// RSS Parser
const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure']
  }
});

// RSS Feed Sources for Unlisted/Pre-IPO/Stock Market News
const RSS_FEEDS = [
  // ===== A. INDIA BUSINESS & MARKET NEWS =====
  {
    url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
    name: 'Economic Times Markets',
    category: 'Market'
  },
  {
    url: 'https://economictimes.indiatimes.com/markets/ipos/fpos/rssfeeds/12167922.cms',
    name: 'ET IPO',
    category: 'IPO'
  },
  {
    url: 'https://www.livemint.com/rss/markets',
    name: 'Livemint Markets',
    category: 'Market'
  },
  {
    url: 'https://www.livemint.com/rss/business',
    name: 'Livemint Business',
    category: 'Market'
  },
  {
    url: 'https://www.business-standard.com/rss/markets-106.rss',
    name: 'Business Standard Markets',
    category: 'Market'
  },
  {
    url: 'https://www.moneycontrol.com/rss/MCtopnews.xml',
    name: 'Moneycontrol Top News',
    category: 'Market'
  },
  {
    url: 'https://www.thehindubusinessline.com/feeder/default.rss',
    name: 'The Hindu Business Line',
    category: 'Market'
  },
  {
    url: 'https://www.financialexpress.com/feed/',
    name: 'Financial Express',
    category: 'Market'
  },
  
  // ===== B. STARTUP, FUNDING & PRIVATE MARKET =====
  {
    url: 'https://techcrunch.com/feed/',
    name: 'TechCrunch',
    category: 'Startup'
  },
  
  // ===== C. INTERNATIONAL MARKET & FINANCIAL NEWS =====
  {
    url: 'https://finance.yahoo.com/news/rssindex',
    name: 'Yahoo Finance',
    category: 'Market'
  },
  {
    url: 'https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best',
    name: 'Reuters Markets',
    category: 'Market'
  },
  {
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    name: 'CNBC World',
    category: 'Market'
  },
  {
    url: 'https://www.marketwatch.com/rss/topstories',
    name: 'MarketWatch',
    category: 'Market'
  },
  
  // ===== D. GOOGLE NEWS - KEYWORD BASED =====
  {
    url: 'https://news.google.com/rss/search?q=unlisted+shares+india&hl=en-IN&gl=IN&ceid=IN:en',
    name: 'Google News - Unlisted Shares',
    category: 'Unlisted'
  },
  {
    url: 'https://news.google.com/rss/search?q=pre+ipo+india&hl=en-IN&gl=IN&ceid=IN:en',
    name: 'Google News - Pre-IPO',
    category: 'IPO'
  },
  {
    url: 'https://news.google.com/rss/search?q=startup+funding+india&hl=en-IN&gl=IN&ceid=IN:en',
    name: 'Google News - Startup Funding',
    category: 'Startup'
  },
  {
    url: 'https://news.google.com/rss/search?q=IPO+india&hl=en-IN&gl=IN&ceid=IN:en',
    name: 'Google News - IPO India',
    category: 'IPO'
  },
  
  // ===== E. GOVERNMENT & REGULATORY =====
  {
    url: 'https://www.sebi.gov.in/rss',
    name: 'SEBI Press Releases',
    category: 'Regulatory'
  }
];

// Keywords to filter relevant news
const RELEVANT_KEYWORDS = [
  'unlisted', 'pre-ipo', 'ipo', 'shares', 'stock', 'equity',
  'startup', 'funding', 'valuation', 'investment', 'investor',
  'nse', 'bse', 'sebi', 'market', 'trading', 'demat',
  'reliance', 'tata', 'hdfc', 'icici', 'bajaj', 'adani',
  'fintech', 'pharma', 'it sector', 'banking', 'insurance'
];

// ===============================================
// AI FUNCTIONS - Hindi Summarization & Image Gen
// ===============================================

// Generate Hindi summary using GPT-4 (Natural conversational Hindi)
const generateHindiSummary = async (title, englishSummary) => {
  if (!isOpenAIConfigured) return { titleHindi: '', summaryHindi: '' };
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective for summarization
      messages: [
        {
          role: 'system',
          content: `Tum ek financial news writer ho jo Hindi mein likhte ho. Tumhara kaam hai news ko aam bolchal wali Hindi mein likhna - jaise koi friend ko bata rahe ho. 

IMPORTANT RULES:
1. Natural Hindi use karo - जैसे लोग रोज़मर्रा में बोलते हैं
2. Google Translate jaisi Hindi NAHI chahiye - wo bahut awkward lagti hai
3. English words jo commonly use hote hain (like IPO, shares, market, company, funding) waise hi rakho
4. Short aur crisp rakho - max 60-70 words
5. Interesting aur engaging tone rakho

Example of GOOD Hindi:
"Reliance की unlisted subsidiary का valuation अब ₹50,000 करोड़ पहुंच गया है। Company जल्द ही IPO लाने की तैयारी में है। Experts का कहना है कि ये एक बड़ा मौका हो सकता है investors के लिए।"

Example of BAD Hindi (Don't do this):
"रिलायंस की असूचीबद्ध सहायक कंपनी का मूल्यांकन अब ₹50,000 करोड़ तक पहुंच गया है।" (Too formal/translated)`
        },
        {
          role: 'user',
          content: `Title: ${title}\n\nSummary: ${englishSummary}\n\nIs news ko Hindi mein likho. Pehle title ka Hindi version do, phir summary. Format:\nTITLE_HINDI: [hindi title]\nSUMMARY_HINDI: [hindi summary]`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const output = response.choices[0].message.content;
    
    // Parse the response
    const titleMatch = output.match(/TITLE_HINDI:\s*(.+?)(?:\n|SUMMARY_HINDI)/s);
    const summaryMatch = output.match(/SUMMARY_HINDI:\s*(.+)/s);
    
    return {
      titleHindi: titleMatch ? titleMatch[1].trim() : '',
      summaryHindi: summaryMatch ? summaryMatch[1].trim() : ''
    };
  } catch (error) {
    console.log(`  ⚠️ Hindi summary failed: ${error.message}`);
    return { titleHindi: '', summaryHindi: '' };
  }
};

// Generate AI image using DALL-E 3
const generateAIImage = async (title, category) => {
  if (!isOpenAIConfigured) return '';
  
  try {
    // Create a prompt based on the news title and category
    const categoryThemes = {
      'IPO': 'stock market trading floor, IPO bell ringing, celebration',
      'Market': 'stock charts, trading graphs, financial data visualization',
      'Startup': 'modern office, entrepreneurs, innovation, technology',
      'Unlisted': 'private equity, exclusive investment, premium stocks',
      'Regulatory': 'government building, official documents, policy',
      'Company': 'corporate office, business meeting, company growth',
      'Analysis': 'data analysis, charts, financial research',
      'General': 'Indian stock market, investment, finance'
    };
    
    const theme = categoryThemes[category] || categoryThemes['General'];
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Professional, clean, modern financial news thumbnail image. Theme: ${theme}. Style: Minimal, corporate, blue and green color scheme, no text or words in image. High quality, suitable for news article. Context: ${title.substring(0, 100)}`,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    });

    return response.data[0].url;
  } catch (error) {
    console.log(`  ⚠️ Image generation failed: ${error.message}`);
    return '';
  }
};

// ===============================================
// ORIGINAL FUNCTIONS
// ===============================================

// Auto-detect category based on content
const detectCategory = (title, summary) => {
  const text = `${title} ${summary}`.toLowerCase();
  
  if (text.includes('ipo') || text.includes('pre-ipo') || text.includes('listing')) {
    return 'IPO';
  }
  if (text.includes('unlisted') || text.includes('pre ipo')) {
    return 'Unlisted';
  }
  if (text.includes('startup') || text.includes('funding') || text.includes('venture') || text.includes('series a') || text.includes('series b')) {
    return 'Startup';
  }
  if (text.includes('sebi') || text.includes('rbi') || text.includes('regulation') || text.includes('compliance') || text.includes('ministry')) {
    return 'Regulatory';
  }
  if (text.includes('analysis') || text.includes('outlook') || text.includes('forecast')) {
    return 'Analysis';
  }
  if (text.includes('company') || text.includes('announces') || text.includes('reports')) {
    return 'Company';
  }
  if (text.includes('market') || text.includes('sensex') || text.includes('nifty')) {
    return 'Market';
  }
  
  return 'General';
};

// Summarize content to 60 words max (Inshorts style - crisp & concise)
const summarizeContent = (content, maxWords = 60) => {
  if (!content) return '';
  
  // Remove HTML tags
  let text = content.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace, URLs, and special chars
  text = text.replace(/https?:\/\/[^\s]+/g, ''); // Remove URLs
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/\[\+\d+ chars\]/g, ''); // Remove [+123 chars] markers
  
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
      // If we have less than 30 words, add partial sentence
      const remaining = maxWords - wordCount;
      summary += words.slice(0, remaining).join(' ') + '...';
      break;
    } else {
      break;
    }
  }
  
  // Clean up and ensure proper ending
  summary = summary.trim();
  if (summary && !summary.endsWith('.') && !summary.endsWith('...')) {
    summary += '.';
  }
  
  return summary || text.split(/\s+/).slice(0, maxWords).join(' ') + '...';
};

// Extract thumbnail from RSS item
const extractThumbnail = (item) => {
  // Try various thumbnail sources
  if (item['media:content'] && item['media:content']['$']) {
    return item['media:content']['$'].url;
  }
  if (item['media:thumbnail'] && item['media:thumbnail']['$']) {
    return item['media:thumbnail']['$'].url;
  }
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  // Try to extract from content
  const imgMatch = (item.content || item['content:encoded'] || '').match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) {
    return imgMatch[1];
  }
  
  // Default placeholder based on category
  return '';
};

// Check if news is relevant
const isRelevantNews = (title, content) => {
  const text = `${title} ${content}`.toLowerCase();
  return RELEVANT_KEYWORDS.some(keyword => text.includes(keyword));
};

// Extract tags from content
const extractTags = (title, content) => {
  const text = `${title} ${content}`.toLowerCase();
  const tags = [];
  
  const tagKeywords = [
    'ipo', 'pre-ipo', 'unlisted', 'stocks', 'market',
    'investment', 'trading', 'nse', 'bse', 'sebi',
    'startup', 'funding', 'fintech', 'banking'
  ];
  
  tagKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      tags.push(keyword.toUpperCase());
    }
  });
  
  return tags.slice(0, 5); // Max 5 tags
};

// Fetch and process RSS feed
const fetchRSSFeed = async (feed) => {
  try {
    console.log(`📡 Fetching: ${feed.name}...`);
    
    const result = await parser.parseURL(feed.url);
    const newsItems = [];
    
    for (const item of result.items.slice(0, 10)) { // Max 10 per feed
      try {
        // Check if already exists
        const exists = await News.findOne({ sourceUrl: item.link });
        if (exists) continue;
        
        // Check relevance
        const content = item.contentSnippet || item.content || item.summary || '';
        if (!isRelevantNews(item.title, content)) continue;
        
        // Create summary
        const summary = summarizeContent(content);
        if (!summary || summary.length < 50) continue;
        
        // Detect category
        const category = detectCategory(item.title, summary) || feed.category;
        
        // Extract thumbnail
        let thumbnail = extractThumbnail(item);
        let isAiGeneratedImage = false;
        
        // Generate AI image if no thumbnail (limit to save costs)
        if (!thumbnail && isOpenAIConfigured) {
          console.log(`  🎨 Generating AI image for: ${item.title.substring(0, 40)}...`);
          thumbnail = await generateAIImage(item.title, category);
          if (thumbnail) {
            isAiGeneratedImage = true;
          }
        }
        
        // Generate Hindi summary
        let titleHindi = '';
        let summaryHindi = '';
        if (isOpenAIConfigured) {
          console.log(`  🇮🇳 Generating Hindi summary...`);
          const hindiContent = await generateHindiSummary(item.title, summary);
          titleHindi = hindiContent.titleHindi;
          summaryHindi = hindiContent.summaryHindi;
        }
        
        // Extract tags
        const tags = extractTags(item.title, content);
        
        const newsItem = {
          title: item.title,
          titleHindi,
          summary,
          summaryHindi,
          content: content.substring(0, 2000), // Limit content
          category,
          thumbnail,
          isAiGeneratedImage,
          sourceUrl: item.link,
          sourceName: feed.name,
          author: item.creator || item.author || feed.name,
          tags,
          isPublished: true,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
        };
        
        newsItems.push(newsItem);
      } catch (itemError) {
        console.log(`  ⚠️ Skipping item: ${itemError.message}`);
      }
    }
    
    return newsItems;
  } catch (error) {
    console.error(`❌ Failed to fetch ${feed.name}:`, error.message);
    return [];
  }
};

// Main function
const fetchAllNews = async () => {
  console.log('\n🚀 Starting Auto News Fetch (Mobile Backend)...');
  console.log(`📅 ${new Date().toISOString()}\n`);
  
  await connectDB();
  
  let totalFetched = 0;
  let totalSaved = 0;
  
  for (const feed of RSS_FEEDS) {
    const newsItems = await fetchRSSFeed(feed);
    totalFetched += newsItems.length;
    
    // Save to database
    for (const item of newsItems) {
      try {
        await News.create(item);
        totalSaved++;
        console.log(`  ✅ Saved: ${item.title.substring(0, 50)}...`);
      } catch (saveError) {
        if (saveError.code === 11000) {
          console.log(`  ⏭️ Duplicate: ${item.title.substring(0, 40)}...`);
        } else {
          console.error(`  ❌ Save error: ${saveError.message}`);
        }
      }
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Fetched: ${totalFetched} articles`);
  console.log(`   Saved: ${totalSaved} new articles`);
  console.log(`   Duplicates skipped: ${totalFetched - totalSaved}`);
  console.log('\n✅ Auto News Fetch Complete!\n');
  
  // Close connection
  await mongoose.connection.close();
  process.exit(0);
};

// Run
fetchAllNews().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
