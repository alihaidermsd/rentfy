import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Clearing existing data...')
  await prisma.review.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.propertyAmenity.deleteMany()
  await prisma.propertyFacility.deleteMany()
  await prisma.propertyMedia.deleteMany()
  await prisma.property.deleteMany()
  await prisma.user.deleteMany()
  await prisma.amenity.deleteMany()
  await prisma.facility.deleteMany()

  // ===== SEED AMENITIES =====
  console.log('🏠 Creating amenities...')
  await prisma.amenity.createMany({
    data: [
      { name: "Wi-Fi", icon: "wifi" },
      { name: "Air Conditioning", icon: "ac" },
      { name: "Hairdryer", icon: "hairdryer" },
      { name: "Private Bathroom", icon: "bathroom" },
      { name: "TV", icon: "tv" },
      { name: "Iron", icon: "iron" },
      { name: "Towels / Toiletries", icon: "towels" },
      { name: "Tea / Coffee Maker", icon: "coffee" },
      { name: "Kitchen", icon: "kitchen" },
      { name: "Microwave", icon: "microwave" },
      { name: "Refrigerator", icon: "fridge" },
      { name: "Dishwasher", icon: "dishwasher" },
      { name: "Washing Machine", icon: "washing-machine" },
      { name: "Dryer", icon: "dryer" },
      { name: "Heating", icon: "heating" },
      { name: "Smoke Detector", icon: "smoke-detector" },
      { name: "Carbon Monoxide Detector", icon: "co-detector" },
      { name: "First Aid Kit", icon: "first-aid" },
      { name: "Fire Extinguisher", icon: "fire-extinguisher" },
      { name: "Laptop Friendly Workspace", icon: "laptop" },
    ],
  })

  // ===== SEED FACILITIES =====
  console.log('🏊 Creating facilities...')
  await prisma.facility.createMany({
    data: [
      { name: "Pool", icon: "pool" },
      { name: "Gym", icon: "gym" },
      { name: "Parking", icon: "parking" },
      { name: "Security", icon: "security" },
      { name: "Restaurant", icon: "restaurant" },
      { name: "Laundry", icon: "laundry" },
      { name: "Spa", icon: "spa" },
      { name: "Business Center", icon: "business-center" },
      { name: "Concierge", icon: "concierge" },
      { name: "Room Service", icon: "room-service" },
      { name: "Airport Shuttle", icon: "shuttle" },
      { name: "Pet Friendly", icon: "pet-friendly" },
      { name: "Elevator", icon: "elevator" },
      { name: "24/7 Front Desk", icon: "front-desk" },
      { name: "Luggage Storage", icon: "luggage" },
    ],
  })

  // ===== SEED USERS =====
  console.log('👥 Creating users...')
  const users = await prisma.user.createMany({
    data: [
      {
        name: "Syed Arsarn",
        email: "arsarn@example.com",
        phone: "+1234567890",
        role: "HOST",
        bio: "Experienced host with 5+ years in hospitality. I love sharing my beautiful properties with guests from around the world.",
        isVerified: true,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      {
        name: "Samin Khan",
        email: "samin@example.com",
        phone: "+1234567891",
        role: "GUEST",
        bio: "Travel enthusiast exploring new destinations and experiencing local cultures.",
        isVerified: true,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      },
      {
        name: "Maria Rodriguez",
        email: "maria@example.com",
        phone: "+1234567892",
        role: "HOST",
        bio: "Architect and interior designer. My properties reflect my passion for beautiful spaces and comfort.",
        isVerified: true,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      {
        name: "James Wilson",
        email: "james@example.com",
        phone: "+1234567893",
        role: "GUEST",
        bio: "Business traveler who appreciates comfort and convenience.",
        isVerified: false,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      {
        name: "Admin User",
        email: "admin@rentfy.com",
        phone: "+1234567894",
        role: "ADMIN",
        bio: "Platform administrator",
        isVerified: true,
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
      }
    ],
  })

  // Get created users for relationships
  const createdUsers = await prisma.user.findMany()
  const host1 = createdUsers.find(u => u.email === "arsarn@example.com")!
  const host2 = createdUsers.find(u => u.email === "maria@example.com")!
  const guest1 = createdUsers.find(u => u.email === "samin@example.com")!
  const guest2 = createdUsers.find(u => u.email === "james@example.com")!

  // ===== SEED PROPERTIES =====
  console.log('🏡 Creating properties...')
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        title: "Luxury Downtown Apartment with City Views",
        description: "Stunning modern apartment in the heart of downtown with panoramic city views. Perfect for business travelers and tourists alike. Features floor-to-ceiling windows, premium finishes, and all modern amenities.",
        type: "APARTMENT",
        pricePerNight: 150.00,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        address: "123 Main Street, Downtown",
        city: "New York",
        country: "United States",
        latitude: 40.7589,
        longitude: -73.9851,
        status: "ACTIVE",
        policies: {
          checkIn: "15:00",
          checkOut: "11:00",
          cancellation: "Flexible",
          houseRules: [
            "No smoking",
            "No pets",
            "No parties or events",
            "Quiet hours after 10 PM"
          ]
        },
        hostId: host1.id
      }
    }),
    prisma.property.create({
      data: {
        title: "Cozy Beach Villa with Private Pool",
        description: "Beautiful beachfront villa with private pool and direct beach access. Perfect for families and groups. Features spacious living areas, modern kitchen, and breathtaking ocean views.",
        type: "VILLA",
        pricePerNight: 300.00,
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        address: "456 Ocean Drive, Beachfront",
        city: "Miami",
        country: "United States",
        latitude: 25.7617,
        longitude: -80.1918,
        status: "ACTIVE",
        policies: {
          checkIn: "16:00",
          checkOut: "10:00",
          cancellation: "Moderate",
          houseRules: [
            "No smoking inside",
            "Pets allowed with fee",
            "Maximum 2 cars",
            "Pool hours: 7 AM - 10 PM"
          ]
        },
        hostId: host1.id
      }
    }),
    prisma.property.create({
      data: {
        title: "Charming Historic Hotel Room",
        description: "Elegant room in a beautifully restored historic hotel. Features original architectural details, modern amenities, and exceptional service. Located in the historic district.",
        type: "HOTEL",
        pricePerNight: 120.00,
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        address: "789 Historic Square",
        city: "Boston",
        country: "United States",
        latitude: 42.3601,
        longitude: -71.0589,
        status: "ACTIVE",
        policies: {
          checkIn: "15:00",
          checkOut: "12:00",
          cancellation: "Strict",
          houseRules: [
            "No smoking",
            "No pets",
            "Room service available",
            "Concierge service included"
          ]
        },
        hostId: host2.id
      }
    }),
    prisma.property.create({
      data: {
        title: "Modern Family House with Garden",
        description: "Spacious family home with beautiful garden and outdoor dining area. Perfect for families with children. Features large kitchen, comfortable living spaces, and peaceful neighborhood.",
        type: "HOUSE",
        pricePerNight: 180.00,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        address: "321 Maple Avenue, Suburbs",
        city: "Chicago",
        country: "United States",
        latitude: 41.8781,
        longitude: -87.6298,
        status: "ACTIVE",
        policies: {
          checkIn: "15:00",
          checkOut: "11:00",
          cancellation: "Flexible",
          houseRules: [
            "No smoking",
            "Pets welcome",
            "Children welcome",
            "Garden access included"
          ]
        },
        hostId: host2.id
      }
    })
  ])

  // ===== SEED PROPERTY MEDIA =====
  console.log('📸 Creating property media...')
  const propertyMedia = await Promise.all([
    // Property 1 media
    prisma.propertyMedia.createMany({
      data: [
        {
          url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          type: "IMAGE",
          isFeatured: true,
          order: 1,
          propertyId: properties[0].id
        },
        {
          url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
          type: "IMAGE",
          isFeatured: false,
          order: 2,
          propertyId: properties[0].id
        },
        {
          url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
          type: "IMAGE",
          isFeatured: false,
          order: 3,
          propertyId: properties[0].id
        }
      ]
    }),
    // Property 2 media
    prisma.propertyMedia.createMany({
      data: [
        {
          url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
          type: "IMAGE",
          isFeatured: true,
          order: 1,
          propertyId: properties[1].id
        },
        {
          url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
          type: "IMAGE",
          isFeatured: false,
          order: 2,
          propertyId: properties[1].id
        },
        {
          url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
          type: "IMAGE",
          isFeatured: false,
          order: 3,
          propertyId: properties[1].id
        }
      ]
    }),
    // Property 3 media
    prisma.propertyMedia.createMany({
      data: [
        {
          url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
          type: "IMAGE",
          isFeatured: true,
          order: 1,
          propertyId: properties[2].id
        },
        {
          url: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&fit=crop",
          type: "IMAGE",
          isFeatured: false,
          order: 2,
          propertyId: properties[2].id
        }
      ]
    }),
    // Property 4 media
    prisma.propertyMedia.createMany({
      data: [
        {
          url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
          type: "IMAGE",
          isFeatured: true,
          order: 1,
          propertyId: properties[3].id
        },
        {
          url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
          type: "IMAGE",
          isFeatured: false,
          order: 2,
          propertyId: properties[3].id
        }
      ]
    })
  ])

  // ===== SEED PROPERTY AMENITIES =====
  console.log('🏠 Creating property amenities...')
  const amenities = await prisma.amenity.findMany()
  
  // Property 1 amenities
  await prisma.propertyAmenity.createMany({
    data: [
      { propertyId: properties[0].id, amenityId: amenities.find(a => a.name === "Wi-Fi")!.id },
      { propertyId: properties[0].id, amenityId: amenities.find(a => a.name === "Air Conditioning")!.id },
      { propertyId: properties[0].id, amenityId: amenities.find(a => a.name === "TV")!.id },
      { propertyId: properties[0].id, amenityId: amenities.find(a => a.name === "Kitchen")!.id },
      { propertyId: properties[0].id, amenityId: amenities.find(a => a.name === "Microwave")!.id },
      { propertyId: properties[0].id, amenityId: amenities.find(a => a.name === "Refrigerator")!.id },
      { propertyId: properties[0].id, amenityId: amenities.find(a => a.name === "Heating")!.id },
      { propertyId: properties[0].id, amenityId: amenities.find(a => a.name === "Laptop Friendly Workspace")!.id }
    ]
  })

  // Property 2 amenities
  await prisma.propertyAmenity.createMany({
    data: [
      { propertyId: properties[1].id, amenityId: amenities.find(a => a.name === "Wi-Fi")!.id },
      { propertyId: properties[1].id, amenityId: amenities.find(a => a.name === "Air Conditioning")!.id },
      { propertyId: properties[1].id, amenityId: amenities.find(a => a.name === "TV")!.id },
      { propertyId: properties[1].id, amenityId: amenities.find(a => a.name === "Kitchen")!.id },
      { propertyId: properties[1].id, amenityId: amenities.find(a => a.name === "Washing Machine")!.id },
      { propertyId: properties[1].id, amenityId: amenities.find(a => a.name === "Dryer")!.id },
      { propertyId: properties[1].id, amenityId: amenities.find(a => a.name === "Dishwasher")!.id }
    ]
  })

  // Property 3 amenities
  await prisma.propertyAmenity.createMany({
    data: [
      { propertyId: properties[2].id, amenityId: amenities.find(a => a.name === "Wi-Fi")!.id },
      { propertyId: properties[2].id, amenityId: amenities.find(a => a.name === "Air Conditioning")!.id },
      { propertyId: properties[2].id, amenityId: amenities.find(a => a.name === "TV")!.id },
      { propertyId: properties[2].id, amenityId: amenities.find(a => a.name === "Hairdryer")!.id },
      { propertyId: properties[2].id, amenityId: amenities.find(a => a.name === "Iron")!.id },
      { propertyId: properties[2].id, amenityId: amenities.find(a => a.name === "Towels / Toiletries")!.id }
    ]
  })

  // Property 4 amenities
  await prisma.propertyAmenity.createMany({
    data: [
      { propertyId: properties[3].id, amenityId: amenities.find(a => a.name === "Wi-Fi")!.id },
      { propertyId: properties[3].id, amenityId: amenities.find(a => a.name === "Air Conditioning")!.id },
      { propertyId: properties[3].id, amenityId: amenities.find(a => a.name === "TV")!.id },
      { propertyId: properties[3].id, amenityId: amenities.find(a => a.name === "Kitchen")!.id },
      { propertyId: properties[3].id, amenityId: amenities.find(a => a.name === "Washing Machine")!.id },
      { propertyId: properties[3].id, amenityId: amenities.find(a => a.name === "Dryer")!.id },
      { propertyId: properties[3].id, amenityId: amenities.find(a => a.name === "Heating")!.id }
    ]
  })

  // ===== SEED PROPERTY FACILITIES =====
  console.log('🏊 Creating property facilities...')
  const facilities = await prisma.facility.findMany()
  
  // Property 1 facilities
  await prisma.propertyFacility.createMany({
    data: [
      { propertyId: properties[0].id, facilityId: facilities.find(f => f.name === "Parking")!.id },
      { propertyId: properties[0].id, facilityId: facilities.find(f => f.name === "Elevator")!.id },
      { propertyId: properties[0].id, facilityId: facilities.find(f => f.name === "24/7 Front Desk")!.id }
    ]
  })

  // Property 2 facilities
  await prisma.propertyFacility.createMany({
    data: [
      { propertyId: properties[1].id, facilityId: facilities.find(f => f.name === "Pool")!.id },
      { propertyId: properties[1].id, facilityId: facilities.find(f => f.name === "Parking")!.id },
      { propertyId: properties[1].id, facilityId: facilities.find(f => f.name === "Security")!.id },
      { propertyId: properties[1].id, facilityId: facilities.find(f => f.name === "Pet Friendly")!.id }
    ]
  })

  // Property 3 facilities
  await prisma.propertyFacility.createMany({
    data: [
      { propertyId: properties[2].id, facilityId: facilities.find(f => f.name === "Parking")!.id },
      { propertyId: properties[2].id, facilityId: facilities.find(f => f.name === "Restaurant")!.id },
      { propertyId: properties[2].id, facilityId: facilities.find(f => f.name === "Concierge")!.id },
      { propertyId: properties[2].id, facilityId: facilities.find(f => f.name === "Room Service")!.id },
      { propertyId: properties[2].id, facilityId: facilities.find(f => f.name === "24/7 Front Desk")!.id }
    ]
  })

  // Property 4 facilities
  await prisma.propertyFacility.createMany({
    data: [
      { propertyId: properties[3].id, facilityId: facilities.find(f => f.name === "Parking")!.id },
      { propertyId: properties[3].id, facilityId: facilities.find(f => f.name === "Pet Friendly")!.id }
    ]
  })

  // ===== SEED AVAILABILITY =====
  console.log('📅 Creating availability...')
  const today = new Date()
  const availabilityData = []

  // Create availability for next 90 days for all properties
  for (let i = 0; i < 90; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    for (const property of properties) {
      // Random availability (90% chance of being available)
      const isAvailable = Math.random() > 0.1
      // Random price override (10% chance of having override)
      const priceOverride = Math.random() > 0.9 ? property.pricePerNight * (0.8 + Math.random() * 0.4) : null
      
      availabilityData.push({
        propertyId: property.id,
        date: date,
        isAvailable: isAvailable,
        priceOverride: priceOverride
      })
    }
  }

  await prisma.availability.createMany({
    data: availabilityData
  })

  // ===== SEED BOOKINGS =====
  console.log('📋 Creating bookings...')
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        propertyId: properties[0].id,
        guestId: guest1.id,
        hostId: host1.id,
        checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        totalPrice: 450.00, // 3 nights * $150
        status: "CONFIRMED",
        paymentStatus: "PAID"
      }
    }),
    prisma.booking.create({
      data: {
        propertyId: properties[1].id,
        guestId: guest2.id,
        hostId: host1.id,
        checkIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        checkOut: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        totalPrice: 2100.00, // 7 nights * $300
        status: "PENDING",
        paymentStatus: "UNPAID"
      }
    }),
    prisma.booking.create({
      data: {
        propertyId: properties[2].id,
        guestId: guest1.id,
        hostId: host2.id,
        checkIn: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        checkOut: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
        totalPrice: 240.00, // 2 nights * $120
        status: "COMPLETED",
        paymentStatus: "PAID"
      }
    })
  ])

  // ===== SEED REVIEWS =====
  console.log('⭐ Creating reviews...')
  await Promise.all([
    prisma.review.create({
      data: {
        bookingId: bookings[2].id, // Review for completed booking
        propertyId: properties[2].id,
        guestId: guest1.id,
        ratingCleanliness: 5,
        ratingComfort: 4,
        ratingLocation: 5,
        ratingValue: 4,
        overallRating: 4.5,
        comment: "Excellent stay! The historic charm combined with modern amenities made for a perfect experience. The location was ideal for exploring the city."
      }
    })
  ])

  console.log('✅ Database seeding completed successfully!')
  console.log(`📊 Created:`)
  console.log(`   - ${createdUsers.length} users`)
  console.log(`   - ${properties.length} properties`)
  console.log(`   - ${amenities.length} amenities`)
  console.log(`   - ${facilities.length} facilities`)
  console.log(`   - ${bookings.length} bookings`)
  console.log(`   - ${availabilityData.length} availability records`)
  console.log(`   - 1 review`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
