interface FormattedTextProps {
  text: string
  className?: string
}

export function FormattedText({ text, className = "" }: FormattedTextProps) {
  // Function to parse and format text with markdown-like syntax
  const formatText = (text: string) => {
    const parts = []
    const currentIndex = 0
    const key = 0

    // Split by lines first to handle bullet points
    const lines = text.split("\n")

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

    // Handle bold text **text**
    text.replace(/\*\*(.*?)\*\*/g, (match, content, offset) => {
      // Add text before the match
      if (offset > currentIndex) {
        parts.push(text.slice(currentIndex, offset))
      }
      // Add bold text
      parts.push(
        <strong key={`bold-${key++}`} className="font-semibold">
          {content}
        </strong>,
      )
      currentIndex = offset + match.length
      return match
    })

    // Handle italic text *text*
    const tempText = parts.length > 0 ? "" : text
    if (parts.length === 0) {
      tempText.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, (match, content, offset) => {
        if (offset > currentIndex) {
          parts.push(tempText.slice(currentIndex, offset))
        }
        parts.push(
          <em key={`italic-${key++}`} className="italic">
            {content}
          </em>,
        )
        currentIndex = offset + match.length
        return match
      })
    }

    // Add remaining text
    if (currentIndex < text.length && parts.length > 0) {
      parts.push(text.slice(currentIndex))
    }

    return parts.length > 0 ? parts : text
  }

  return <div className={className}>{formatText(text)}</div>
}
