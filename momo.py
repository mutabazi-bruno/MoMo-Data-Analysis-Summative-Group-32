import xml.etree.ElementTree as ET
import re
from datetime import datetime

#categorize sms into types
def categorize_of_message(message):
    msg = message.lower()  

    if "You have received" in msg and "from" in msg:

        return "Incoming Money"
    
    elif "Your payment of" in msg and "to" in msg:

        return "Payments to Code Holders"
    
    elif "Withdrawn" in msg and "agent" in msg:

        return "Withdrawals from Agents"
    
    elif "Bank deposit" in msg:

        return "Bank Deposits"
    
    elif "Airtime" in msg:

        return "Airtime Bill Payments"
    
    elif "Cash power" in msg:

        return "Cash Power Bill Payments"
    
    elif "Purchased an internet bundle" in msg or "voice bundle" in msg:

        return "Internet and Voice Bundle Purchases"
    
    elif "Third party" in msg:

        return "Transactions by Third Parties"
    
    elif "Bank transfer" in msg:

        return "Bank Transfers"
    
    elif "Transfer to" in msg or "sent to" in msg:

        return "Transfers to Mobile Numbers"
    
    else:

        return "Uncategorized"

# exctractions
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

# xml file  for parsing
tree = ET.parse('modified_sms_v2.xml')
root = tree.getroot()

# adding a logging file 
log_file = open("unprocessing_messages.log", "w", encoding="utf-8")

# Process and clean each SMS
for sms in root.findall('sms'):
    message = sms.attrib.get('body')

    category = categorize_of_message(message)
    amount = amount_extracted(message)
    date = date_extracted(message)
    tx_id = extract_id_transaction(message)

    if category == "Uncategorized":
        log_file.write(f"Unprocessed Message: {message}\n")
        log_file.write("-" * 60 + "\n")
        continue 

    # Processed output 
    print(f"Type: {category}")
    print(f"Amount: {amount}")
    print(f"Date: {date}")
    print(f"Transaction ID: {tx_id}")
    print(f"Message: {message}")
    print("-" * 60)

# log file closed
log_file.close()
