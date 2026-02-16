"use client"

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  const renderMarkdown = (text: string) => {
    let html = text
      // Escape HTML
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Headers
      .replace(/^### (.*$)/gm, "<h3 class='text-lg font-semibold mt-4 mb-2'>$1</h3>")
      .replace(/^## (.*$)/gm, "<h2 class='text-xl font-semibold mt-6 mb-3'>$1</h2>")
      .replace(/^# (.*$)/gm, "<h1 class='text-2xl font-bold mt-6 mb-3'>$1</h1>")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Code blocks
      .replace(/```([\s\S]*?)```/g, "<pre class='bg-muted p-4 rounded-md overflow-x-auto my-4'><code>$1</code></pre>")
      // Inline code
      .replace(/`(.*?)`/g, "<code class='bg-muted px-1.5 py-0.5 rounded text-sm'>$1</code>")
      // Links (block javascript: and data: URLs)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
        const trimmed = url.trim().toLowerCase()
        if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:")) {
          return text
        }
        return `<a href="${url}" class="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">${text}</a>`
      })
      // Unordered lists
      .replace(/^\- (.*$)/gm, "<li class='ml-4'>• $1</li>")
      // Ordered lists (basic)
      .replace(/^\d+\. (.*$)/gm, "<li class='ml-4 list-decimal'>$1</li>")
      // Blockquotes
      .replace(/^> (.*$)/gm, "<blockquote class='border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground my-2'>$1</blockquote>")
      // Horizontal rule
      .replace(/^---$/gm, "<hr class='my-6 border-border'>")
      // Line breaks
      .replace(/\n/g, "<br>")

    return html
  }

  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}
