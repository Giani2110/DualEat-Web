export interface Commit {
  sha: string;
  repo: "web" | "backend" | "mobile";
  date: string;
  title: string;
  description: string;
  url: string;
}

/**
 * Splits a commit message into a clean title (first line) and description (the rest).
 */
export const parseCommitMessage = (message: string): { title: string; description: string } => {
  if (!message) return { title: "Sin título", description: "" };
  
  const lines = message.split("\n");
  const title = lines[0].trim();
  const descriptionLines = lines.slice(1).filter((line) => line.trim() !== "");
  const description = descriptionLines.join("\n").trim();
  
  return { title, description };
};

/**
 * Fetches commits from a specific public GitHub repository.
 * Handles API errors gracefully by returning an empty array instead of throwing.
 */
export const fetchCommitsForRepo = async (
  owner: string,
  repo: string,
  type: "web" | "backend" | "mobile"
): Promise<Commit[]> => {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=40`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      console.warn(`GitHub API warning for ${repo}: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
      const { title, description } = parseCommitMessage(item.commit?.message || "");
      return {
        sha: item.sha,
        repo: type,
        date: item.commit?.author?.date || item.commit?.committer?.date || new Date().toISOString(),
        title,
        description,
        url: item.html_url || `https://github.com/${owner}/${repo}/commit/${item.sha}`,
      };
    });
  } catch (error) {
    console.error(`Error fetching commits for repository ${repo}:`, error);
    return [];
  }
};

/**
 * Fetches commits for all three repositories in parallel, merges them,
 * and sorts them from newest to oldest.
 */
export const fetchAndMergeCommits = async (): Promise<Commit[]> => {
  const [webCommits, backendCommits, mobileCommits] = await Promise.all([
    fetchCommitsForRepo("Giani2110", "DualEat-Web", "web"),
    fetchCommitsForRepo("Galoniax", "DualEat-Backend", "backend"),
    fetchCommitsForRepo("Galoniax", "DualEat-Mobile", "mobile"),
  ]);

  const allCommits = [...webCommits, ...backendCommits, ...mobileCommits];

  // Sort descending by date (newest first)
  return allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
