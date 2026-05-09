import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface ResourceFrontmatter {
  title: string;
  description: string;
  externalLink: string;
  tags: string[];
  type: "video" | "article" | "docs" | "github";
  subgroup?: string;
  videoId?: string;
}

export interface Resource extends ResourceFrontmatter {
  id: string;
  slug: string;
  content?: string;
}

export interface Subgroup {
  name: string;
  resources: Resource[];
}

export interface Category {
  name: string;
  slug: string;
  resources: Resource[];
  subgroups?: Subgroup[];
}

const CONTENT_DIR = path.join(process.cwd(), "content");

function getResourcesForCategory(categorySlug: string): Resource[] {
  const categoryPath = path.join(CONTENT_DIR, categorySlug);

  if (!fs.existsSync(categoryPath)) {
    return [];
  }

  const resources: Resource[] = [];

  function scanDirectory(dirPath: string, subgroupName?: string) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        // Recursively scan subdirectories - folder name becomes subgroup name
        scanDirectory(fullPath, item.name);
      } else if (item.isFile() && item.name.endsWith(".md")) {
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(fileContents);

        const slug = item.name.replace(".md", "");
        const relativePath = path.relative(categoryPath, dirPath);

        // If file is in root, use explicit subgroup from frontmatter or no subgroup
        // If file is in subfolder, use folder name as subgroup (override frontmatter)
        const effectiveSubgroup = relativePath && relativePath !== "." 
          ? relativePath.split(path.sep)[0]  // First folder name
          : data.subgroup;

        // Trim content to remove leading/trailing whitespace
        const trimmedContent = content.trim();

        resources.push({
          id: `${categorySlug}-${relativePath ? relativePath.replace(/\\/g, "-") + "-" : ""}${slug}`,
          slug: relativePath ? `${relativePath.replace(/\\/g, "/")}/${slug}` : slug,
          ...(data as ResourceFrontmatter),
          subgroup: effectiveSubgroup,
          content: trimmedContent || undefined,
        });
      }
    }
  }

  scanDirectory(categoryPath);
  return resources;
}

export function getAllCategories(): Category[] {
  const fabricResources = getResourcesForCategory("fabric");
  const fabricXResources = getResourcesForCategory("fabric-x");
  const zkResources = getResourcesForCategory("zk");

  // Group fabric resources by subgroup
  const fabricSubgroups = groupResourcesBySubgroup(fabricResources);

  const categories: Category[] = [
    {
      name: "Hyperledger Fabric",
      slug: "fabric",
      resources: fabricResources,
      subgroups: fabricSubgroups.length > 0 ? fabricSubgroups : undefined,
    },
    {
      name: "Fabric-X",
      slug: "fabric-x",
      resources: fabricXResources,
    },
    {
      name: "Zero Knowledge",
      slug: "zk",
      resources: zkResources,
    },
  ];

  return categories;
}

function groupResourcesBySubgroup(resources: Resource[]): Subgroup[] {
  const subgroupMap = new Map<string, Resource[]>();

  resources.forEach((resource) => {
    if (resource.subgroup) {
      if (!subgroupMap.has(resource.subgroup)) {
        subgroupMap.set(resource.subgroup, []);
      }
      subgroupMap.get(resource.subgroup)!.push(resource);
    }
  });

  return Array.from(subgroupMap.entries()).map(([name, resources]) => ({
    name,
    resources,
  }));
}

export function getCategoryBySlug(slug: string): Category | null {
  const categories = getAllCategories();
  return categories.find((cat) => cat.slug === slug) || null;
}

export function getResourceBySlug(categorySlug: string, resourceSlug: string): Resource | null {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return null;
  
  // Support nested paths like "tool/intro" or "chaincode/basics"
  // resourceSlug may contain "/" from URL, but stored slug uses "/"
  const normalizedSlug = resourceSlug.replace(/\\/g, "/");
  
  const resource = category.resources.find((r) => r.slug === normalizedSlug);
  return resource || null;
}

// Helper to generate static params for nested resources
export function getAllResourceSlugs(): { slug: string; resourceSlug: string }[] {
  const categories = getAllCategories();
  const params: { slug: string; resourceSlug: string }[] = [];
  
  for (const category of categories) {
    for (const resource of category.resources) {
      params.push({ slug: category.slug, resourceSlug: resource.slug });
    }
  }
  
  return params;
}

export interface HomeContent {
  title: string;
  content: string;
}

export function getHomeContent(): HomeContent | null {
  const homePath = path.join(CONTENT_DIR, "home", "about.md");
  
  if (!fs.existsSync(homePath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(homePath, "utf8");
  const { data, content } = matter(fileContents);
  
  return {
    title: data.title || "Welcome",
    content: content.trim(),
  };
}
