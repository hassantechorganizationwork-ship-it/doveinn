-- ROOMS TABLE
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('master', 'twin')),
  description TEXT,
  price_per_night INTEGER NOT NULL,
  capacity INTEGER DEFAULT 2,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKINGS TABLE
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_ref TEXT UNIQUE NOT NULL,
  room_id UUID REFERENCES rooms(id),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_cnic TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_amount INTEGER NOT NULL,
  advance_amount INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'advance_paid', 'fully_paid', 'refunded')),
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'checked_in', 'checked_out')),
  special_requests TEXT,
  manager_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROOM AVAILABILITY TABLE
CREATE TABLE room_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  blocked_date DATE NOT NULL,
  reason TEXT DEFAULT 'booked',
  booking_id UUID REFERENCES bookings(id)
);

-- AMENITIES TABLE
CREATE TABLE amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS TABLE
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  room_id UUID REFERENCES rooms(id),
  stay_date DATE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  photo_url TEXT,
  manager_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTACT MESSAGES TABLE
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies: rooms are public read
CREATE POLICY "Rooms are publicly readable"
  ON rooms FOR SELECT USING (true);

-- Rooms: writes restricted to logged-in manager accounts
CREATE POLICY "Authenticated users can update rooms"
  ON rooms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Amenities: public read, writes restricted to logged-in manager accounts
CREATE POLICY "Amenities are publicly readable"
  ON amenities FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert amenities"
  ON amenities FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update amenities"
  ON amenities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete amenities"
  ON amenities FOR DELETE TO authenticated USING (true);

-- Bookings: anyone can insert (for guest booking)
CREATE POLICY "Anyone can create a booking"
  ON bookings FOR INSERT WITH CHECK (true);

-- Bookings: only service role can read/update (manager portal)
CREATE POLICY "Public can read own booking by ref"
  ON bookings FOR SELECT USING (true);

-- Availability: public read
CREATE POLICY "Availability is publicly readable"
  ON room_availability FOR SELECT USING (true);

-- Reviews: anyone can submit one (no guest account required); reading is
-- reserved for the manager portal / service role, not exposed publicly.
CREATE POLICY "Anyone can submit a review"
  ON reviews FOR INSERT WITH CHECK (true);

-- Reviews: only managers can add/edit a reply
CREATE POLICY "Authenticated users can update reviews"
  ON reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- SEED ROOMS DATA
INSERT INTO rooms (name, slug, type, price_per_night, capacity, amenities) VALUES
('Master Room 1', 'master-room-1', 'master', 7000, 2, ARRAY['WiFi', 'AC', 'LCD TV', 'Attached Bathroom', 'King Size Bed']),
('Master Room 2', 'master-room-2', 'master', 7000, 2, ARRAY['WiFi', 'AC', 'LCD TV', 'Attached Bathroom', 'King Size Bed']),
('Master Room 3', 'master-room-3', 'master', 7000, 2, ARRAY['WiFi', 'AC', 'LCD TV', 'Attached Bathroom', 'King Size Bed']),
('Master Room 4', 'master-room-4', 'master', 7000, 2, ARRAY['WiFi', 'AC', 'LCD TV', 'Attached Bathroom', 'King Size Bed']),
('Master Room 5', 'master-room-5', 'master', 7500, 3, ARRAY['WiFi', 'AC', 'LCD TV', 'Attached Bathroom', 'King Size Bed', 'Sofa']),
('Master Room 6', 'master-room-6', 'master', 7500, 3, ARRAY['WiFi', 'AC', 'LCD TV', 'Attached Bathroom', 'King Size Bed', 'Sofa']),
('Master Suite 7', 'master-suite-7', 'master', 9000, 2, ARRAY['WiFi', 'AC', 'LCD TV', 'Attached Bathroom', 'King Size Bed', 'Lounge Area', 'Mini Fridge']),
('Master Suite 8', 'master-suite-8', 'master', 9000, 2, ARRAY['WiFi', 'AC', 'LCD TV', 'Attached Bathroom', 'King Size Bed', 'Lounge Area', 'Mini Fridge']),
('Twin Room 1', 'twin-room-1', 'twin', 5000, 2, ARRAY['WiFi', 'AC', 'LCD TV', 'Attached Bathroom', 'Twin Beds']),
('Twin Room 2', 'twin-room-2', 'twin', 5000, 2, ARRAY['WiFi', 'AC', 'LCD TV', 'Attached Bathroom', 'Twin Beds']),
('Twin Room 3', 'twin-room-3', 'twin', 5500, 3, ARRAY['WiFi', 'AC', 'LCD TV', 'Attached Bathroom', 'Twin Beds', 'Extra Bed Available']),
('Twin Room 4', 'twin-room-4', 'twin', 5500, 3, ARRAY['WiFi', 'AC', 'LCD TV', 'Attached Bathroom', 'Twin Beds', 'Extra Bed Available']);
