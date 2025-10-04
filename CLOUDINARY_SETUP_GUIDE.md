# 🌟 Cloudinary Setup Guide

## Step 1: Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

## Step 2: Get Your Cloudinary Keys
1. Go to your Cloudinary Dashboard
2. Click on "Settings" (gear icon)
3. Go to "API Keys" section
4. Copy these values:
   - **Cloud Name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

## Step 3: Create Upload Preset
1. In your Cloudinary Dashboard, go to "Settings"
2. Click on "Upload" tab
3. Scroll down to "Upload presets"
4. Click "Add upload preset"
5. **Name it**: `loveworld_singers` (this is important!)
6. **Signing Mode**: Choose "Unsigned" (for browser uploads)
7. **Folder**: `loveworld-singers` (optional)
8. Click "Save"

## Step 4: Update Your .env.local File
Add these lines to your `.env.local` file:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=loveworld_singers
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## Step 5: Test the Setup
1. Restart your development server
2. Go to `http://localhost:3000/migration`
3. Click "🔗 Test Firebase Connection"
4. If it works, you're all set!

## Upload Preset Name
**Use exactly**: `loveworld_singers`

This is the name I've configured in the code, so make sure your upload preset has this exact name.

## Why This Setup?
- **Unsigned uploads**: Allows browser uploads without server-side code
- **Folder organization**: Keeps your media organized
- **Security**: API keys are hidden in environment variables
- **Performance**: Cloudinary optimizes images automatically

## Troubleshooting
- **Upload fails**: Check that your upload preset name is exactly `loveworld_singers`
- **API errors**: Verify your API keys are correct
- **CORS errors**: Make sure your upload preset allows unsigned uploads

## Free Tier Limits
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **Perfect for starting out!**

Once you have this set up, your app will be able to upload images and audio files directly to Cloudinary! 🎉



