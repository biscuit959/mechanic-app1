CREATE TABLE IF NOT EXISTS Garage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    USERNAME TEXT UNIQUE NOT NULL,
    NAME TEXT NOT NULL,
    ROLE TEXT NOT NULL,
    PASSWORD TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Jobs (
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

DELETE FROM Garage;

INSERT INTO Garage (USERNAME, NAME, ROLE, PASSWORD) 
VALUES ('Ethnic', 'Ethnic', 'admin', 'Et3654Da5');

INSERT INTO Garage (USERNAME, NAME, ROLE, PASSWORD) 
VALUES ('mechanic1', 'Aurel', 'mechanic', 'Au545GD');

INSERT INTO Garage (USERNAME, NAME, ROLE, PASSWORD) 
VALUES ('mechanic2', 'Andrei', 'mechanic', 'An456GD');

INSERT INTO Garage (USERNAME, NAME, ROLE, PASSWORD) 
VALUES ('mechanic3', 'Dani', 'mechanic', 'Da789GD');

INSERT INTO Garage (USERNAME, NAME, ROLE, PASSWORD) 
VALUES ('mechanic4', 'Mihai', 'mechanic', 'Mi321GD');
