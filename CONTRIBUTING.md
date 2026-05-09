# Contributing to LFDT

First off, thank you for considering contributing to LFDT! It's people like you that make this project such a great resource for the community.

## Getting Started

To get the development environment running locally:

1. **Fork and clone** the repository to your local machine.
2. **Install dependencies:**  
   We use `pnpm` as our package manager. If you don't have it installed, you can get it via `npm install -g pnpm`.
   ```bash
   pnpm install
   ```
3. **Run the development server:**
   ```bash
   pnpm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the site running locally.

## Adding or Editing Content

LFDT is a knowledge base. All content is managed using Markdown files located in the `content/` directory.

### Directory Structure

The content is organized into categories:
- `content/fabric/` - Hyperledger Fabric resources
- `content/fabric-x/` - Fabric-X resources
- `content/zk/` - Zero Knowledge resources

### Creating a New Resource

When adding a new resource, create a new `.md` file in the appropriate category directory (you can also place it in a subfolder to implicitly set a subgroup). 

Your file must include a **YAML frontmatter** block at the top:

```yaml
---
title: "Resource Title"
description: "A very short description of the resource."
externalLink: "https://example.com" # Optional external link to the resource
tags: ["fabric", "tool", "guide"]
type: "article" # Must be one of: "video", "article", "docs", "github"
subgroup: "Tools" # Optional: explicitly defines the sidebar group (otherwise derived from the folder name)
videoId: "dQw4w9WgXcQ" # Optional: YouTube Video ID to embed at the top
---

Your markdown content goes here...
```

### Markdown Guidelines

- **Formatting:** Standard Markdown (bold, lists, code blocks, blockquotes) is fully supported.
- **Paths for Images:** If you need to include an image, place the image file in the `public/images/` directory. Reference the image using absolute paths starting with a slash in your Markdown: 
  ```markdown
  ![Description of the image](/images/my-image.png)
  ```
- **Internal Links:** Our Next.js site automatically handles prepending the base path to absolute markdown links in production.

## Pull Request Process

1. Create a branch for your feature or content addition:
   ```bash
   git checkout -b feature/my-new-resource
   ```
2. Check your changes locally to ensure everything renders correctly.
3. Commit your changes:
   ```bash
   git commit -s -m "feat(content): add my new resource"
   ```
4. Push the branch to your fork:
   ```bash
   git push origin feature/my-new-resource
   ```
5. Open a **Pull Request** against the `main` branch of this repository.

## Developing the Web UI

If you are contributing to the site's React/Next.js source code (in `app/`, `components/`, or `lib/`):
- Ensure that the application builds successfully via `pnpm run build`.
- We use standard `eslint` rules. Make sure your code respects them (`pnpm lint`).
- We heavily use Tailwind CSS and Radix UI primitives.

Thank you for contributing!
