from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from textblob import TextBlob
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mood_journal.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ============= DATABASE MODEL =============
class JournalEntry(db.Model):
    """Database model for journal entries with sentiment analysis data."""
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    mood = db.Column(db.String(20), nullable=False)
    polarity = db.Column(db.Float, nullable=False)
    subjectivity = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    def to_dict(self):
        """Convert entry to JSON-serializable dictionary."""
        return {
            'id': self.id,
            'text': self.text,
            'mood': self.mood,
            'polarity': round(self.polarity, 3),
            'subjectivity': round(self.subjectivity, 3),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'date': self.created_at.strftime('%Y-%m-%d'),
            'time': self.created_at.strftime('%H:%M')
        }

# ============= NLP SENTIMENT ANALYSIS =============
def detect_mood(text):
    """
    Analyze text sentiment using TextBlob NLP.
    Returns: (mood: str, polarity: float, subjectivity: float)
    - Polarity: -1 (negative) to +1 (positive)
    - Subjectivity: 0 (objective) to 1 (subjective)
    - Mood: 'positive' (>0.1), 'negative' (<-0.1), or 'neutral'
    """
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity

    if polarity > 0.1:
        mood = 'positive'
    elif polarity < -0.1:
        mood = 'negative'
    else:
        mood = 'neutral'

    return mood, polarity, subjectivity

# ============= ROUTES =============
@app.route('/')
def index():
    """Serve main application page."""
    return render_template('index.html')

# ============= API ENDPOINTS =============
@app.route('/api/entries', methods=['GET'])
def get_entries():
    """
    GET /api/entries
    Retrieve all entries sorted by date (newest first).
    Optional query parameter: mood (filter by mood type)
    """
    try:
        mood_filter = request.args.get('mood')

        if mood_filter:
            entries = JournalEntry.query.filter_by(mood=mood_filter)\
                .order_by(JournalEntry.created_at.desc()).all()
        else:
            entries = JournalEntry.query.order_by(JournalEntry.created_at.desc()).all()

        return jsonify({
            'success': True,
            'count': len(entries),
            'entries': [entry.to_dict() for entry in entries]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/entries', methods=['POST'])
def create_entry():
    """
    POST /api/entries
    Create a new journal entry with NLP sentiment analysis.
    Body: { "text": "journal entry text" }
    """
    try:
        data = request.get_json()
        text = data.get('text', '').strip() if data else ''

        # Validate input
        if not text:
            return jsonify({'success': False, 'error': 'Entry text cannot be empty'}), 400

        if len(text) > 5000:
            return jsonify({'success': False, 'error': 'Entry text too long (max 5000 characters)'}), 400

        # Perform sentiment analysis
        mood, polarity, subjectivity = detect_mood(text)

        # Create and save entry
        entry = JournalEntry(
            text=text,
            mood=mood,
            polarity=polarity,
            subjectivity=subjectivity
        )
        db.session.add(entry)
        db.session.commit()

        return jsonify({
            'success': True,
            'entry': entry.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/entries/<int:entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    """
    DELETE /api/entries/<id>
    Delete a journal entry by ID.
    """
    try:
        entry = JournalEntry.query.get(entry_id)

        if not entry:
            return jsonify({'success': False, 'error': 'Entry not found'}), 404

        db.session.delete(entry)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Entry deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """
    GET /api/stats
    Retrieve mood statistics: count of positive, negative, neutral entries.
    """
    try:
        total = JournalEntry.query.count()
        positive = JournalEntry.query.filter_by(mood='positive').count()
        negative = JournalEntry.query.filter_by(mood='negative').count()
        neutral = JournalEntry.query.filter_by(mood='neutral').count()

        avg_polarity = 0
        avg_subjectivity = 0

        if total > 0:
            from sqlalchemy import func
            stats = db.session.query(
                func.avg(JournalEntry.polarity),
                func.avg(JournalEntry.subjectivity)
            ).first()
            avg_polarity = round(stats[0], 3) if stats[0] else 0
            avg_subjectivity = round(stats[1], 3) if stats[1] else 0

        return jsonify({
            'success': True,
            'total': total,
            'positive': positive,
            'negative': negative,
            'neutral': neutral,
            'avg_polarity': avg_polarity,
            'avg_subjectivity': avg_subjectivity
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/trends', methods=['GET'])
def get_trends():
    """
    GET /api/trends
    Retrieve mood trends over the past 30 days for chart visualization.
    Returns daily mood counts grouped by date.
    """
    try:
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        entries = JournalEntry.query.filter(
            JournalEntry.created_at >= thirty_days_ago
        ).order_by(JournalEntry.created_at.asc()).all()

        # Aggregate by date
        trends = {}
        for entry in entries:
            date = entry.created_at.strftime('%Y-%m-%d')
            if date not in trends:
                trends[date] = {'positive': 0, 'negative': 0, 'neutral': 0}
            trends[date][entry.mood] += 1

        return jsonify({
            'success': True,
            'trends': trends
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/export', methods=['GET'])
def export_data():
    """
    GET /api/export
    Export all entries as JSON file for backup/analysis.
    """
    try:
        entries = JournalEntry.query.order_by(JournalEntry.created_at.desc()).all()
        data = {
            'exported_at': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
            'total_entries': len(entries),
            'entries': [entry.to_dict() for entry in entries]
        }

        return jsonify(data), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============= ERROR HANDLERS =============
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Resource not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

# ============= DATABASE INITIALIZATION =============
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)

