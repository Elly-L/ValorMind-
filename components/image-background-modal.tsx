"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ImageBackgroundModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectImage: (imagePath: string) => void
  currentImage?: string
}

export default function ImageBackgroundModal({
  isOpen,
  onClose,
  onSelectImage,
  currentImage,
}: ImageBackgroundModalProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const mobileBackgroundImages = [
    { path: "/images/tulip-field-mobile.png", name: "Tulip Field", category: "Nature" },
    { path: "/images/motivational-cartoon-mobile.png", name: "Motivational Quote", category: "Playful" },
    { path: "/images/sunset-landscape-mobile.png", name: "Sunset Path", category: "Nature" },
    { path: "/images/water-splash-mobile.png", name: "Water Splash", category: "Nature" },
    { path: "/images/homer-eyes-mobile.png", name: "Simple Eyes", category: "Playful" },
    { path: "/images/heart-cloud-mobile.png", name: "Heart Cloud", category: "Nature" },
    { path: "/images/finger-heart-mobile.png", name: "Finger Heart", category: "Playful" },
    { path: "/images/zen-bamboo-vertical.png", name: "Zen Bamboo", category: "Therapeutic" },
    { path: "/images/cute-bear-mobile.png", name: "Cute Bear", category: "Playful" },
  ]

  const desktopBackgroundImages = [
    { path: "/images/mountain-sunset.webp", name: "Mountain Sunset", category: "Nature" },
    { path: "/images/water-droplet.png", name: "Water Droplet", category: "Nature" },
    { path: "/images/lake-sunset.png", name: "Lake Sunset", category: "Nature" },
    { path: "/images/ocean-blue.png", name: "Ocean Blue", category: "Nature" },
    { path: "/images/misty-lake.png", name: "Misty Lake", category: "Nature" },
    { path: "/images/zen-bamboo-stones.png", name: "Bamboo Stones", category: "Therapeutic" },
    { path: "/images/cute-foxes.png", name: "Cute Foxes", category: "Playful" },
    { path: "/images/zen-daisy.png", name: "Zen Daisy", category: "Therapeutic" },
    { path: "/images/tropical-beach.jpeg", name: "Tropical Beach", category: "Nature" },
    { path: "/images/zen-spa-stones.png", name: "Zen Spa", category: "Therapeutic" },
  ]

  const backgroundImages = isMobile ? mobileBackgroundImages : desktopBackgroundImages

  const categories = ["All", "Nature", "Therapeutic", "Playful", "Professional"]
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredImages =
    selectedCategory === "All" ? backgroundImages : backgroundImages.filter((img) => img.category === selectedCategory)

  const handleImageSelect = (imagePath: string) => {
    onSelectImage(imagePath)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  useEffect(() => {
    const preloadImages = () => {
      const allImages = [...mobileBackgroundImages, ...desktopBackgroundImages]
      allImages.forEach((image) => {
        const img = new Image()
        img.src = image.path
      })
    }

    preloadImages()
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/30 max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <h2 className="text-2xl font-semibold text-gray-800">Choose Background Image</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="rounded-full p-2 hover:bg-gray-200/50">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Category filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className={`rounded-full ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                    : "bg-white/60 hover:bg-white/80 text-gray-700"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-h-96 overflow-y-auto">
            {filteredImages.map((image) => (
              <div
                key={image.path}
                onClick={() => handleImageSelect(image.path)}
                className={`relative cursor-pointer rounded-xl overflow-hidden aspect-[4/3] hover:scale-105 transition-all duration-300 ${
                  currentImage === image.path ? "ring-4 ring-pink-500 shadow-lg" : "hover:shadow-xl"
                }`}
              >
                <img
                  src={image.path || "/placeholder.svg"}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">{image.name}</p>
                  <p className="text-white/80 text-xs">{image.category}</p>
                </div>
                {currentImage === image.path && (
                  <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
