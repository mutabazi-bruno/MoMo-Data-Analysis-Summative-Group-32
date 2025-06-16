import xml.etree.ElementTree as ET
import re
from datetime import datetime
import sqlite3
import os
import hashlib


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# cmessage

def categorize_of_message(message):
    msg = message.lower()

    if "you have received" in msg and "from" in msg:
        return "Incoming Money"
    elif "your payment of" in msg and "to" in msg:
        return "Payments to Code Holders"
    elif "withdrawn" in msg and "agent" in msg:
        return "Withdrawals from Agents"
    elif "bank deposit" in msg:
        return "Bank Deposits"
    elif "airtime" in msg:
        return "Airtime Bill Payments"
    elif "cash power" in msg:
        return "Cash Power Bill Payments"
    elif "purchased an internet bundle" in msg or "voice bundle" in msg:
        return "Internet and Voice Bundle Purchases"
    elif "third party" in msg:
        return "Transactions by Third Parties"
    elif "bank transfer" in msg:
        return "Bank Transfers"
    elif "transfer to" in msg or "sent to" in msg:
        return "Transfers to Mobile Numbers"
    else:
        return "Uncategorized"



def amount_extracted(message):
    match = re.search(r'([\d,]+)\s*RWF', message)
    if match:
        return int(match.group(1).replace(',', ''))
    return None



def date_extracted(message):
    match = re.search(r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', message)
    if match:
        try:
            return datetime.strptime(match.group(1), '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%d %H:%M:%S')
        except ValueError:
            return None
    return None


def extract_id_transaction(message):
    match = re.search(r'TxId[:\-]?\s*(\d+)', message, re.IGNORECASE)
    if match:
        return match.group(1)
    return None


def generate_message_hash(message):
    """Generate a unique hash for the message content"""
    return hashlib.md5(message.encode('utf-8')).hexdigest()

# Create DB and table if is not exists (database_startup.py also create database we created it before knowing this function that why we kept for easy understanding )

def create_db():
    db_path = os.path.join(BASE_DIR, "mobilemoney.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tx_type TEXT,
            amount INTEGER,
            tx_id TEXT,
            datetime TEXT,
            body TEXT,
            message_hash TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_message_hash ON transactions(message_hash)
    """)
    

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_tx_id ON transactions(tx_id)
    """)
    
    conn.commit()
    conn.close()


def transaction_exists(message, tx_id=None, amount=None, date=None):
    """Check if transaction already exists using multiple criteria"""
    db_path = os.path.join(BASE_DIR, "mobilemoney.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    

    message_hash = generate_message_hash(message)
    cursor.execute("SELECT id FROM transactions WHERE message_hash = ?", (message_hash,))
    if cursor.fetchone():
        conn.close()
        return True, "duplicate_hash"
    

    if tx_id:
        cursor.execute("SELECT id FROM transactions WHERE tx_id = ?", (tx_id,))
        if cursor.fetchone():
            conn.close()
            return True, "duplicate_tx_id"
    

    if amount and date:
        cursor.execute("""
            SELECT id FROM transactions 
            WHERE amount = ? AND datetime = ? AND body = ?
        """, (amount, date, message))
        if cursor.fetchone():
            conn.close()
            return True, "duplicate_combination"
    
    conn.close()
    return False, None

#  duplicate prevention

def insert_transaction(tx_type, amount, tx_id, date, message):
    """Insert transaction only if it doesn't already exist"""
    
    # check if transaction already exists


    exists, reason = transaction_exists(message, tx_id, amount, date)
    if exists:
        return False, reason
    
    db_path = os.path.join(BASE_DIR, "mobilemoney.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    message_hash = generate_message_hash(message)
    
    try:
        cursor.execute("""
            INSERT INTO transactions (tx_type, amount, tx_id, datetime, body, message_hash)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (tx_type, amount, tx_id, date, message, message_hash))
        conn.commit()
        conn.close()
        return True, "inserted"
    except sqlite3.IntegrityError as e:
        conn.close()
        return False, f"integrity_error: {str(e)}"

def process_sms(xml_filename):
    xml_path = os.path.join(BASE_DIR, xml_filename)
    tree = ET.parse(xml_path)
    root = tree.getroot()

    log_path = os.path.join(BASE_DIR, "unprocessing_messages.log")
    duplicate_log_path = os.path.join(BASE_DIR, "duplicate_messages.log")
    
    log_file = open(log_path, "w", encoding="utf-8")
    duplicate_log_file = open(duplicate_log_path, "w", encoding="utf-8")

    total_messages = len(root.findall("sms"))
    processed_count = 0
    duplicate_count = 0
    unprocessed_count = 0
    
    print(f"Total messages found: {total_messages}")

    for sms in root.findall('sms'):
        message = sms.attrib.get('body')
        if not message:
            continue

        category = categorize_of_message(message)
        amount = amount_extracted(message)
        date = date_extracted(message)
        tx_id = extract_id_transaction(message)

        if category == "Uncategorized" or not amount or not date:
            log_file.write(f"Unprocessed Message: {message}\n")
            log_file.write("-" * 60 + "\n")
            unprocessed_count += 1
            continue

        # Try to insert the transaction


        success, reason = insert_transaction(category, amount, tx_id, date, message)
        
        if success:
            processed_count += 1
            print(f"✓ Saved: {category} | {amount} RWF | {date}")
        else:
            duplicate_count += 1
            duplicate_log_file.write(f"Duplicate ({reason}): {message}\n")
            duplicate_log_file.write("-" * 60 + "\n")
            print(f"⚠ Skipped duplicate: {category} | {amount} RWF | {date}")

    log_file.close()
    duplicate_log_file.close()
    
    print("\n" + "="*50)
    print("PROCESSING SUMMARY:")
    print(f"Total messages: {total_messages}")
    print(f"Successfully processed: {processed_count}")
    print(f"Duplicates skipped: {duplicate_count}")
    print(f"Unprocessed (invalid): {unprocessed_count}")
    print("="*50)



def clear_all_transactions():
    """Clear all transactions from database - USE WITH CAUTION!"""
    response = input("Are you sure you want to delete ALL transactions? (type 'YES' to confirm): ")
    if response == "YES":
        db_path = os.path.join(BASE_DIR, "mobilemoney.db")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM transactions")
        conn.commit()
        conn.close()
        print("All transactions deleted!")
    else:
        print("Operation cancelled.")


def get_transaction_stats():
    """Get statistics about transactions in database"""
    db_path = os.path.join(BASE_DIR, "mobilemoney.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM transactions")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT tx_type, COUNT(*) FROM transactions GROUP BY tx_type")
    by_type = cursor.fetchall()
    
    cursor.execute("SELECT SUM(amount) FROM transactions WHERE tx_type LIKE '%Incoming%'")
    total_incoming = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT SUM(amount) FROM transactions WHERE tx_type NOT LIKE '%Incoming%'")
    total_outgoing = cursor.fetchone()[0] or 0
    
    conn.close()
    
    print(f"\nDATABASE STATISTICS:")
    print(f"Total transactions: {total}")
    print(f"Total incoming: {total_incoming:,} RWF")
    print(f"Total outgoing: {total_outgoing:,} RWF")
    print(f"Net balance: {total_incoming - total_outgoing:,} RWF")
    print("\nBy category:")
    for tx_type, count in by_type:
        print(f"  {tx_type}: {count}")

# Entry point aand some  options

if __name__ == "__main__":
    import sys
    
    create_db()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "clear":
            clear_all_transactions()
        elif sys.argv[1] == "stats":
            get_transaction_stats()
        else:
            print("Unknown command. Available commands: clear, stats")
    else:
        process_sms("modified_sms_v2.xml")
        get_transaction_stats()