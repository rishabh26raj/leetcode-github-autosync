import type { LeetCodeSubmission } from '../types';
import { LANGUAGE_EXTENSIONS, COMMIT_MESSAGE_TEMPLATE, UPDATE_COMMIT_MESSAGE_TEMPLATE } from './constants';

/**
 * Convert a problem title to a URL-safe slug.
 * "Two Sum" → "two-sum"
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Pad a problem number to 4 digits.
 * 1 → "0001", 42 → "0042", 1234 → "1234"
 */
export function padProblemNumber(num: number): string {
  return String(num).padStart(4, '0');
}

/**
 * Get the file extension for a given language.
 */
export function getFileExtension(language: string): string {
  const normalized = language.toLowerCase().trim();
  return LANGUAGE_EXTENSIONS[normalized] || '.txt';
}

/**
 * Generate the repository file path for a submission.
 * e.g. "Easy/0001-two-sum/solution.py"
 */
export function generateFilePath(submission: LeetCodeSubmission): string {
  const { difficulty, problemNumber, problemTitle, language } = submission;
  const paddedNumber = padProblemNumber(problemNumber);
  const slug = slugify(problemTitle);
  const ext = getFileExtension(language);
  return `${difficulty}/${paddedNumber}-${slug}/solution${ext}`;
}

/**
 * Generate a commit message for a new solution.
 */
export function generateCommitMessage(submission: LeetCodeSubmission, isUpdate: boolean = false): string {
  const template = isUpdate ? UPDATE_COMMIT_MESSAGE_TEMPLATE : COMMIT_MESSAGE_TEMPLATE;
  return template
    .replace('{number}', String(submission.problemNumber))
    .replace('{title}', submission.problemTitle)
    .replace('{difficulty}', submission.difficulty)
    .replace('{language}', submission.language);
}

/**
 * Create a SHA-256 hash of the code content for deduplication.
 */
export async function hashCode(code: string): Promise<string> {
  const normalized = code.trim().replace(/\s+/g, ' ');
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encode a string to Base64 (safe for GitHub API).
 */
export function toBase64(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Decode a Base64 string.
 */
export function fromBase64(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Format a timestamp to a human-readable relative time string.
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Capitalize first letter.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a file header comment for the solution.
 */
export function generateFileHeader(submission: LeetCodeSubmission): string {
  const { problemNumber, problemTitle, difficulty, language } = submission;
  const commentMap: Record<string, [string, string]> = {
    '.py': ['# ', ''],
    '.js': ['// ', ''],
    '.ts': ['// ', ''],
    '.java': ['// ', ''],
    '.cpp': ['// ', ''],
    '.c': ['// ', ''],
    '.go': ['// ', ''],
    '.rs': ['// ', ''],
    '.swift': ['// ', ''],
    '.kt': ['// ', ''],
    '.rb': ['# ', ''],
    '.php': ['// ', ''],
    '.cs': ['// ', ''],
    '.scala': ['// ', ''],
    '.dart': ['// ', ''],
    '.sh': ['# ', ''],
    '.r': ['# ', ''],
    '.sql': ['-- ', ''],
    '.hs': ['-- ', ''],
    '.lua': ['-- ', ''],
    '.pl': ['# ', ''],
    '.ex': ['# ', ''],
    '.erl': ['%% ', ''],
    '.rkt': ['; ', ''],
    '.m': ['// ', ''],
  };

  const ext = getFileExtension(language);
  const [prefix] = commentMap[ext] || ['// ', ''];

  return [
    `${prefix}Problem: ${problemNumber}. ${problemTitle}`,
    `${prefix}Difficulty: ${difficulty}`,
    `${prefix}Language: ${capitalize(language)}`,
    `${prefix}Link: https://leetcode.com/problems/${slugify(problemTitle)}/`,
    '',
    '',
  ].join('\n');
}

/**
 * Convert basic HTML to markdown (lightweight, no external dependency).
 */
function htmlToMarkdown(html: string): string {
  return html
    // Remove style/script tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Convert common elements
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n### $1\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n')
    .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '')
    .replace(/<p>([\s\S]*?)<\/p>/gi, '\n$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<sup>(.*?)<\/sup>/gi, '^$1')
    .replace(/<sub>(.*?)<\/sub>/gi, '_$1')
    .replace(/<img[^>]+alt="([^"]*)"[^>]*>/gi, '[$1]')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generate a README.md for a problem folder with the description.
 */
export function generateProblemReadme(submission: LeetCodeSubmission): string {
  const { problemNumber, problemTitle, difficulty, titleSlug, description } = submission;

  const difficultyBadge: Record<string, string> = {
    Easy: '🟢 Easy',
    Medium: '🟡 Medium',
    Hard: '🔴 Hard',
  };

  const header = [
    `# ${problemNumber}. ${problemTitle}`,
    '',
    `**Difficulty:** ${difficultyBadge[difficulty] || difficulty}`,
    `**Link:** [LeetCode](https://leetcode.com/problems/${titleSlug}/)`,
    '',
    '---',
    '',
  ].join('\n');

  const body = description ? htmlToMarkdown(description) : '_No description available._';

  return header + body + '\n';
}
