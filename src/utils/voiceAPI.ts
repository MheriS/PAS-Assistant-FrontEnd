// Voice API utilities using online services
// This keeps the project lightweight by using cloud APIs instead of local models

interface VoiceConfig {
  openAIApiKey?: string;
  openAIBaseURL?: string;
}

class VoiceAPI {
  private config: VoiceConfig;

  constructor() {
    this.config = {
      openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
      openAIBaseURL: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1'
    };
  }

  /**
   * Convert speech to text using OpenAI Whisper API
   */
  async speechToText(audioBlob: Blob): Promise<string> {
    if (!this.config.openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'id'); // Indonesian

    try {
      const response = await fetch(`${this.config.openAIBaseURL}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openAIApiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `Speech-to-text failed: ${response.status}`);
      }

      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error('Speech-to-text error:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech using OpenAI TTS API
   */
  async textToSpeech(text: string): Promise<Blob> {
    if (!this.config.openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(`${this.config.openAIBaseURL}/audio/speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: 'alloy',
          response_format: 'mp3'
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `Text-to-speech failed: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw error;
    }
  }

  /**
   * Play audio blob in browser
   */
  playAudioBlob(audioBlob: Blob): void {
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play().catch(error => {
      console.error('Audio playback failed:', error);
    });
  }

  /**
   * Fallback to browser's built-in speech synthesis
   */
  fallbackTextToSpeech(text: string): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1;
      utterance.pitch = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Check if voice APIs are configured
   */
  isConfigured(): boolean {
    return !!this.config.openAIApiKey;
  }
}

export const voiceAPI = new VoiceAPI();
export type { VoiceConfig };
