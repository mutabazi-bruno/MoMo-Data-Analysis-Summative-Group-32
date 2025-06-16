from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)

CORS(app)  

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DB_PATH = os.path.join(BASE_DIR, "mobilemoney.db")

def get_all_transactions():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM transactions ORDER BY datetime DESC")
    rows = cur.fetchall()
    conn.close()

    transactions = []

    for row in rows:
        transactions.append({
            'id': row['id'],
            'transaction_type': row['tx_type'],  
            'amount': row['amount'],
            'transaction_id': row['tx_id'],      
            'date': row['datetime'],             
            'party': extract_party_from_body(row['body']),  
            'body': row['body']
        })
    
    return transactions

def extract_party_from_body(message):

    """extract party/recipient information from message body"""

    if not message:
        return "Unknown"
    
    message_lower = message.lower()
    
    if "from" in message_lower:
        
        import re

        match = re.search(r'from\s+(.+?)(?:\s+on|\s+at|\s*\.|\s*$)', message, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    elif "to" in message_lower:
    
        import re

        match = re.search(r'to\s+(.+?)(?:\s+on|\s+at|\s*\.|\s*$)', message, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    elif "agent" in message_lower:
        
        import re
        match = re.search(r'agent\s+(.+?)(?:\s+on|\s+at|\s*\.|\s*$)', message, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return "Agent"
    
    if "airtime" in message_lower:
        return "Airtime Purchase"
    elif "bundle" in message_lower:
        return "Data Bundle"
    elif "bank" in message_lower:
        return "Bank"
    
    return "System"

@app.route("/api/transactions", methods=["GET"])
def transactions():
    try:
        data = get_all_transactions()
        print(f"✅ API returning {len(data)} transactions")
        return jsonify(data)
    except Exception as e:
        print(f"❌ API Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/test", methods=["GET"])
def test():
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM transactions")
        count = cur.fetchone()[0]
        conn.close()
        return jsonify({
            "database_exists": True,
            "transaction_count": count,
            "database_path": DB_PATH
        })
    except Exception as e:
        return jsonify({
            "database_exists": False,
            "error": str(e),
            "database_path": DB_PATH
        })

if __name__ == "__main__":
    app.run(debug=True, port=5000)