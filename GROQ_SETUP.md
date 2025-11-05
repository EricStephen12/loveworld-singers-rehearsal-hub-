# 🤖 Groq AI Setup for Audio Lab Studio

## Why Groq AI?
- **Lightning Fast**: Fastest AI inference in the world
- **Affordable**: Very cheap API costs (much cheaper than OpenAI)
- **Real Conversations**: Chat naturally like with ChatGPT
- **Audio Focused**: Trained to understand audio production
- **Privacy Friendly**: Only sends text, not your audio files

## Quick Setup (2 minutes)

### Step 1: Get Free Groq API Key
1. Go to: https://console.groq.com/
2. Sign up for free account
3. Go to "API Keys" section
4. Create new API key
5. Copy the key (starts with `gsk_...`)

### Step 2: Add to Your Project
Add this to your `.env.local` file:
```bash
NEXT_PUBLIC_GROQ_API_KEY=gsk_your_api_key_here
```

### Step 3: Restart Your App
```bash
npm run dev
```

### Step 4: Test in Audio Lab
1. Open Audio Lab Studio
2. Click "AI Assistant" 
3. Look for "🤖 Groq AI Ready - Chat naturally!"
4. Try: "Hey, can you help me make my vocals sound more professional?"

## Example Conversations

### Natural Chat Style
**You:** "Hey, I'm working on a worship song and the vocals sound a bit harsh"
**AI:** "I'd love to help with that! Harsh vocals usually need some gentle EQ work. Let me soften those high frequencies for you and maybe add a touch of warmth."

**You:** "The drums are getting lost in the mix"
**AI:** "Ah, classic mixing challenge! Let me boost the drums and add some punch so they cut through better. I'll also check if anything else is competing in that frequency range."

**You:** "Make this sound more like a professional church recording"
**AI:** "Great idea! For that professional church sound, I'll add some tasteful reverb to create that spacious, holy atmosphere, and balance the mix for clarity and warmth."

### Technical Requests
**You:** "Can you high-pass filter the vocals at 80Hz and add a gentle compressor?"
**AI:** "Absolutely! I'll clean up those low frequencies and add smooth compression to even out the dynamics. That'll give you a much more polished vocal sound."

## Free Tier Limits
- **$5 Free Credits** when you sign up
- **Very Cheap**: ~$0.10 per 1000 requests
- **Fast**: Responses in under 1 second
- **No Monthly Fees**: Pay only for what you use

## Privacy & Security
- ✅ Only text commands are sent to Groq
- ✅ Your audio files never leave your computer
- ✅ No recording or storing of conversations
- ✅ API key stays in your environment variables

## Troubleshooting

### Still showing "Rule-based mode"?
1. Check your `.env.local` file has the API key
2. Restart your development server
3. Make sure the key starts with `gsk_`

### API errors?
1. Check if you have credits left in Groq console
2. Verify the API key is correct
3. Check your internet connection

### Slow responses?
- Groq is usually under 1 second
- Check your internet speed
- Try refreshing the page

## Cost Comparison

| Service | Cost per 1000 requests | Speed |
|---------|----------------------|-------|
| **Groq** | ~$0.10 | ⚡ 0.5s |
| OpenAI GPT-4 | ~$3.00 | 🐌 3-5s |
| Claude | ~$1.50 | 🐌 2-4s |

## Benefits for LoveWorld Singers
- **Natural Conversations**: Talk to AI like a real audio engineer
- **Learning Tool**: AI explains what it's doing and why
- **Consistent Quality**: Professional results every time
- **24/7 Available**: Your personal mixing engineer anytime
- **Cost Effective**: Extremely affordable for churches

**Ready to have real conversations with your AI mixing engineer! 🎵🤖**