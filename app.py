import csv, random
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# === Load data ===
def load_data():
    data = []
    with open('data/crimes.csv', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row['latitude'] = float(row['latitude'])
            row['longitude'] = float(row['longitude'])
            row['severity'] = int(row['severity'])
            data.append(row)
    return data


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/incidents')
def incidents():
    return jsonify(load_data())


# === Local Chatbot Logic ===
conversation_memory = []

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    message = data.get('message', '').lower().strip()
    patrol_trigger = False

    # store message in memory
    conversation_memory.append({"user": message})

    if "crime" in message or "danger" in message:
        response = "Scanning live data... high activity near MG Road and Indiranagar!"
        patrol_trigger = True

    elif "patrol" in message or "plan" in message:
        response = "Deploying predictive patrol units to major hotspots."
        patrol_trigger = True

    elif "safe" in message:
        response = "Whitefield and HSR Layout currently show low risk. Safe zones confirmed."

    elif "summary" in message:
        # collect last few user queries safely
        recent = [
            m.get("user", "")
            for m in conversation_memory[-5:]
            if "user" in m
        ]
        if recent:
            response = f"Summary of last commands: {', '.join(recent)}."
        else:
            response = "No previous interactions yet."

    else:
        response = "Monitoring... no unusual incidents detected."

    conversation_memory.append({"bot": response})
    return jsonify({"reply": response, "patrol": patrol_trigger})



# === Live update simulation ===
@app.route('/api/live_updates')
def live_updates():
    areas = [
        ("Indiranagar", 12.9790, 77.6400),
        ("Koramangala", 12.9350, 77.6140),
        ("Whitefield", 12.9719, 77.7500),
        ("HSR Layout", 12.9121, 77.6412),
        ("Bellandur", 12.9346, 77.6871),
        ("Jayanagar", 12.9259, 77.5937),
        ("Majestic", 12.9775, 77.5713),
        ("Basavanagudi", 12.9424, 77.5731),
        ("Malleswaram", 13.0044, 77.5690),
        ("Vijayanagar", 12.9739, 77.5309),
    ]
    types = ["Theft", "Assault", "Burglary", "Robbery", "Vandalism"]
    new_incidents = []

    for _ in range(random.randint(2, 5)):
        area, lat, lon = random.choice(areas)
        new_incidents.append({
            "area": area,
            "latitude": lat + random.uniform(-0.004, 0.004),
            "longitude": lon + random.uniform(-0.004, 0.004),
            "type": random.choice(types),
            "severity": random.randint(2, 5)
        })
    return jsonify(new_incidents)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
