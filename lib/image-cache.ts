class ImageCache {
  private cache = new Map<string, HTMLImageElement>()
  private preloadPromises = new Map<string, Promise<void>>()

  preloadImage(src: string): Promise<void> {
    if (this.preloadPromises.has(src)) {
      return this.preloadPromises.get(src)!
    }

    const promise = new Promise<void>((resolve, reject) => {
      if (this.cache.has(src)) {
        resolve()
        return
      }

      const img = new Image()
      img.onload = () => {
        this.cache.set(src, img)
        resolve()
      }
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`))
      }
      img.src = src
    })

    this.preloadPromises.set(src, promise)
    return promise
  }

  preloadImages(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map((src) => this.preloadImage(src)))
  }

  getImage(src: string): HTMLImageElement | null {
    return this.cache.get(src) || null
  }

  clearCache(): void {
    this.cache.clear()
    this.preloadPromises.clear()
  }
}

export const imageCache = new ImageCache()
