# 🧠 AI Mood Journal

> A web application that analyzes user journal entries to detect emotional tone and visualize mood patterns over time using Natural Language Processing (NLP).

![Flask](https://img.shields.io/badge/Flask-3.0.0-black?style=flat-square&logo=flask)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat-square&logo=python)
![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey?style=flat-square&logo=sqlite)
![TextBlob](https://img.shields.io/badge/TextBlob-NLP-green?style=flat-square)

---

## ✨ Features

- **📝 Smart Journal Entries** — Write your thoughts and get instant emotional analysis
- **🤖 AI-Powered Mood Detection** — Uses TextBlob NLP library for sentiment analysis (polarity & subjectivity)
- **📊 Real-time Analytics Dashboard** — Visualize mood distribution and weekly trends with interactive charts
- **🎨 Color-Coded UI** — Each mood gets a distinct visual identity (Green=Positive, Red=Negative, Gray=Neutral)
- **🌙 Dark/Light Mode** — Toggle between themes with persistent preference storage
- **📱 Responsive Design** — Works seamlessly on desktop, tablet, and mobile devices
- **💾 Persistent Storage** — SQLite database keeps all entries safe
- **🔍 Mood Filtering** — Filter entries by positive, neutral, or negative moods

---

## 🏗️ Architecture
```
Text Input → TextBlob NLP Analysis → Sentiment Classification → SQLite Storage → Visual Dashboard
```
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JS | UI/UX, Charts, Interactivity |
| **Backend** | Flask (Python) | API, Business Logic |
| **Database** | SQLite | Data Persistence |
| **NLP Engine** | TextBlob | Sentiment Analysis |
| **Charts** | Chart.js | Data Visualization |
---
## 🚀 Quick Start
### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-mood-journal.git
   cd ai-mood-journal
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

---

## 📖 How It Works

### Mood Detection Algorithm

The app uses **TextBlob** to analyze sentiment:

| Metric | Range | Description |
|--------|-------|-------------|
| **Polarity** | -1.0 to +1.0 | Negative ← → Positive |
| **Subjectivity** | 0.0 to 1.0 | Objective ← → Subjective |

**Classification Logic:**
```python
if polarity > 0.1:   → "positive"
elif polarity < -0.1: → "negative"
else:                 → "neutral"
```

### Example Analysis

| Journal Entry | Polarity | Subjectivity | Mood |
|--------------|----------|--------------|------|
| "I had an amazing day at work!" | +0.8 | 0.75 | 😊 Positive |
| "The weather is okay today." | +0.1 | 0.2 | 😐 Neutral |
| "I'm feeling really stressed about the deadline." | -0.6 | 0.9 | 😔 Negative |

---

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Main application page |
| `GET` | `/api/entries` | Retrieve all journal entries |
| `POST` | `/api/entries` | Create new journal entry |
| `DELETE` | `/api/entries/<id>` | Delete a journal entry |
| `GET` | `/api/stats` | Get mood statistics |
| `GET` | `/api/trends` | Get daily mood trends |

### Example API Usage

```bash
# Create a new entry
curl -X POST http://localhost:5000/api/entries \
  -H "Content-Type: application/json" \
  -d '{"text": "Today was a wonderful day!"}'

# Response
{
  "id": 1,
  "text": "Today was a wonderful day!",
  "mood": "positive",
  "polarity": 0.625,
  "subjectivity": 0.6,
  "timestamp": "2024-01-15 14:30"
}
```

---

## 🎨 UI Preview

### Dashboard Features

- **Mood Distribution Chart** — Doughnut chart showing emotional balance
- **Weekly Trends** — Line chart tracking sentiment over time
- **Live Stats Cards** — Animated counters for each mood category
- **Journal Timeline** — Chronological list with color-coded entries

### Design System

| Element | Style |
|---------|-------|
| Cards | Glassmorphism with backdrop blur |
| Colors | Gradient accents (Purple, Pink, Blue) |
| Typography | Inter font family |
| Animations | Smooth transitions, fade-in effects |
| Icons | Emoji-based mood indicators |

---

## 🔮 Future Enhancements

- [ ] **User Authentication** — Multi-user support with personal journals
- [ ] **Advanced Analytics** — Weekly/monthly mood reports
- [ ] **Real AI Integration** — Upgrade to transformer-based models (BERT, GPT)
- [ ] **Voice Journaling** — Speech-to-text input
- [ ] **Export Data** — PDF/CSV report generation
- [ ] **Reminders** — Daily journaling notifications
- [ ] **Cloud Deployment** — Docker + AWS/Heroku setup

---

## 🛠️ Tech Stack Deep Dive

### Why TextBlob?

TextBlob is chosen for its simplicity and effectiveness:
- **Pattern-based sentiment analysis** — Fast and lightweight
- **No API keys required** — Works offline
- **Easy to upgrade** — Can be replaced with more advanced models

### Why Flask?

- **Lightweight** — Minimal boilerplate
- **Flexible** — Easy to extend with blueprints
- **Python ecosystem** — Seamless integration with ML libraries

### Why Chart.js?

- **Interactive** — Hover effects, tooltips
- **Responsive** — Auto-scales to container
- **Lightweight** — No heavy dependencies

---

## 📊 Project Structure

```
ai-mood-journal/
├── app.py                 # Flask application & API routes
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── templates/
│   └── index.html        # Main UI template
└── static/
    ├── css/
    │   └── style.css     # Styling & themes
    └── js/
        └── app.js        # Frontend logic & charts
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [TextBlob](https://textblob.readthedocs.io/) for NLP capabilities
- [Chart.js](https://www.chartjs.org/) for beautiful visualizations
- [Flask](https://flask.palletsprojects.com/) for the web framework

---

## 📬 Contact

Have questions or suggestions? Feel free to reach out!

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

> **Built with 💜 and a lot of ☕**

*"Understanding your emotions is the first step toward mastering them."*

