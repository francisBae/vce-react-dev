export function extractImages(text: string): string[] {
  const imageRegex = /!\[img\]\((https:\/\/img\.examtopics\.com\/[^)]+)\)/g;
  const matches = [...text.matchAll(imageRegex)];
  return matches.map(match => match[1]);
}

export function removeImageMarkdown(text: string): string {
  return text.replace(/!\[img\]\(https:\/\/img\.examtopics\.com\/[^)]+\)/g, '').trim();
} 