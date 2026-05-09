import { CategoryCard } from "@/components/category-card";
import { getAllCategories, getHomeContent } from "@/lib/markdown";
import React from "react";

export const metadata = {
  title: "LFDT Study Group (LFDTsg) - Hyperledger Fabric & Zero Knowledge",
  description: "A minimal learning resource hub for Hyperledger Fabric and Zero Knowledge topics.",
};

// Helper to render inline markdown (bold, italic, code, links)
function renderInlineText(text: string): React.ReactNode {
  // Handle links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  if (linkRegex.test(text)) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    linkRegex.lastIndex = 0;
    
    while ((match = linkRegex.exec(text)) !== null) {
      const [fullMatch, linkText, url] = match;
      // Add text before link
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{text.slice(lastIndex, match.index)}</span>);
      }
      // Add link
      parts.push(
        <a 
          key={match.index} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {linkText}
        </a>
      );
      lastIndex = match.index + fullMatch.length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
    }
    return <>{parts}</>;
  }
  
  return text;
}

export default function Home() {
  const categories = getAllCategories();
  const homeContent = getHomeContent();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section with Rich Content */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">LFDT Study Group (LFDTsg)</h1>
          
          {homeContent ? (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="text-lg leading-relaxed space-y-4">
                {homeContent.content.split('\n\n').map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  // Handle headers
                  if (trimmed.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{trimmed.replace('## ', '')}</h2>;
                  }
                  // Handle blockquotes
                  if (trimmed.startsWith('> ')) {
                    return (
                      <blockquote key={index} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                        {renderInlineText(trimmed.replace('> ', ''))}
                      </blockquote>
                    );
                  }
                  // Handle lists
                  if (trimmed.startsWith('- ')) {
                    const items = trimmed.split('\n').filter(line => line.trim().startsWith('- '));
                    return (
                      <ul key={index} className="list-disc list-inside space-y-2 my-4">
                        {items.map((item, i) => (
                          <li key={i}>{renderInlineText(item.trim().replace('- ', ''))}</li>
                        ))}
                      </ul>
                    );
                  }
                  // Handle numbered lists
                  if (trimmed.startsWith('1. ')) {
                    const items = trimmed.split('\n').filter(line => /^\d+\. /.test(line.trim()));
                    return (
                      <ol key={index} className="list-decimal list-inside space-y-2 my-4">
                        {items.map((item, i) => (
                          <li key={i}>{renderInlineText(item.trim().replace(/^\d+\. /, ''))}</li>
                        ))}
                      </ol>
                    );
                  }
                  // Handle bold text
                  if (trimmed.includes('**')) {
                    const parts = trimmed.split(/(\*\*.*?\*\*)/g);
                    return (
                      <p key={index}>
                        {parts.map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i}>{renderInlineText(part.slice(2, -2))}</strong>;
                          }
                          return renderInlineText(part);
                        })}
                      </p>
                    );
                  }
                  // Regular paragraphs
                  return <p key={index} className="text-muted-foreground">{renderInlineText(trimmed)}</p>;
                })}
              </div>
            </div>
          ) : (
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore curated resources for Hyperledger Fabric and Zero Knowledge cryptography. 
              Build your knowledge with tutorials, articles, documentation, and GitHub repositories.
            </p>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl font-bold mb-8">Topics</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard
              key={category.slug}
              name={category.name}
              slug={category.slug}
              resourceCount={category.resources.length}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Open-source learning resource hub. Contribute by adding markdown files to the <code className="bg-muted px-2 py-1 rounded">content/</code> directory.</p>
        </div>
      </footer>
    </main>
  );
}
