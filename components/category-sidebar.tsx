"use client";

import { Category } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, FileText } from "lucide-react";
import Link from "next/link";

interface CategorySidebarProps {
  category: Category;
  activeResourceSlug?: string;
}

export function CategorySidebar({ category, activeResourceSlug }: CategorySidebarProps) {
  return (
    <div className="w-64 border-r bg-muted/30 min-h-screen flex-shrink-0">
      <div className="p-4 border-b">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Home
        </Link>
        <Link href={`/category/${category.slug}`}>
          <h2 className="font-bold text-lg mt-4 hover:text-primary transition-colors cursor-pointer">{category.name}</h2>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          {category.resources.length} resources
        </p>
      </div>
      
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="p-2">
          {category.subgroups && category.subgroups.length > 0 ? (
            category.subgroups.map((subgroup) => (
              <div key={subgroup.name} className="mb-4">
                <div className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-muted-foreground">
                  <Folder className="h-4 w-4" />
                  {subgroup.name}
                </div>
                <div className="ml-4 space-y-1">
                  {subgroup.resources.map((resource) => (
                    <Link
                      key={resource.id}
                      href={`/category/${category.slug}/${resource.slug}`}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
                        activeResourceSlug === resource.slug
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <FileText className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{resource.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-1">
              {category.resources.map((resource) => (
                <Link
                  key={resource.id}
                  href={`/category/${category.slug}/${resource.slug}`}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
                    activeResourceSlug === resource.slug
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <FileText className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{resource.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
