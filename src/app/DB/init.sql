CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
