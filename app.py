from flask import Flask, render_template, jsonify, session
import os

app = Flask(__name__)
app.secret_key = "monarch_open_system_key"

@app.route('/')
def index():
    # Every visit/refresh starts at Level 1 for the user
    session['system_data'] = {
        "level": 1, "xp": 0, "xp_to_next": 100,
        "rank": "E-Rank Hunter",
        "stats": {"STR": 10, "AGI": 10, "INT": 10}
    }
    return render_template('index.html')

@app.route('/gain-xp', methods=['POST'])
def gain_xp():
    data = session.get('system_data')
    if not data: return jsonify({"error": "No Session"}), 403

    data["xp"] += 50
    leveled_up = False
    if data["xp"] >= data["xp_to_next"]:
        data["level"] += 1
        data["xp"] = 0
        data["xp_to_next"] = int(data["xp_to_next"] * 1.5)
        leveled_up = True
        for stat in data["stats"]: data["stats"][stat] += 5
        
        # Ranking Logic
        if data["level"] >= 5: data["rank"] = "S-Rank Hunter"
        if data["level"] >= 10: data["rank"] = "Shadow Monarch"
            
    session['system_data'] = data 
    return jsonify({"stats": data, "leveled_up": leveled_up})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)
