CREATE TABLE States (
    state_code CHAR(2) PRIMARY KEY,
    state_name VARCHAR(100) UNIQUE NOT NULL
);

-- Master list of skills
CREATE TABLE Skills (
    skill_id  SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL
);
-- Login / role 
CREATE TABLE UserCredentials (
    user_id       SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'volunteer',          -- volunteer | admin
    is_verified   BOOLEAN NOT NULL DEFAULT FALSE                     -- e-mail confirmed?
);

-- Profile & address details
CREATE TABLE UserProfile (
    profile_id  SERIAL PRIMARY KEY,
    user_id     INTEGER UNIQUE NOT NULL
                  REFERENCES UserCredentials(user_id) ON DELETE CASCADE,
    full_name   VARCHAR(50)  NOT NULL,
    address1    VARCHAR(100) NOT NULL,
    address2    VARCHAR(100),
    city        VARCHAR(100) NOT NULL,
    state_code  CHAR(2) NOT NULL
                  REFERENCES States(state_code),
    zip_code    VARCHAR(10) NOT NULL
                  CHECK (char_length(zip_code) BETWEEN 5 AND 9),
    preferences TEXT                                           -- free-form interests
);

-- Many-to-many: users <-> skills
CREATE TABLE UserSkills (
    user_id  INTEGER NOT NULL REFERENCES UserCredentials(user_id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES Skills(skill_id)         ON DELETE CASCADE,
    PRIMARY KEY (user_id, skill_id)
);

-- Multiple available dates per user
CREATE TABLE UserAvailability (
    availability_id SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES UserCredentials(user_id) ON DELETE CASCADE,
    available_date  DATE    NOT NULL,
    UNIQUE (user_id, available_date)
);

-- Events administrators create
CREATE TABLE EventDetails (
    event_id   SERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    description TEXT       NOT NULL,
    location    TEXT       NOT NULL,
    address1 VARCHAR(100),
    address2 VARCHAR(100),
    city VARCHAR(100),
    state_code CHAR(2) NOT NULL
                  REFERENCES States(state_code),
    zip_code VARCHAR(10) NOT NULL
                  CHECK (char_length(zip_code) BETWEEN 5 AND 9),
    urgency     VARCHAR(20) NOT NULL,
    event_date  DATE        NOT NULL,
    CONSTRAINT chk_urgency
      CHECK (urgency IN ('Low','Medium','High'))
);

-- Many-to-many: events <-> required skills
CREATE TABLE EventRequiredSkills (
    event_id INTEGER NOT NULL REFERENCES EventDetails(event_id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES Skills(skill_id)       ON DELETE CASCADE,
    PRIMARY KEY (event_id, skill_id)
);

CREATE TABLE VolunteerHistory (
    history_id  SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES UserCredentials(user_id) ON DELETE CASCADE,
    event_id    INTEGER NOT NULL REFERENCES EventDetails(event_id)   ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL DEFAULT 'Assigned',
    performance_rating SMALLINT CHECK (performance_rating BETWEEN 1 AND 5),
    feedback    TEXT,
    CONSTRAINT chk_status
      CHECK (status IN ('Assigned','Confirmed','Attended','No-Show','Cancelled')),
    UNIQUE (user_id, event_id)
);


CREATE TABLE Notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id   INTEGER NOT NULL REFERENCES UserCredentials(user_id) ON DELETE CASCADE,
    message   TEXT    NOT NULL,
    is_read   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
