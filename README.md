# 🚀 DSA Pattern Tracker

A comprehensive, offline-first React application designed to help you master Data Structures and Algorithms by tracking your progress through common coding patterns (Two Pointers, Sliding Window, DP, etc.).

> **Note:** This application persists all data (progress, stars, notes) to your browser's Local Storage. No backend or account creation is required.

## ✨ Features

- **Pattern-Based Organization**: Questions are grouped by logical patterns (e.g., "Fast & Slow Pointers", "Monotonic Stack") rather than random topics.
- **Progress Tracking**: Visual progress bars for individual patterns, categories, and overall completion.
- **Note Taking**: Add personal notes, time complexities, or trick explanations to any question. Notes are saved automatically.
- **Review System**: Star ⭐ questions to mark them for later revision.
- **Direct LeetCode Integration**: One-click access to the problem on LeetCode.
- **Dark Mode**: Fully supported dark/light theme toggling.
- **Responsive Design**: Works on desktop and mobile.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks + LocalStorage
- **Build Tool**: Vite

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository** (or create the project folder):
   ```bash
   git clone [https://github.com/your-username/dsa-tracker.git](https://github.com/your-username/dsa-tracker.git)
   cd dsa-tracker
   ```
 2. **Install dependencies:**

```bash

npm install
```
3. **Run the development server:**

```Bash

npm run dev
```
4. **Open your browser: Navigate to http://localhost:5173 (or the port shown in your terminal).**

## 📂 Project Structure
```Plaintext

dsa-tracker/
├── src/
│   ├── components/
│   │   ├── CategoryAccordion.jsx  # Collapsible Category container
│   │   ├── PatternSection.jsx     # Sub-group for specific patterns
│   │   ├── QuestionItem.jsx       # Individual question row + Note logic
│   │   └── ProgressBar.jsx        # Visual progress indicator
│   ├── data/
│   │   └── dsaData.js             # The raw question dataset
│   ├── utils/
│   │   └── helpers.js             # Data parsing and ID generation
│   ├── App.jsx                    # Main layout and State Manager
│   └── main.jsx                   # Entry point
└── ...config files
```
## ⚙️ Customization
Adding New Questions
The data is stored in src/data/dsaData.js. To add questions, simply append them to the existing arrays in the following format:

```JavaScript

["Pattern Name", [
    "1. Two Sum", 
    "121. Best Time to Buy and Sell Stock"
]]
```
The app automatically parses the number (ID) and the title to generate the LeetCode link.

**Resetting Data
If you need to clear all progress:

1. Click the Reset button in the top right corner of the app.

2. OR manually clear your browser's Local Storage.

## 🚢 Deployment
Since this is a static Single Page Application (SPA), it can be deployed easily for free on platforms like Vercel or Netlify.

Build for production:

```Bash

npm run build
```
The output will be in the dist/ folder, ready to be hosted.

## 🤝 Contributing
1. Fork the project

2. Create your feature branch (git checkout -b feature/AmazingFeature)

3. Commit your changes (git commit -m 'Add some AmazingFeature')

4. Push to the branch (git push origin feature/AmazingFeature)

5. Open a Pull Request

## 📄 License
Distributed under the MIT License.
