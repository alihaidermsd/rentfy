🏠 Prisma + PostgreSQL Schema for Property Hosting Platform (Airbnb + Booking.com Hybrid)

We are building a next-generation hospitality platform that merges the best of Airbnb and Booking.com — starting with properties and hosting (apartments, rooms, villas, hotels).

The stack: Prisma ORM + PostgreSQL.

Your job: generate a production-grade Prisma schema and seed data for the MVP — focusing on properties, bookings, users, reviews, amenities, and availability.

🌍 1. Overview

The platform supports:

Guests: browse and book properties

Hosts: list apartments, homes, or hotels

Admins: manage platform data

Unified booking, review, and availability systems

Scalable structure for future categories like “experiences” or “transport”

🧩 2. Core Models and Relationships
🧑‍💼 User

Base table for all users (guests, hosts, admins)

Fields: id, name, email, phone, role, avatar, bio, isVerified

Relations:

properties → all listings if host

bookings → all bookings if guest

Enum: UserRole → GUEST, HOST, ADMIN

🏡 Property

Represents any accommodation (apartment, room, villa, hotel)

Fields:
id, title, description, type, pricePerNight, maxGuests,
bedrooms, bathrooms, address, city, country,
latitude, longitude, status, policies (JSON), timestamps

Relations:

host → User

media → PropertyMedia[]

bookings → Booking[]

reviews → Review[]

amenities → many-to-many

facilities → many-to-many

availability → Availability[]

Enums:

PropertyType → APARTMENT, VILLA, ROOM, HOUSE, HOTEL

PropertyStatus → ACTIVE, PENDING, DRAFT, SUSPENDED

🖼️ PropertyMedia

Property images and videos

Fields: id, url, type, isFeatured, order

Enum: MediaType → IMAGE, VIDEO

🧺 Amenity

Master table for standard amenities (WiFi, AC, Hairdryer, etc.)

Many-to-many with Property via PropertyAmenity

🏊 Facility

Master table for large-scale facilities (pool, parking, gym, security)

Many-to-many with Property via PropertyFacility

📅 Availability

Tracks property availability and price overrides

Fields: id, propertyId, date, isAvailable, priceOverride

🧾 Booking

The Booking model is the core transactional table connecting guests, hosts, and properties.

model Booking {
  id             String         @id @default(uuid())
  property       Property       @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  propertyId     String
  guest          User           @relation("GuestBookings", fields: [guestId], references: [id], onDelete: Cascade)
  guestId        String
  host           User           @relation("HostBookings", fields: [hostId], references: [id], onDelete: Cascade)
  hostId         String
  checkIn        DateTime
  checkOut       DateTime
  totalPrice     Float
  status         BookingStatus  @default(PENDING)
  paymentStatus  PaymentStatus  @default(UNPAID)
  review         Review?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([propertyId])
  @@index([guestId])
  @@index([hostId])
  @@index([checkIn, checkOut])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
}

🌟 Review

One review per booking

Fields:

id, bookingId, propertyId, guestId

ratingCleanliness, ratingComfort, ratingLocation, ratingValue, overallRating, comment

timestamps

🔗 Join Tables

PropertyAmenity

PropertyFacility

Each with composite primary keys (propertyId, amenityId) and (propertyId, facilityId).

⚙️ 3. Design Rules

Use @default(uuid()) for all IDs

Use createdAt, updatedAt in all tables

Add indexes for latitude, longitude, and pricePerNight

Use @db.Json for flexible metadata

Support future scalability with optional JSON fields and soft deletes (isDeleted boolean)

🧱 4. Prisma Schema Output Format

Your output should be a Prisma schema like this style:

model User {
  id          String      @id @default(uuid())
  name        String
  email       String      @unique
  phone       String?
  role        UserRole
  avatar      String?
  bio         String?
  isVerified  Boolean     @default(false)
  properties  Property[]  @relation("HostProperties")
  bookings    Booking[]   @relation("GuestBookings")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}


Then continue defining all other models, enums, and relationships in the same clean, documented format.

🌱 5. Seed Data Generation

After the schema, generate seed data for Prisma using TypeScript like below:

await prisma.amenity.createMany({
  data: [
    { name: "Wi-Fi" },
    { name: "Air Conditioning" },
    { name: "Hairdryer" },
    { name: "Private Bathroom" },
    { name: "TV" },
    { name: "Iron" },
    { name: "Towels / Toiletries" },
    { name: "Tea / Coffee Maker" },
  ],
});

await prisma.facility.createMany({
  data: [
    { name: "Pool" },
    { name: "Gym" },
    { name: "Parking" },
    { name: "Security" },
    { name: "Restaurant" },
    { name: "Laundry" },
  ],
});

await prisma.user.createMany({
  data: [
    { name: "Syed Arsarn", email: "arsarn@example.com", role: "HOST" },
    { name: "Samin Khan", email: "samin@example.com", role: "GUEST" },
  ],
});


Then include relational seeds:

2–3 sample properties linked to hosts

A few property media entries

Amenities and facilities connected via join tables

Example bookings (confirmed, pending)

Example reviews and availability records

🎯 6. Final Deliverable

Cursor should output:

A complete Prisma schema for PostgreSQL including:

All models, enums, and relations

Indexes

Comments

A TypeScript seed script (prisma/seed.ts) with:

Sample users, properties, media, amenities, facilities, bookings, and reviews

All relations connected properly

Ready for execution via npx prisma db seed

Schema should be production-ready, scalable, and easy to extend.

🚀 Goal

Deliver a scalable Prisma + PostgreSQL schema and seed setup for our MVP — a unified property-hosting platform (Airbnb + Booking.com hybrid) built for billion-dollar scale.