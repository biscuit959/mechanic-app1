CREATE TABLE Garage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    USERNAME TEXT UNIQUE NOT NULL,
    NAME TEXT NOT NULL,
    ROLE TEXT NOT NULL,
    PASSWORD TEXT NOT NULL
);

CREATE TABLE Jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mechanic_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    reg_plate TEXT,
    owner TEXT,
    job_description TEXT,
    comments TEXT,
    parts TEXT,
    price REAL,
    FOREIGN KEY (mechanic_id) REFERENCES Garage(id)
);

INSERT INTO Garage (USERNAME, NAME, ROLE, PASSWORD) 
VALUES ('Ethnic', 'Ethnic', 'admin', 'admin123');Tables

INSERT INTO Garage (USERNAME, NAME, ROLE, PASSWORD) 
VALUES ('mechanic1', 'Aurel', 'mechanic', 'password123');

INSERT INTO Garage (USERNAME, NAME, ROLE, PASSWORD) 
VALUES ('mechanic2', 'Andrei', 'mechanic', 'password456');

INSERT INTO Garage (USERNAME, NAME, ROLE, PASSWORD) 
VALUES ('mechanic3', 'Dani', 'mechanic', 'password789');

INSERT INTO Garage (USERNAME, NAME, ROLE, PASSWORD) 
VALUES ('mechanic4', 'Mihai', 'mechanic', 'password321');

SELECT id, username, name, role FROM Garage WHERE username = 'Ethnic' AND password = 'admin123';

SELECT * FROM Jobs;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./garage.db');

db.run("INSERT INTO Garage (USERNAME, PASSWORD, NAME, ROLE) VALUES ('admin', 'admin123', 'Admin User', 'admin')");
db.run("INSERT INTO Garage (USERNAME, PASSWORD, NAME, ROLE) VALUES ('ethnic', 'admin123', 'Ethnic', 'admin')");
db.run("INSERT INTO Garage (USERNAME, PASSWORD, NAME, ROLE) VALUES ('mechanic1', 'mech123', 'Mike', 'mechanic')");
db.run("INSERT INTO Garage (USERNAME, PASSWORD, NAME, ROLE) VALUES ('mechanic2', 'mech123', 'Sarah', 'mechanic')");
db.run("INSERT INTO Garage (USERNAME, PASSWORD, NAME, ROLE) VALUES ('mechanic3', 'mech123', 'John', 'mechanic')");

db.close();
