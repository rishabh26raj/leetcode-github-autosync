<div align="center">

<img src="public/icons/icon128.png" width="100" alt="LeetCode GitHub AutoSync logo" />

# ⚡ LeetCode GitHub AutoSync

**Automatically sync your accepted LeetCode solutions to GitHub — the moment you hit "Accepted".**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📖 What Is This?

**LeetCode GitHub AutoSync** is a Chrome Extension that watches your LeetCode submissions in real time and automatically commits your accepted solutions to a dedicated GitHub repository — organized, timestamped, and tracked — so you never have to copy-paste code again.

No backend. No third-party servers. Just your browser talking directly to GitHub's API.

---

## ✨ Features

| Feature | Description |
|:---|:---|
| 🔗 **One-click GitHub Connect** | Paste a Personal Access Token and you're live |
| 🎯 **Auto-Detection** | Detects "Accepted" verdicts on LeetCode in real time |
| 📁 **Organized by Difficulty** | Solutions saved under `Easy/`, `Medium/`, `Hard/` folders |
| 🔄 **Duplicate Prevention** | SHA-256 hash comparison skips already-synced solutions |
| 📊 **Stats Dashboard** | Track total, easy, medium, hard solved — right in the popup |
| 📝 **Live Activity Feed** | See your last 8 synced solutions with language & difficulty |
| 🔒 **Private or Public Repo** | Choose repo visibility in Settings |
| ⚙️ **Auto-Sync Toggle** | Turn off auto-sync to push manually when you're ready |
| 🗂️ **Auto README** | Target repo README updated automatically with your latest stats |
| 🌐 **20+ Languages** | Python, Java, C++, Go, Rust, TypeScript, SQL, and more |

---

## 🎬 How It Works

```
You solve a problem on LeetCode
        ↓
Extension detects "Accepted" verdict (via content script)
        ↓
Extracts: problem title, number, difficulty, language, solution code
        ↓
Background service worker commits file to GitHub via REST API
        ↓
Your repo: Easy/0001-two-sum/solution.py ✅
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** (comes with Node)
- **Google Chrome** (or Chromium-based browser)
- A **GitHub account** and a **Personal Access Token**

---

### 1. Clone & Build

```bash
git clone https://github.com/rishabh26raj/leetcode-github-autosync.git
cd leetcode-github-autosync

# Install dependencies
npm install

# Build the extension
npm run build
```

This generates a production-ready `dist/` folder.

> **Development mode** (auto-rebuild on file changes):
> ```bash
> npm run dev
> ```

---

### 2. Load the Extension in Chrome

1. Open Chrome and go to **`chrome://extensions/`**
2. Enable **Developer mode** using the toggle in the top-right corner
3. Click **"Load unpacked"**
4. Select the **`dist/`** folder inside the project directory
5. The extension icon will appear in your Chrome toolbar

---

### 3. Generate a GitHub Personal Access Token

1. Go to [GitHub → Settings → Developer Settings → Tokens (classic)](https://github.com/settings/tokens/new?scopes=repo&description=LeetCode+AutoSync)
2. Give it a name like **"LeetCode AutoSync"**
3. Under **Scopes**, check ✅ **`repo`** (this allows reading and writing to your repositories)
4. Click **"Generate token"** and **copy it immediately** (you won't see it again)

> 💡 For better security, you can use a **Fine-Grained Personal Access Token** with only `Contents: Read & Write` permission on a specific repository.

---

### 4. Connect the Extension

1. Click the **AutoSync** extension icon in your Chrome toolbar
2. Paste your GitHub Personal Access Token into the input field
3. Click **"Connect GitHub"**
4. The extension will verify your token and automatically create a repository named `<your-username>-leetcode` on GitHub

---

### 5. Start Solving!

Navigate to any LeetCode problem, write your solution, and submit. When your submission is marked **Accepted**, the extension automatically:
- Creates the file in the correct difficulty folder
- Commits it with a descriptive message
- Updates the repository README with your latest stats

---

## 📁 How Your Solutions Are Organized

Your GitHub repository will look like this:

```
<username>-leetcode/
├── Easy/
│   └── 0001-two-sum/
│       └── solution.py
├── Medium/
│   ├── 0003-longest-substring-without-repeating-characters/
│   │   └── solution.ts
│   └── 0049-group-anagrams/
│       └── solution.java
├── Hard/
│   └── 0004-median-of-two-sorted-arrays/
│       └── solution.cpp
└── README.md          ← auto-updated stats table
```

**Commit messages** follow the format:
```
Add: 0001. Two Sum (Easy) [Python]
Update: 0003. Longest Substring Without Repeating Characters (Medium) [TypeScript]
```

---

## ⚙️ Settings

Open the extension and click **Settings** to configure:

| Setting | Options | Default |
|:---|:---|:---|
| **Auto Sync** | On / Off | On |
| **Repository Visibility** | Public / Private | Public |

---

## 🌐 Supported Languages

The extension correctly maps language names to file extensions for:

`Python` · `Java` · `C++` · `C` · `JavaScript` · `TypeScript` · `Go` · `Rust` · `Swift` · `Kotlin` · `Scala` · `Ruby` · `PHP` · `C#` · `Dart` · `Elixir` · `Erlang` · `Haskell` · `Lua` · `Perl` · `R` · `SQL` · `Bash`

---

## 🏗️ Project Structure

```
leetcode-github-autosync/
├── public/
│   ├── manifest.json           # Chrome Extension manifest (V3)
│   └── icons/                  # Extension icons (16, 48, 128, 512px)
├── src/
│   ├── background/
│   │   ├── index.ts            # Service worker — message router
│   │   ├── auth.ts             # GitHub token management
│   │   └── github-api.ts       # GitHub REST API client
│   ├── content/
│   │   ├── index.ts            # Content script — submission detector
│   │   └── injected.ts         # Injected into LeetCode page context
│   ├── popup/
│   │   ├── App.tsx             # Root React component
│   │   ├── main.tsx            # Extension popup entry point
│   │   ├── components/
│   │   │   ├── Header.tsx      # Nav header with logo
│   │   │   ├── GitHubConnect.tsx # Token input & connect flow
│   │   │   ├── StatsCard.tsx   # Solved stats grid
│   │   │   ├── SyncButton.tsx  # Manual sync trigger
│   │   │   └── SyncStatus.tsx  # Recent activity feed
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   # Main view
│   │   │   └── Settings.tsx    # Settings view
│   │   └── styles/
│   │       └── popup.css       # Full design system (tokens, components)
│   ├── types/
│   │   └── index.ts            # Shared TypeScript interfaces
│   └── utils/
│       ├── constants.ts        # API URLs, storage keys, language map
│       ├── helpers.ts          # Formatting, hashing utilities
│       └── storage.ts          # chrome.storage wrappers
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|:---|:---:|:---|
| **React** | 18 | Popup UI |
| **TypeScript** | 5 | Type safety across all modules |
| **Vite** | 5 | Fast build tooling & watch mode |
| **Chrome Extensions API** | MV3 | Service worker, storage, messaging |
| **GitHub REST API** | v3 | File commits, repo creation |
| **Syne + Inter** | — | Display & body typography (Google Fonts) |

---

## 🔐 Privacy & Security

- ✅ Your GitHub token is stored **only** in `chrome.storage.local` on your machine
- ✅ **No data** is sent to any server other than `api.github.com`
- ✅ **No analytics**, telemetry, or third-party tracking of any kind
- ✅ Extension only runs on `https://leetcode.com/problems/*`
- ✅ Minimum required token scope: `repo` (or fine-grained `Contents: Read & Write`)

---

## 🐛 Troubleshooting

| Problem | Fix |
|:---|:---|
| Extension not detecting submission | Refresh the LeetCode problem page after installing the extension |
| "Not authenticated" error | Re-enter your GitHub token in the popup |
| Repo not created | Ensure your token has the `repo` scope |
| Solution not appearing in repo | Check the Activity Feed — it shows the last 8 syncs with status |
| Build errors | Make sure you're on Node.js 18+ with `npm install` run first |

---

## 🤝 Contributing

Contributions are welcome! To get started:

```bash
# Fork and clone the repo
git clone https://github.com/rishabh26raj/leetcode-github-autosync.git
cd leetcode-github-autosync
npm install

# Make changes, then build & test
npm run dev   # Watch mode — auto-rebuilds on save
```

Please open an issue before submitting a large PR so we can discuss the approach.

---

## 📜 License

[MIT](LICENSE) — free to use, modify, and distribute.

---

<div align="center">

Made with ❤️ by [rishabh26raj](https://github.com/rishabh26raj)

⭐ **Star this repo** if it saves you time!

</div>
