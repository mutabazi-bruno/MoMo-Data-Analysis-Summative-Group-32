import xml.etree.ElementTree as ET
import re
from datetime import datetime
import sqlite3
import os

# this code make sure the db file and logs stays in this forder i dont know why it was saving them out of the forder


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

#  message

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

# extract amount


def amount_extracted(message):
    match = re.search(r'([\d,]+)\s*RWF', message)
    if match:
        return int(match.group(1).replace(',', ''))
    return None

# Extact date

def date_extracted(message):
    match = re.search(r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', message)
    if match:
        try:
            return datetime.strptime(match.group(1), '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%d %H:%M:%S')
        except ValueError:
            return None
    return None

# extract transaction ID-


def extract_id_transaction(message):
    match = re.search(r'TxId[:\-]?\s*(\d+)', message, re.IGNORECASE)
    if match:
        return match.group(1)
    return None

# Create DB and table if not exists we have database_startup.py which also create database manual but we had to add this to make this codes complete 

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
            body TEXT
        )
    """)
    conn.commit()
    conn.close()

# Insert a valid transaction into the DB

def insert_transaction(tx_type, amount, tx_id, date, message):
    db_path = os.path.join(BASE_DIR, "mobilemoney.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO transactions (tx_type, amount, tx_id, datetime, body)
        VALUES (?, ?, ?, ?, ?)
    """, (tx_type, amount, tx_id, date, message))
    conn.commit()
    conn.close()

def process_sms(xml_filename):
    xml_path = os.path.join(BASE_DIR, xml_filename)
    tree = ET.parse(xml_path)
    root = tree.getroot()

    log_path = os.path.join(BASE_DIR, "unprocessing_messages.log")
    log_file = open(log_path, "w", encoding="utf-8")

    print(" Total messages found:", len(root.findall("sms")))

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
            continue

        insert_transaction(category, amount, tx_id, date, message)

        print(f" Saved: {category} | {amount} RWF | {date}")

    log_file.close()
    print(" Done parsing and saving messages.")

# Entry point (I had to copy path even though , modifield sms and momo.py are in same forder)

if __name__ == "__main__":
    create_db()
    process_sms("D:\HTML LG\MOMO\MoMo-Data-Analysis-Summative-Group-32\modified_sms_v2.xml")
