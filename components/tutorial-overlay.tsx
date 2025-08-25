"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Palette, ImageIcon, MessageCircle } from "lucide-react"

interface TutorialStep {
  id: string
  title: string
  description: string
  targetElement?: string
  position: "top" | "bottom" | "left" | "right" | "center"
  icon: React.ReactNode
  action?: () => void
}

interface TutorialOverlayProps {
  isVisible: boolean
  onClose: () => void
  onComplete: () => void
}

export default function TutorialOverlay({ isVisible, onClose, onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const tutorialSteps: TutorialStep[] = [
    {
      id: "welcome",
      title: "Welcome to ValorMind AI",
      description:
        "Let's take a quick tour to help you personalize your chat experience. This will only take a minute.",
      position: "center",
      icon: <Palette className="h-6 w-6" />,
    },
    {
      id: "theme-button",
      title: "Access Theme Settings",
      description: "Click the palette icon in the top-right corner to open theme customization options.",
      targetElement: "[data-tutorial='theme-button']",
      position: "bottom",
      icon: <Palette className="h-6 w-6" />,
      action: () => {
        const themeButton = document.querySelector("[data-tutorial='theme-button']") as HTMLElement
        if (themeButton) {
          themeButton.click()
        }
      },
    },
    {
      id: "background-themes",
      title: "Choose Background Themes",
      description: "Select from solid colors or gradients to set the mood for your conversations.",
      targetElement: "[data-tutorial='background-themes']",
      position: "left",
      icon: <Palette className="h-6 w-6" />,
    },
    {
      id: "background-images",
      title: "Set Background Images",
      description: "Browse beautiful images to create a more immersive chat environment.",
      targetElement: "[data-tutorial='background-images']",
      position: "left",
      icon: <ImageIcon className="h-6 w-6" />,
    },
    {
      id: "message-bubbles",
      title: "Customize Message Bubbles",
      description: "Change the color and style of your chat bubbles to match your personality.",
      targetElement: "[data-tutorial='message-bubbles']",
      position: "left",
      icon: <MessageCircle className="h-6 w-6" />,
    },
    {
      id: "complete",
      title: "You're All Set",
      description:
        "You can access these customization options anytime during your chat. Enjoy your personalized ValorMind AI experience.",
      position: "center",
      icon: <MessageCircle className="h-6 w-6" />,
    },
  ]

  useEffect(() => {
    const currentStepData = tutorialSteps[currentStep]
    if (currentStepData.action && isVisible) {
      const timer = setTimeout(() => {
        currentStepData.action?.()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentStep, isVisible])

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      }, 200)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsAnimating(false)
      }, 200)
    }
  }

  const skipTutorial = () => {
    onClose()
  }

  if (!isVisible) return null

  const currentStepData = tutorialSteps[currentStep]

  return (
    <>
      {currentStepData.targetElement && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <style jsx>{`
            ${currentStepData.targetElement} {
              position: relative !important;
              z-index: 45 !important;
              pointer-events: auto !important;
              box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.5) !important;
              border-radius: 8px !important;
            }
          `}</style>
        </div>
      )}

      <div
        className={`fixed z-50 transition-all duration-300 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"} ${
          currentStepData.position === "center"
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            : currentStepData.position === "top"
              ? "top-4 left-1/2 -translate-x-1/2"
              : currentStepData.position === "bottom"
                ? "bottom-20 left-1/2 -translate-x-1/2"
                : currentStepData.position === "left"
                  ? "top-1/2 left-4 -translate-y-1/2"
                  : "top-1/2 right-4 -translate-y-1/2"
        }`}
      >
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl p-6 max-w-sm mx-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent rounded-lg text-accent-foreground">{currentStepData.icon}</div>
              <h3 className="font-semibold text-card-foreground">{currentStepData.title}</h3>
            </div>
            <Button
              onClick={skipTutorial}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <p className="text-muted-foreground mb-6 leading-relaxed">{currentStepData.description}</p>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? "bg-accent w-8" : index < currentStep ? "bg-accent/60 w-2" : "bg-muted w-2"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {tutorialSteps.length}
            </span>

            <Button
              onClick={nextStep}
              size="sm"
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
              {currentStep !== tutorialSteps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
