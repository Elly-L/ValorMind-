"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sun, Moon, Heart, BrainCircuit, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Step = "welcome" | "name" | "emotion" | "theme" | "persona" | "complete"

const emotions = [
  { emoji: "😊", name: "Happy" },
  { emoji: "😔", name: "Sad" },
  { emoji: "😡", name: "Angry" },
  { emoji: "😰", name: "Anxious" },
  { emoji: "😴", name: "Tired" },
  { emoji: "🤗", name: "Excited" },
  { emoji: "😕", name: "Confused" },
  { emoji: "😌", name: "Calm" },
]

interface OnboardingModalProps {
  onComplete: (data: {
    name: string
    mood: string
    theme: "light" | "dark"
    persona: "friend" | "therapist"
  }) => void
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>("welcome")
  const [userName, setUserName] = useState("")
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<"friend" | "therapist" | null>(null)
  const [isFadingOut, setIsFadingOut] = useState(false)

  const progressValues: Record<Step, number> = {
    welcome: 0,
    name: 16,
    emotion: 33,
    theme: 50,
    persona: 75,
    complete: 100,
  }

  const handleNextStep = (nextStep: Step) => {
    setIsFadingOut(true)
    setTimeout(() => {
      setStep(nextStep)
      setIsFadingOut(false)
    }, 300)
  }

  const handleSelectTheme = (theme: "light" | "dark") => {
    setSelectedTheme(theme)
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  useEffect(() => {
    if (step === "complete") {
      setTimeout(() => {
        if (userName && selectedEmotion && selectedTheme && selectedPersona) {
          onComplete({
            name: userName,
            mood: selectedEmotion,
            theme: selectedTheme,
            persona: selectedPersona,
          })
        }
      }, 1500)
    }
  }, [step, onComplete, userName, selectedEmotion, selectedTheme, selectedPersona])

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 w-48 h-48 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold text-gray-800 dark:text-white leading-tight mb-2">
                ValorMind AI
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-200 mb-4">Welcome to your safe space.</p>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
              A place to understand your feelings and find your calm.
            </p>
            <Button
              size="lg"
              onClick={() => handleNextStep("name")}
              className="min-w-48 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Let's Begin
            </Button>
          </div>
        )

      case "name":
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                What should I call you?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">This helps me personalize your experience.</p>
            </div>

            <div className="w-full max-w-sm space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                  Your name or nickname
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-center text-lg"
                  autoFocus
                />
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => handleNextStep("emotion")}
              disabled={!userName.trim()}
              className="min-w-48 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </Button>
          </div>
        )

      case "emotion":
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                How are you feeling right now?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">Tap an emoji to check in.</p>
            </div>

            <div className="relative w-80 h-80 flex items-center justify-center">
              {selectedEmotion && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-2xl transform scale-110 transition-all duration-500">
                    <span className="text-3xl">{emotions.find((e) => e.name === selectedEmotion)?.emoji}</span>
                    <span className="text-xs font-medium mt-1">{selectedEmotion}</span>
                  </div>
                </div>
              )}

              {emotions.map((emotion, index) => {
                const angle = (index / emotions.length) * 360
                const isSelected = selectedEmotion === emotion.name
                return (
                  <button
                    key={emotion.name}
                    className={`absolute w-20 h-20 rounded-full bg-white dark:bg-gray-800 border-2 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center ${
                      isSelected
                        ? "border-pink-500 opacity-50 scale-75"
                        : "border-gray-200 dark:border-gray-600 hover:border-pink-300 hover:scale-105"
                    }`}
                    style={{
                      transform: `rotate(${angle}deg) translate(140px) rotate(-${angle}deg) ${
                        isSelected ? "scale(0.75)" : ""
                      }`,
                      opacity: isSelected ? 0.5 : 1,
                    }}
                    onClick={() => setSelectedEmotion(emotion.name)}
                    aria-label={emotion.name}
                  >
                    <span className="text-2xl">{emotion.emoji}</span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">{emotion.name}</span>
                  </button>
                )
              })}
            </div>

            <Button
              size="lg"
              onClick={() => handleNextStep("theme")}
              disabled={!selectedEmotion}
              className="min-w-48 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </Button>
          </div>
        )

      case "theme":
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">Choose your vibe.</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">You can always change this later in settings.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
              <button
                className={`relative w-full md:w-64 p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  selectedTheme === "light"
                    ? "border-pink-500 shadow-lg shadow-pink-200"
                    : "border-gray-200 dark:border-gray-600 hover:border-pink-300"
                }`}
                onClick={() => handleSelectTheme("light")}
              >
                <div className="bg-gradient-to-br from-slate-100 via-pink-50 to-purple-100 rounded-xl h-32 flex items-center justify-center mb-4">
                  <Sun className="w-12 h-12 text-pink-600" />
                </div>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">Clean & Bright</p>
                {selectedTheme === "light" && (
                  <Check className="absolute top-3 right-3 w-6 h-6 text-pink-600 bg-pink-100 rounded-full p-1" />
                )}
              </button>

              <button
                className={`relative w-full md:w-64 p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  selectedTheme === "dark"
                    ? "border-pink-500 shadow-lg shadow-pink-200"
                    : "border-gray-200 dark:border-gray-600 hover:border-pink-300"
                }`}
                onClick={() => handleSelectTheme("dark")}
              >
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl h-32 flex items-center justify-center mb-4">
                  <Moon className="w-12 h-12 text-purple-400" />
                </div>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">Moody & Minimal</p>
                {selectedTheme === "dark" && (
                  <Check className="absolute top-3 right-3 w-6 h-6 text-pink-600 bg-pink-100 rounded-full p-1" />
                )}
              </button>
            </div>

            <Button
              size="lg"
              onClick={() => handleNextStep("persona")}
              disabled={!selectedTheme}
              className="min-w-48 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>
        )

      case "persona":
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                How should I talk to you?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">Choose the type of support you're looking for.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
              <button
                className={`relative w-full md:w-72 p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl text-center ${
                  selectedPersona === "friend"
                    ? "border-pink-500 shadow-lg shadow-pink-200"
                    : "border-gray-200 dark:border-gray-600 hover:border-pink-300"
                }`}
                onClick={() => setSelectedPersona("friend")}
              >
                <Heart className="w-8 h-8 text-pink-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">As a Friend</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Casual, supportive, and here to listen.
                </p>
                {selectedPersona === "friend" && (
                  <Check className="absolute top-3 right-3 w-6 h-6 text-pink-600 bg-pink-100 rounded-full p-1" />
                )}
              </button>

              <button
                className={`relative w-full md:w-72 p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl text-center ${
                  selectedPersona === "therapist"
                    ? "border-pink-500 shadow-lg shadow-pink-200"
                    : "border-gray-200 dark:border-gray-600 hover:border-pink-300"
                }`}
                onClick={() => setSelectedPersona("therapist")}
              >
                <BrainCircuit className="w-8 h-8 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">As a Therapist</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Guided, professional, and focused on your growth.
                </p>
                {selectedPersona === "therapist" && (
                  <Check className="absolute top-3 right-3 w-6 h-6 text-pink-600 bg-pink-100 rounded-full p-1" />
                )}
              </button>
            </div>

            <Button
              size="lg"
              onClick={() => handleNextStep("complete")}
              disabled={!selectedPersona}
              className="min-w-48 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Finish Setup
            </Button>
          </div>
        )

      case "complete":
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center animate-bounce">
              <Check className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Welcome, {userName}!</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Setting up your personalized experience...</p>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 z-50 overflow-hidden">
      <div className="fixed top-0 left-0 w-full p-4 z-10">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-pink-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressValues[step]}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen p-6 pt-16">
        <div
          className={`w-full max-w-4xl transition-all duration-300 ${
            isFadingOut ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"
          }`}
        >
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal
