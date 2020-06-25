import { WebPlugin } from "@capacitor/core";
import {
  TextToSpeechPlugin,
  TTSOptions,
  SpeechSynthesisVoice,
} from "./definitions";

export class TextToSpeechWeb extends WebPlugin implements TextToSpeechPlugin {
  private speechSynthesizer: any;
  private activeUtterance: any;
  private notSupportedMessage =
    "Speech Synthesizer is not yet initialized or supported.";
  constructor() {
    super({
      name: "TextToSpeech",
      platforms: ["web"],
    });

    if (!this.speechSynthesizer && window && window.speechSynthesis) {
      this.speechSynthesizer = window.speechSynthesis;
    }
  }
  speak(options: TTSOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesizer) {
        reject(this.notSupportedMessage);
        return;
      }

      if (!options) {
        reject("No options were provided.");
        return;
      }

      if (!options.text) {
        reject("Text option was not provided");
        return;
      }

      const { text, locale, rate, volume, voice, pitch } = options;

      if (!this.activeUtterance) {
        this.activeUtterance = new SpeechSynthesisUtterance();
        this.activeUtterance.rate = rate >= 0.1 && rate <= 10 ? rate : 1;
        this.activeUtterance.volume = volume >= 0 && volume <= 1 ? volume : 1;
        this.activeUtterance.text = text;
        this.activeUtterance.lang = locale;
        this.activeUtterance.pitch = pitch >= 0 && pitch <= 2 ? pitch : 2;
        if (voice) {
          this.activeUtterance.voice = voice;
        }
        this.activeUtterance.onend = (ev: any) => {
          resolve(ev);
          this.activeUtterance = undefined;
        };
        this.activeUtterance.onerror = (ev: any) => {
          reject(ev);
          this.activeUtterance = undefined;
        };

        this.speechSynthesizer.speak(this.activeUtterance);
      }
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesizer) {
        reject(this.notSupportedMessage);
        return;
      }

      this.speechSynthesizer.cancel();
      resolve();
    });
  }

  getSupportedLanguages(): Promise<string | SpeechSynthesisVoice[]> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesizer) {
        reject(this.notSupportedMessage);
        return;
      }

      resolve(this.speechSynthesizer.getVoices() as SpeechSynthesisVoice[]);
    });
  }

  openInstall(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  setPitchRate(_options: { pitchRate: number }): Promise<void> {
    // Pitch rate cannot be set while engine is active
    throw new Error("Method not implemented.");
  }

  setSpeechRate(_options: { speechRate: number }): Promise<void> {
    // Speech rate cannot be set while engine is active
    throw new Error("Method not implemented.");
  }
}

const TextToSpeech = new TextToSpeechWeb();

export { TextToSpeech };

import { registerWebPlugin } from "@capacitor/core";
registerWebPlugin(TextToSpeech);
