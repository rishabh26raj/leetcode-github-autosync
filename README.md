# ⚡ LeetCode GitHub AutoSync

> Automatically sync your accepted LeetCode solutions to GitHub. Never lose a solution again.

A Chrome Extension built with **React**, **TypeScript**, **Vite**, and **Manifest V3** that detects accepted LeetCode submissions and commits them directly to your GitHub repository.

---

## ✨ Features

- 🔗 **GitHub Integration** — Connect via Personal Access Token
- 🎯 **Auto-Detection** — Detects accepted submissions in real-time
- 📁 **Organized Structure** — Solutions sorted by difficulty (`Easy/`, `Medium/`, `Hard/`)
- 🔄 **Duplicate Prevention** — SHA-256 hash comparison prevents redundant commits
- 📊 **Stats Dashboard** — Track your progress with live statistics
- ⚙️ **Configurable** — Auto-sync toggle, repo visibility settings
- 📝 **Auto README** — Repository README updated with solve statistics

## 🏗️ Project Structure

```
src/
├── background/          # Service worker (GitHub API, auth)
│   ├── index.ts         # Message router
│   ├── auth.ts          # Token management
│   └── github-api.ts    # GitHub REST API client
├── content/             # Content script (LeetCode detection)
│   ├── index.ts         # Submission detector
│   └── leetcode-parser.ts  # DOM metadata extractor
├── popup/               # React popup UI
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/      # Reusable UI components
│   ├── pages/           # Dashboard & Settings
│   └── styles/          # CSS design system
├── types/               # Shared TypeScript interfaces
└── utils/               # Storage, helpers, constants
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Chrome

### Installation

```bash
# Clone and install
git clone <repo-url>
cd leetcode-github-autosync
npm install

# Build the extension
npm run build

# For development with watch mode
npm run dev
```

### Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder

### Setup

1. Click the extension icon in Chrome toolbar
2. Generate a [GitHub Personal Access Token](https://github.com/settings/tokens/new?scopes=repo&description=LeetCode+AutoSync) with `repo` scope
3. Paste the token in the extension popup
4. Start solving LeetCode problems — solutions auto-sync on "Accepted"!

## 📁 Repository Structure

Solutions are organized in your GitHub repo as:

```
<username>-leetcode/
├── Easy/
│   └── 0001-two-sum/
│       └── solution.py
├── Medium/
│   └── 0002-add-two-numbers/
│       └── solution.cpp
├── Hard/
│   └── 0004-median-of-two-sorted-arrays/
│       └── solution.ts
└── README.md  ← auto-generated stats
```

## 🛠️ Tech Stack

| Technology | Purpose |
|:---|:---|
| React 18 | Popup UI |
| TypeScript 5 | Type safety |
| Vite 5 | Build tooling |
| Manifest V3 | Chrome Extension API |
| GitHub REST API | File commits |
| Chrome Storage | Persistence |

## 🔐 Security

- Tokens are stored locally in `chrome.storage.local`
- No data leaves your browser except to GitHub's API
- No analytics, telemetry, or third-party services
- Fine-grained PAT with minimal `repo` scope

## 📜 License

MIT
