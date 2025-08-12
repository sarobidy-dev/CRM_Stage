// services/voice.service.ts

interface VoiceConfig {
  enabled: boolean
  lang: string
  rate: number
  pitch: number
  volume: number
  useOpenAI: boolean
}

class VoiceService {
  private config: VoiceConfig
  private synthesis: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null

  constructor() {
    this.config = {
      enabled: process.env.NEXT_PUBLIC_VOICE_ENABLED === "true",
      lang: process.env.NEXT_PUBLIC_VOICE_LANG || "fr-FR",
      rate: Number.parseFloat(process.env.NEXT_PUBLIC_VOICE_RATE || "1.0"),
      pitch: Number.parseFloat(process.env.NEXT_PUBLIC_VOICE_PITCH || "1.0"),
      volume: Number.parseFloat(process.env.NEXT_PUBLIC_VOICE_VOLUME || "0.8"),
      useOpenAI: process.env.NEXT_PUBLIC_USE_OPENAI_TTS === "true",
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis
    }
  }

  // Méthode principale pour lire du texte
  async speak(text: string, options?: Partial<VoiceConfig>): Promise<void> {
    if (!this.config.enabled) {
      console.log("Voice service disabled")
      return
    }

    const finalConfig = { ...this.config, ...options }

    if (finalConfig.useOpenAI) {
      await this.speakWithOpenAI(text, finalConfig)
    } else {
      await this.speakWithWebAPI(text, finalConfig)
    }
  }

  // Utiliser l'API Web Speech Synthesis native
  private async speakWithWebAPI(text: string, config: VoiceConfig): Promise<void> {
    if (!this.synthesis) {
      console.error("Speech synthesis not supported")
      return
    }

    // Arrêter toute lecture en cours
    this.stop()

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)

      // Configuration de la voix
      utterance.lang = config.lang
      utterance.rate = config.rate
      utterance.pitch = config.pitch
      utterance.volume = config.volume

      // Essayer de trouver une voix française
      const voices = this.synthesis!.getVoices()
      const frenchVoice = voices.find(
        (voice) => voice.lang.startsWith("fr") || voice.name.toLowerCase().includes("french"),
      )

      if (frenchVoice) {
        utterance.voice = frenchVoice
      }

      // Événements
      utterance.onend = () => {
        this.currentUtterance = null
        resolve()
      }

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error)
        this.currentUtterance = null
        reject(new Error(event.error))
      }

      utterance.onstart = () => {
        console.log("Started speaking:", text)
      }

      this.currentUtterance = utterance
      this.synthesis!.speak(utterance)
    })
  }

  // Utiliser l'API OpenAI Text-to-Speech (optionnel)
  private async speakWithOpenAI(text: string, config: VoiceConfig): Promise<void> {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY

    if (!apiKey) {
      console.warn("OpenAI API key not found, falling back to Web Speech API")
      return this.speakWithWebAPI(text, config)
    }

    try {
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: "shimmer", // ou 'echo', 'fable', 'onyx', 'nova', 'shimmer'
          response_format: "mp3",
          speed: config.rate,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI TTS API error: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl)
        audio.volume = config.volume

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          resolve()
        }

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          reject(new Error("Audio playback failed"))
        }

        audio.play().catch(reject)
      })
    } catch (error) {
      console.error("OpenAI TTS failed, falling back to Web Speech API:", error)
      return this.speakWithWebAPI(text, config)
    }
  }

  // Arrêter la lecture en cours
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
    }
    this.currentUtterance = null
  }

  // Vérifier si une lecture est en cours
  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false
  }

  // Mettre en pause/reprendre
  pause(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause()
    }
  }

  resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume()
    }
  }

  // Générer le texte de notification pour les tâches
  generateTaskNotificationText(
    reminders: Array<{ titre: string; contact_name?: string; date_echeance?: string, description?: string }>,
  ): string {
    if (reminders.length === 0) return ""

    if (reminders.length === 1) {
      const reminder = reminders[0]
      return `Attention ! Vous avez une tâche en retard: ${reminder.titre}${reminder.contact_name ? ` pour le contact ${reminder.contact_name} et la description: ${reminder.description}` : ""}.`
    }

    return `Attention ! Vous avez ${reminders.length} tâches en retard. Veuillez vérifier votre liste de tâches.`
  }

  // Tester la synthèse vocale
  async test(): Promise<void> {
    await this.speak("Test de la synthèse vocale. Le système de notification fonctionne correctement.")
  }
}

// Instance singleton
export const voiceService = new VoiceService()
export default voiceService
