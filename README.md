markdown
# MTN Mobile Money Transaction Analytics
*A Full-Stack Financial Data Processing System*  
**Group 32**



## 🚀 Key Features

- Transaction categorization using **regular expressions**
- Interactive dashboard with **Chart.js visualizations**
- SQLite database with **normalized schema**
- Comprehensive error logging


## 💻 Tech Stack
| Component       | Technologies Used                     |
|----------------|---------------------------------------|
| **Backend**    | Python 3, Flask, Pandas, xmltodict    |
| **Frontend**   | HTML5, CSS3, JavaScript     |
| **Database**   | SQLite3 with foreign key constraints  |
| **DevOps**     | Git, GitHub                           |


## ⚙️ Installation

# Clone repository
git clone https://github.com/mutabazi-bruno/MoMo-Data-Analysis-Summative-Group-32.git
cd MoMo-Data-Analysis-Summative-Group-32


# Install dependencies
pip install -r backend/requirements.txt
🏃‍♂️ Running the System
1. Start Flask API Server
bash:
install python if you don't have it download it from python.org 
install Flask : pip install flask if you don't have it 
run momo.py file
run api.py 
then use liveserver to see it in the browser or copy the path for index.html file then paste it in the browser

API Endpoints:


GET /transactions - List all transactions


GET /transactions?type=<type> - Filter by transaction type


GET /transactions?start_date=<date>&end_date=<date> - Date range filter


db/transactions.db (SQLite database)


output/errors.log (malformed entries)





🗃 Database Schema


sql
CREATE TABLE transaction_types (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);


CREATE TABLE transactions (
    id INTEGER PRIMARY KEY,
    type_id INTEGER REFERENCES transaction_types(id),
    amount DECIMAL(10,2) NOT NULL,
    date DATETIME NOT NULL,
    sender TEXT,
    recipient TEXT
);
📊 Frontend Features
Transaction Explorer


Filter by type, date range, amount


Sort by any column


Visual Analytics


Pie chart: Transaction type distribution


Bar chart: Monthly transaction volume


Responsive Design


Works on mobile/desktop



    """
Error Handling
Malformed SMS messages are logged to errors.log with:
Original message text
Timestamp of failure
Specific parsing error


👥 Team Contributions
Name    Role    Key Contributions
Heroine  Backend Engineer    Flask API, data processing
Bruno&Anitha    Frontend Developer  Dashboard UI, Chart.js integration
Maxime Database Architect  Schema design, query optimization
📽️ Video Walkthrough
https://www.loom.com/share/7632c4d81ca648e1a78881b756f7f688?sid=89a12441-9e53-40c7-8ee7-ba3974732503





