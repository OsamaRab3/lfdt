import { getCategoryBySlug, getAllCategories } from "@/lib/markdown";
import { ResourceCard } from "@/components/resource-card";
import { CategorySidebar } from "@/components/category-sidebar";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

export function generateMetadata({ params }: CategoryPageProps) {
  return {
    title: `Learning Resources`,
    description: "Browse learning resources",
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <CategorySidebar category={category} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
            <p className="text-lg text-muted-foreground">
              {category.resources.length} {category.resources.length === 1 ? "resource" : "resources"} available
            </p>
          </div>

          {/* Resources Grid - Grouped by Subgroup */}
          {category.subgroups && category.subgroups.length > 0 ? (
            <div className="space-y-16">
              {category.subgroups.map((subgroup) => (
                <div key={subgroup.name}>
                  <h2 className="text-2xl font-bold mb-6 pb-2 border-b">{subgroup.name}</h2>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {subgroup.resources.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} categorySlug={category.slug} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : category.resources.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {category.resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} categorySlug={category.slug} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <p className="text-muted-foreground text-lg">No resources found in this category.</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
