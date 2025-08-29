interface FormattedTextProps {
  text: string
  className?: string
}

export function FormattedText({ text, className = "" }: FormattedTextProps) {
  const preprocessText = (text: string) => {
    // Clean up malformed asterisk patterns
    let cleaned = text

    // Fix patterns like "*text**:" to "**text**:"
    cleaned = cleaned.replace(/\*([^*]+)\*\*:/g, "**$1**:")

    // Fix patterns like "text."* to "text.**"
    cleaned = cleaned.replace(/([^*])\.\*(?!\*)/g, "$1.**")

    // Fix patterns like "*text*:" to "**text**:"
    cleaned = cleaned.replace(/\*([^*]+)\*:/g, "**$1**:")

    // Fix single trailing asterisks that should be double
    cleaned = cleaned.replace(/([^*])\*(?=\s|$|[.,:;!?])/g, "$1**")

    // Fix leading single asterisks that should be double
    cleaned = cleaned.replace(/(?:^|\s)\*([^*\s])/g, " **$1")

    // Clean up any triple or more asterisks to double
    cleaned = cleaned.replace(/\*{3,}/g, "**")

    return cleaned
  }

  // Function to parse and format text with markdown-like syntax
  const formatText = (text: string) => {
    const processedText = preprocessText(text)

    // Split by lines first to handle bullet points
    const lines = processedText.split("\n")

    return lines.map((line, lineIndex) => {
      // Handle bullet points
      if (line.trim().startsWith("•") || line.trim().startsWith("-") || line.trim().startsWith("*")) {
        const bulletText = line.replace(/^[\s]*[•\-*][\s]*/, "")
        return (
          <div key={`line-${lineIndex}`} className="flex items-start gap-2 mb-1">
            <span className="text-gray-600 mt-1">•</span>
            <span>{formatInlineText(bulletText)}</span>
          </div>
        )
      }

      // Handle regular lines
      return (
        <div key={`line-${lineIndex}`} className={lineIndex > 0 ? "mt-2" : ""}>
          {formatInlineText(line)}
        </div>
      )
    })
  }

  const formatInlineText = (text: string) => {
    const parts = []
    let currentIndex = 0
    let key = 0

    // Process the text and find all markdown patterns
    const patterns = []

    // Find double asterisk patterns first (bold) **text**
    let match
    const boldRegex = /\*\*([^*]+?)\*\*/g
    while ((match = boldRegex.exec(text)) !== null) {
      patterns.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
        type: "bold",
      })
    }

    // Find single asterisk patterns (italic) *text* but not if they're part of double asterisks
    const italicRegex = /(?<!\*)\*([^*\n]+?)\*(?!\*)/g
    while ((match = italicRegex.exec(text)) !== null) {
      // Check if this single asterisk is not part of a double asterisk pattern
      const isPartOfBold = patterns.some(
        (p) => p.type === "bold" && match.index >= p.start - 1 && match.index <= p.end + 1,
      )
      if (!isPartOfBold) {
        patterns.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[1],
          type: "italic",
        })
      }
    }

    // Sort patterns by start position
    patterns.sort((a, b) => a.start - b.start)

    // Build the formatted text
    patterns.forEach((pattern) => {
      // Add text before this pattern
      if (pattern.start > currentIndex) {
        parts.push(text.slice(currentIndex, pattern.start))
      }

      // Add the formatted element
      if (pattern.type === "bold") {
        parts.push(
          <strong key={`bold-${key++}`} className="font-bold">
            {pattern.content}
          </strong>,
        )
      } else if (pattern.type === "italic") {
        parts.push(
          <em key={`italic-${key++}`} className="italic">
            {pattern.content}
          </em>,
        )
      }

      currentIndex = pattern.end
    })

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex))
    }

    return parts.length > 0 ? parts : text
  }

  return <div className={className}>{formatText(text)}</div>
}
