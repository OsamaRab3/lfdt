import { Resource } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, ArrowRight, Play } from "lucide-react";
import Link from "next/link";

interface ResourceCardProps {
  resource: Resource;
  categorySlug?: string;
}

export function ResourceCard({ resource, categorySlug }: ResourceCardProps) {
  const typeColors: Record<string, string> = {
    video: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    article: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    docs: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    github: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  };

  return (
    <Card className="flex h-full flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{resource.title}</CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {resource.description}
            </CardDescription>
          </div>
          <Badge className={typeColors[resource.type]}>
            {resource.type === "video" && resource.videoId ? (
              <><Play className="h-3 w-3 mr-1" /> video</>
            ) : (
              resource.type
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {resource.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          {categorySlug && (
            <Button
              asChild
              className="flex-1"
              variant="default"
            >
              <Link href={`/category/${categorySlug}/${resource.slug}`}>
                View <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button
            asChild
            className={categorySlug ? "flex-1" : "w-full"}
            variant="outline"
          >
            <a href={resource.externalLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              {categorySlug ? "Open" : "Visit"}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
