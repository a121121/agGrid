-- kits table to store the main kit information
CREATE TABLE kits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_number TEXT NOT NULL,
    noun TEXT NOT NULL,
    kit_name TEXT NOT NULL,
    state_status TEXT NOT NULL,
    current_status TEXT,
    remarks TEXT,
    manufacturer TEXT NOT NULL,
    form48_number TEXT,
    user_id INTEGER,
    die_required BOOLEAN NOT NULL,
    die_number TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP DEFAULT '9999-12-31 23:59:59',
    FOREIGN KEY (user_id) REFERENCES users(id)
);
-- Create history table (must come before the trigger)
CREATE TABLE kit_history (
    id INTEGER,
    part_number TEXT NOT NULL,
    noun TEXT NOT NULL,
    kit_name TEXT NOT NULL,
    state_status TEXT NOT NULL,
    current_status TEXT,
    remarks TEXT,
    manufacturer TEXT NOT NULL,
    form48_number TEXT,
    user_id INTEGER,
    die_required BOOLEAN NOT NULL,
    die_number TEXT,
    version INTEGER NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
-- users table for basic user management
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- change_logs table to track changes to kit records
CREATE TABLE change_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kit_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL,
    FOREIGN KEY (kit_id) REFERENCES kits(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
-- change_details table to store individual field changes
CREATE TABLE change_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_log_id INTEGER NOT NULL,
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    FOREIGN KEY (change_log_id) REFERENCES change_logs(id)
);
-- Create indexes for better performance
CREATE INDEX idx_kits_part_number ON kits(part_number);
CREATE INDEX idx_kits_kit_name ON kits(kit_name);
CREATE INDEX idx_kits_state_status ON kits(state_status);
CREATE INDEX idx_change_logs_kit_id ON change_logs(kit_id);
CREATE INDEX idx_change_logs_changed_at ON change_logs(changed_at);
CREATE INDEX idx_change_details_change_log_id ON change_details(change_log_id);
CREATE INDEX idx_kits_created_at ON kits(created_at);
CREATE INDEX idx_change_logs_kit_date ON change_logs(kit_id, changed_at);
CREATE INDEX idx_change_logs_kit_version ON change_logs(kit_id, version DESC);
-- Complete trigger definition
CREATE TRIGGER kit_history_update BEFORE
UPDATE ON kits BEGIN
INSERT INTO kit_history (
        id,
        part_number,
        noun,
        kit_name,
        state_status,
        current_status,
        remarks,
        manufacturer,
        form48_number,
        user_id,
        die_required,
        die_number,
        version,
        created_at,
        updated_at,
        valid_from,
        valid_until
    )
VALUES (
        OLD.id,
        OLD.part_number,
        OLD.noun,
        OLD.kit_name,
        OLD.state_status,
        OLD.current_status,
        OLD.remarks,
        OLD.manufacturer,
        OLD.form48_number,
        OLD.user_id,
        OLD.die_required,
        OLD.die_number,
        OLD.version,
        OLD.created_at,
        OLD.updated_at,
        OLD.created_at,
        CURRENT_TIMESTAMP
    );
END;