# Voice Chat Setup Guide

## Overview
Your PAS-Assistant now supports voice chat using online APIs, keeping the project lightweight and GitHub-friendly.

## Configuration

### 1. Set Up OpenAI API Key
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a `.env.local` file in the frontend directory:
   ```bash
   # In PAS-Assistant-FrontEnd/
   cp .env.example .env.local
   ```
3. Edit `.env.local` and add your API key:
   ```
   VITE_OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

### 2. Voice Features
- **Speech-to-Text**: Uses OpenAI Whisper API ($0.006/minute)
- **Text-to-Speech**: Uses OpenAI TTS API ($15/1M characters)
- **Fallback**: Automatically falls back to browser TTS and backend STT if API fails

### 3. Usage
- Green microphone button: Online voice recognition (when API key is configured)
- Gray microphone button: Backend voice recognition (fallback)
- Settings button: Toggle between online/browser voice modes
- Volume button: Mute/unmute voice responses

## Benefits
✅ **Lightweight**: No large model files in project  
✅ **GitHub-friendly**: Small repository size  
✅ **Fast response**: Direct API calls  
✅ **Reliable**: Automatic fallback mechanisms  
✅ **Cost-effective**: Pay-per-use pricing  

## API Costs (Optional)
- Whisper STT: ~$0.006 per minute of audio
- TTS: ~$15 per 1M characters (~$0.015 per 1000 characters)

## Troubleshooting
- If voice doesn't work, check browser microphone permissions
- Ensure API key is correctly set in `.env.local`
- Voice will fall back to browser/backend if API fails
