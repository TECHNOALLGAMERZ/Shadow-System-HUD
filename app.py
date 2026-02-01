from flask import Flask, render_template, jsonify, session

app = Flask(__name__)
app.secret_key = "monarch_system_reset_key"

@app.route('/')
def index():
    # Resetting to Level 1 on every refresh
    session['system_data'] = {
        "level": 1,
        "xp": 0,
        "xp_to_next": 100,
        "rank": "E-Rank Hunter",
        "stats": {"STR": 10, "AGI": 10, "INT": 10}
    }
    return render_template('index.html')

@app.route('/gain-xp', methods=['POST'])
def gain_xp():
    data = session.get('system_data')
    data["xp"] += 50
    leveled_up = False
    
    if data["xp"] >= data["xp_to_next"]:
        data["level"] += 1
        data["xp"] = 0
        data["xp_to_next"] = int(data["xp_to_next"] * 1.5)
        leveled_up = True
        for stat in data["stats"]:
            data["stats"][stat] += 5
        
        if data["level"] >= 5: data["rank"] = "S-Rank Hunter"
        if data["level"] >= 10: data["rank"] = "Shadow Monarch"
            
    session['system_data'] = data 
    return jsonify({"stats": data, "leveled_up": leveled_up})

if __name__ == '__main__':
    app.run(debug=True, port=8080)
