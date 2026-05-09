import React from "react";
import { getCategoryBySlug, getResourceBySlug, getAllCategories } from "@/lib/markdown";
import { CategorySidebar } from "@/components/category-sidebar";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ResourcePageProps {
  params: Promise<{ slug: string; resourceSlug: string[] }>;
}

// Helper to render inline markdown (bold, italic, code, images)
function renderMarkdownText(text: string): React.ReactNode {
  // Check for inline image syntax: ![alt](src)
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  if (imageRegex.test(text)) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    imageRegex.lastIndex = 0; // Reset regex
    
    while ((match = imageRegex.exec(text)) !== null) {
      const [fullMatch, alt, src] = match;
      // Add text before image
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{renderInlineFormatting(text.slice(lastIndex, match.index))}</span>);
      }
      // Add image
      parts.push(
        <img 
          key={match.index} 
          src={src} 
          alt={alt} 
          className="inline-block max-h-8 w-auto align-text-bottom mx-1"
        />
      );
      lastIndex = match.index + fullMatch.length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{renderInlineFormatting(text.slice(lastIndex))}</span>);
    }
    return <>{parts}</>;
  }
  
  return renderInlineFormatting(text);
}

// Helper for inline formatting (bold, italic, code, links)
function renderInlineFormatting(text: string): React.ReactNode {
  // First handle links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  if (linkRegex.test(text)) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    linkRegex.lastIndex = 0;
    
    while ((match = linkRegex.exec(text)) !== null) {
      const [fullMatch, linkText, url] = match;
      // Add text before link (with other formatting)
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{renderBasicFormatting(text.slice(lastIndex, match.index))}</span>);
      }
      // Check if it's a YouTube link - don't embed here to avoid <div> in <p>
      // YouTube embedding is handled at paragraph level
      // Add regular link
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
      parts.push(<span key={lastIndex}>{renderBasicFormatting(text.slice(lastIndex))}</span>);
    }
    return <>{parts}</>;
  }
  
  return renderBasicFormatting(text);
}

// Helper for basic formatting (bold, italic, code)
function renderBasicFormatting(text: string): React.ReactNode {
  // Split by patterns: **bold**, *italic*, `code`
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`[^`]+`)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        // Bold: **text**
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        // Italic: *text* (but not **)
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        }
        // Inline code: `text`
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  const params: { slug: string; resourceSlug: string[] }[] = [];
  
  for (const category of categories) {
    for (const resource of category.resources) {
      // Split slug by "/" for catch-all route
      params.push({ slug: category.slug, resourceSlug: resource.slug.split("/") });
    }
  }
  
  return params;
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug, resourceSlug } = await params;
  const category = getCategoryBySlug(slug);
  
  if (!category) {
    notFound();
  }
  
  // Join array segments to form the full resource slug
  const fullResourceSlug = resourceSlug.join("/");
  const resource = getResourceBySlug(slug, fullResourceSlug);
  
  if (!resource) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <CategorySidebar category={category} activeResourceSlug={fullResourceSlug} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/category/${category.slug}`} className="hover:text-foreground transition-colors">
              {category.name}
            </Link>
            {resource.subgroup && (
              <>
                <span>/</span>
                <span className="text-muted-foreground">{resource.subgroup}</span>
              </>
            )}
            <span>/</span>
            <span className="text-foreground">{resource.title}</span>
          </div>

          {/* Resource Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary">
                {resource.type}
              </Badge>
              {resource.subgroup && (
                <Badge variant="outline">{resource.subgroup}</Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4">{resource.title}</h1>
            <p className="text-lg text-muted-foreground">{resource.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {resource.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* YouTube Video Embed */}
          {resource.videoId && (
            <div className="mb-8">
              <YouTubeEmbed videoId={resource.videoId} title={resource.title} />
            </div>
          )}

          {/* External Link - detect YouTube and embed, otherwise show as link */}
          {resource.externalLink && (() => {
            const youtubeMatch = resource.externalLink.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
            if (youtubeMatch) {
              return (
                <div className="mb-8">
                  <YouTubeEmbed videoId={youtubeMatch[1]} title={resource.title} />
                </div>
              );
            }
            return (
              <div className="mb-8 p-4 bg-muted rounded-lg">
                <a 
                  href={resource.externalLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {resource.externalLink}
                </a>
              </div>
            );
          })()}

          {/* Markdown Content */}
          {resource.content && (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="p-6 bg-muted/50 rounded-lg border">
                <div className="text-base leading-relaxed space-y-4">
                  {resource.content.split('\n\n').map((paragraph, index) => {
                    const trimmedParagraph = paragraph.trim();
                    
                    // Handle standalone YouTube links - auto embed as video
                    // Check if paragraph contains a YouTube link
                    const youtubeMatch = trimmedParagraph.match(/\[([^\]]+)\]\((https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+))\)/);
                    if (youtubeMatch && !trimmedParagraph.includes('![')) {
                      const [, linkText, fullUrl, videoId] = youtubeMatch;
                      // Extract text before the link
                      const beforeLink = trimmedParagraph.slice(0, trimmedParagraph.indexOf('[')).trim();
                      // Extract text after the link
                      const afterLink = trimmedParagraph.slice(trimmedParagraph.indexOf(')') + 1).trim();
                      
                      return (
                        <div key={index} className="my-6">
                          {beforeLink && <p className="mb-2">{renderMarkdownText(beforeLink)}</p>}
                          <YouTubeEmbed videoId={videoId} title={linkText} />
                          {afterLink && <p className="mt-2">{renderMarkdownText(afterLink)}</p>}
                        </div>
                      );
                    }
                    
                    // Handle linked images: [![alt](img)](link) - YouTube thumbnails, etc.
                    const linkedImageMatch = trimmedParagraph.match(/^\[!\[(.*?)\]\((.*?)\)\]\((.*?)\)$/);
                    if (linkedImageMatch) {
                      const [, alt, imgSrc, linkUrl] = linkedImageMatch;
                      
                      // Try to extract video ID from link URL
                      let videoId = null;
                      const linkYoutubeMatch = linkUrl.match(/youtube\.com\/watch\?v=([^&]+)/);
                      const imgYoutubeMatch = imgSrc.match(/youtube\.com\/watch\?v=([^&]+)/);
                      
                      if (linkYoutubeMatch) {
                        videoId = linkYoutubeMatch[1];
                      } else if (imgYoutubeMatch) {
                        videoId = imgYoutubeMatch[1];
                      }
                      
                      // If we found a YouTube video ID, embed it
                      if (videoId) {
                        return (
                          <div key={index} className="my-6">
                            <YouTubeEmbed videoId={videoId} title={alt} />
                          </div>
                        );
                      }
                      
                      // Regular linked image
                      return (
                        <div key={index} className="my-6">
                          <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
                            <img 
                              src={imgSrc} 
                              alt={alt} 
                              className="max-w-full h-auto rounded-lg shadow-lg"
                            />
                          </a>
                        </div>
                      );
                    }
                    
                    // Handle images (standalone line)
                    const imageMatch = trimmedParagraph.match(/^!\[(.*?)\]\((.*?)\)$/);
                    if (imageMatch) {
                      const [, alt, src] = imageMatch;
                      return (
                        <div key={index} className="my-6">
                          <img 
                            src={src} 
                            alt={alt} 
                            className="max-w-full h-auto rounded-lg"
                          />
                        </div>
                      );
                    }
                    // Handle headers (h1, h2, h3)
                    if (trimmedParagraph.startsWith('# ')) {
                      return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{trimmedParagraph.replace('# ', '')}</h1>;
                    }
                    if (trimmedParagraph.startsWith('## ')) {
                      return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{trimmedParagraph.replace('## ', '')}</h2>;
                    }
                    if (trimmedParagraph.startsWith('### ')) {
                      return <h3 key={index} className="text-xl font-bold mt-6 mb-3">{trimmedParagraph.replace('### ', '')}</h3>;
                    }
                    // Handle blockquotes
                    if (trimmedParagraph.startsWith('> ')) {
                      return (
                        <blockquote key={index} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                          {trimmedParagraph.replace('> ', '').replace(/^> /gm, '')}
                        </blockquote>
                      );
                    }
                    // Handle lists
                    if (trimmedParagraph.startsWith('- ')) {
                      const items = paragraph.split('\n').filter(line => line.trim().startsWith('- '));
                      return (
                        <ul key={index} className="list-disc list-inside space-y-2 my-4">
                          {items.map((item, i) => (
                            <li key={i}>{renderMarkdownText(item.trim().replace('- ', ''))}</li>
                          ))}
                        </ul>
                      );
                    }
                    // Handle numbered lists
                    if (trimmedParagraph.match(/^\d+\. /)) {
                      const items = paragraph.split('\n').filter(line => /^\d+\. /.test(line.trim()));
                      return (
                        <ol key={index} className="list-decimal list-inside space-y-2 my-4">
                          {items.map((item, i) => (
                            <li key={i}>{renderMarkdownText(item.trim().replace(/^\d+\. /, ''))}</li>
                          ))}
                        </ol>
                      );
                    }
                    // Handle code blocks
                    if (trimmedParagraph.startsWith('```')) {
                      const codeContent = trimmedParagraph.replace(/```\w*\n?/, '').replace(/```$/, '');
                      return (
                        <pre key={index} className="bg-black/50 p-4 rounded-lg overflow-x-auto my-4">
                          <code className="text-sm font-mono text-green-400">{codeContent}</code>
                        </pre>
                      );
                    }
                    // Inline code, bold/italic text, links, and inline images
                    return <p key={index} className="text-foreground">{renderMarkdownText(trimmedParagraph)}</p>;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
