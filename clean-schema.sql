-- Clean Supabase Schema for Loveworld Rehearsal Hub Portal
-- This schema is designed to work with your existing app structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== PAGES TABLE =====
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('unassigned', 'pre-rehearsal', 'ongoing', 'archive')),
    bannerimage TEXT,
    isactive BOOLEAN DEFAULT true,
    countdowndays INTEGER DEFAULT 0,
    countdownhours INTEGER DEFAULT 0,
    countdownminutes INTEGER DEFAULT 0,
    countdownseconds INTEGER DEFAULT 0,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== CATEGORIES TABLE =====
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'Music',
    isactive BOOLEAN DEFAULT true,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== SONGS TABLE =====
CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'unheard' CHECK (status IN ('heard', 'unheard')),
    category VARCHAR(100) NOT NULL,
    praisenightid INTEGER REFERENCES pages(id) ON DELETE CASCADE,
    leadsinger VARCHAR(255),
    writer VARCHAR(255),
    conductor VARCHAR(255),
    key VARCHAR(50),
    tempo VARCHAR(50),
    leadkeyboardist VARCHAR(255),
    leadguitarist VARCHAR(255),
    drummer VARCHAR(255),
    lyrics TEXT,
    solfas TEXT,
    audiofile TEXT,
    mediaid INTEGER REFERENCES media(id) ON DELETE SET NULL,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== COMMENTS TABLE =====
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(255) PRIMARY KEY,
    songid INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    date VARCHAR(100) NOT NULL,
    author VARCHAR(255) DEFAULT 'Pastor',
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== SONG HISTORY TABLE =====
CREATE TABLE IF NOT EXISTS song_history (
    id VARCHAR(255) PRIMARY KEY,
    songid INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('lyrics', 'solfas', 'audio', 'comment', 'metadata')),
    content TEXT NOT NULL,
    date VARCHAR(100) NOT NULL,
    version INTEGER NOT NULL,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== MEDIA TABLE =====
CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'audio', 'video', 'document')),
    size BIGINT NOT NULL,
    folder VARCHAR(100),
    publicid TEXT,
    uploadedat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_songs_praisenightid ON songs(praisenightid);
CREATE INDEX IF NOT EXISTS idx_songs_category ON songs(category);
CREATE INDEX IF NOT EXISTS idx_songs_status ON songs(status);
CREATE INDEX IF NOT EXISTS idx_song_history_songid ON song_history(songid);
CREATE INDEX IF NOT EXISTS idx_song_history_type ON song_history(type);
CREATE INDEX IF NOT EXISTS idx_comments_songid ON comments(songid);
CREATE INDEX IF NOT EXISTS idx_pages_category ON pages(category);
CREATE INDEX IF NOT EXISTS idx_pages_isactive ON pages(isactive);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);
CREATE INDEX IF NOT EXISTS idx_media_uploadedat ON media(uploadedat);

-- ===== TRIGGERS =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedat = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== SAMPLE DATA =====

-- Insert sample categories
INSERT INTO categories (name, description, color, icon) VALUES
('New Praise Songs', 'Latest praise songs and worship music', '#3B82F6', 'Music'),
('Classic Hymns', 'Traditional hymns and classic worship songs', '#8B5CF6', 'Heart'),
('Contemporary Worship', 'Modern worship songs and contemporary Christian music', '#10B981', 'Star'),
('Gospel Songs', 'Traditional and contemporary gospel music', '#F59E0B', 'Zap'),
('Special Songs', 'Songs for special occasions and events', '#EF4444', 'Gift')
ON CONFLICT (name) DO NOTHING;

-- Insert sample pages
INSERT INTO pages (id, name, date, location, category, bannerimage, isactive, countdowndays, countdownhours, countdownminutes, countdownseconds, createdat, updatedat) VALUES
(25, 'Praise Night 25', '21st September 2025', 'Oasis Studio', 'ongoing', '/images/praise-night-25-banner.jpg', true, 11, 7, 48, 0, NOW(), NOW()),
(26, 'Your Loveworld Special', '21st September 2025', 'Oasis Studio', 'pre-rehearsal', '/images/loveworld-special-banner.jpg', true, 5, 12, 30, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample songs with proper Cloudinary URLs
INSERT INTO songs (title, status, category, praisenightid, leadsinger, writer, conductor, key, tempo, leadkeyboardist, leadguitarist, drummer, lyrics, solfas, audiofile, createdat, updatedat) VALUES
('Mighty God', 'heard', 'New Praise Songs', 25, 'Treasure, lisa', 'Hycent', 'Uche', 'F', '64 BPM', 'Xano', 'Tolu', 'Jack', 
'<h3>Verse 1:</h3><p>Great is Thy faithfulness, O God my Father<br>There is no shadow of turning with Thee<br>Thou changest not, Thy compassions they fail not<br>As Thou hast been Thou forever wilt be</p><h3>Chorus:</h3><p><strong>Great is Thy faithfulness<br>Great is Thy faithfulness<br>Morning by morning new mercies I see<br>All I have needed Thy hand hath provided</strong></p>',
'Do Re Mi Fa Sol La Ti Do\nSol Sol La Ti Do Ti La Sol\nMi Mi Fa Sol La Sol Fa Mi\nRe Mi Fa Sol La Ti Do Re',
'https://res.cloudinary.com/dumhphyhvnyyqnmnahno/raw/upload/v1757936485/YOUR_DOMINION_IS_FOR_ETERNITY_ENIOLA%282%29.mp3', NOW(), NOW()),

('Victory Chant', 'unheard', 'New Praise Songs', 25, 'Michael Thompson', 'Evanj', 'UCHE', 'D', '120 BPM', 'XANO', 'JAMES', 'PETER',
'<h3>Verse 1:</h3><p>We have the victory in Jesus<br>We have the victory in Jesus<br>We have the victory in Jesus<br>Hallelujah, we have the victory</p><h3>Chorus:</h3><p><strong>No weapon formed against us shall prosper<br>No weapon formed against us shall prosper<br>We have the victory in Jesus<br>Hallelujah, we have the victory</strong></p>',
'Sol Sol La Ti Do Ti La Sol\nSol Sol La Ti Do Ti La Sol\nSol Sol La Ti Do Ti La Sol\nDo Re Mi Fa Sol La Ti Do',
'https://res.cloudinary.com/dumhphyhvnyyqnmnahno/raw/upload/v1757936485/Forsaken_Epic_Trailer_Music_No_Copyright.mp3', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ===== ROW LEVEL SECURITY =====
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON pages FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON songs FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON song_history FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON media FOR SELECT USING (true);

-- Create policies for admin access
CREATE POLICY "Allow admin insert" ON pages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update" ON pages FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete" ON pages FOR DELETE USING (true);

CREATE POLICY "Allow admin insert" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete" ON categories FOR DELETE USING (true);

CREATE POLICY "Allow admin insert" ON songs FOR INSERT WITH CHECK (true); 
CREATE POLICY "Allow admin update" ON songs FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete" ON songs FOR DELETE USING (true);

CREATE POLICY "Allow admin insert" ON song_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update" ON song_history FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete" ON song_history FOR DELETE USING (true);

CREATE POLICY "Allow admin insert" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update" ON comments FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete" ON comments FOR DELETE USING (true);

CREATE POLICY "Allow admin insert" ON media FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update" ON media FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete" ON media FOR DELETE USING (true);
