import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  name: string;
  slug: string;
  resourceCount: number;
}

export function CategoryCard({ name, slug, resourceCount }: CategoryCardProps) {
  return (
    <Link href={`/category/${slug}`}>
      <Card className="cursor-pointer h-full hover:shadow-lg transition-shadow hover:border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">{name}</CardTitle>
          <CardDescription className="text-base">
            {resourceCount} {resourceCount === 1 ? "resource" : "resources"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" className="group">
            Browse Resources
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
