/*
  # Create bin updates table for ESP32 data

  1. New Tables
    - `bin_updates`
      - `id` (uuid, primary key)
      - `bin_id` (integer, the dustbin ID from ESP32)
      - `fill_level` (integer, 0-100 percentage)
      - `battery_level` (integer, 0-100 percentage)
      - `status` (text, normal/warning/critical)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `bin_updates` table
    - Add policy for public read access (for frontend)
    - Add policy for public insert access (for ESP32)

  3. Indexes
    - Index on bin_id for fast queries
    - Index on created_at for time-based queries
*/

CREATE TABLE IF NOT EXISTS bin_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bin_id integer NOT NULL,
  fill_level integer NOT NULL CHECK (fill_level >= 0 AND fill_level <= 100),
  battery_level integer DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
  status text DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical', 'servicing')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE bin_updates ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for frontend to fetch data)
CREATE POLICY "Allow public read access"
  ON bin_updates
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access (for ESP32 to send data)
CREATE POLICY "Allow public insert access"
  ON bin_updates
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bin_updates_bin_id ON bin_updates(bin_id);
CREATE INDEX IF NOT EXISTS idx_bin_updates_created_at ON bin_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bin_updates_bin_id_created_at ON bin_updates(bin_id, created_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bin_updates_updated_at
    BEFORE UPDATE ON bin_updates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();