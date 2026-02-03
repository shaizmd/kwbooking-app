# Room Types & Packages Feature

## Overview
The booking app now supports **booking.com-style room selection** with multiple room types and pricing packages per property. This allows properties to offer different room configurations and flexible pricing options.

## Schema Changes

### New Models

#### RoomType
Represents a specific type of room/apartment variant in a property.

**Fields:**
- `name`: Room type name (e.g., "Deluxe Room", "Standard Studio")
- `bedType`: Bed configuration (e.g., "1 double bed", "2 single beds")
- `maxGuests`: Maximum guest capacity
- `roomSize`: Optional square meters
- `basePrice`: Base price for this room type
- `features`: JSON array of features (e.g., ["Air conditioning", "Private bathroom"])

#### RoomPackage
Represents a pricing package/deal for a room type.

**Fields:**
- `name`: Package name (e.g., "Best Deal", "Free Cancellation")
- `originalPrice`: Original price (for showing discounts)
- `finalPrice`: Actual booking price
- `discountPercent`: Discount percentage (e.g., 53 for "53% off")
- `isLimitedTime`: Whether this is a limited-time deal
- `dealLabel`: Deal badge text (e.g., "Limited-time Deal")
- `freeCancellation`: Whether free cancellation is included
- `cancellationDeadlineText`: Human-readable cancellation deadline
- `isRefundable`: Whether booking is refundable
- `prepaymentRequired`: Whether payment is required before arrival
- `noCreditCard`: Whether credit card is not needed
- `benefits`: JSON array of benefits (e.g., ["10% off food/drink", "parking"])

### Updated Models

#### Booking
Added fields to track room and package selection:
- `roomTypeId`: ID of selected room type
- `packageId`: ID of selected package
- `roomCount`: Number of rooms booked

## API Endpoints

### Get Room Types
```
GET /api/properties/[propertyId]/rooms
```
Returns all active room types and packages for a property.

**Response:**
```json
{
  "roomTypes": [
    {
      "id": "uuid",
      "name": "Deluxe Room",
      "bedType": "1 double bed",
      "maxGuests": 2,
      "roomSize": 35,
      "features": ["Air conditioning", "Private bathroom", "Flat-screen TV"],
      "packages": [
        {
          "id": "uuid",
          "name": "Best Deal - Limited Time",
          "originalPrice": 6720,
          "finalPrice": 3162,
          "discountPercent": 53,
          "isLimitedTime": true,
          "dealLabel": "Limited-time Deal",
          "freeCancellation": true,
          "cancellationDeadlineText": "before 11 February 2026",
          "benefits": [
            "Includes 10% off food/drink",
            "Free parking",
            "Late check-in",
            "High-speed internet"
          ]
        }
      ]
    }
  ]
}
```

### Create Room Type (HOST only)
```
POST /api/properties/[propertyId]/rooms
Authorization: access_token cookie
```

**Request Body:**
```json
{
  "name": "Deluxe Room",
  "nameAr": "غرفة ديلوكس",
  "description": "Spacious room with modern amenities",
  "bedType": "1 double bed",
  "bedCount": 1,
  "roomSize": 35,
  "maxGuests": 2,
  "basePrice": 3500,
  "features": ["Air conditioning", "Private bathroom", "Flat-screen TV", "Free WiFi"]
}
```

### Create Package (HOST only)
```
POST /api/properties/[propertyId]/rooms/[roomTypeId]/packages
Authorization: access_token cookie
```

**Request Body:**
```json
{
  "name": "Best Deal - Limited Time",
  "originalPrice": 6720,
  "finalPrice": 3162,
  "discountPercent": 53,
  "isLimitedTime": true,
  "dealLabel": "Limited-time Deal",
  "freeCancellation": true,
  "cancellationDeadline": 48,
  "cancellationDeadlineText": "before 11 February 2026",
  "isRefundable": true,
  "prepaymentRequired": false,
  "noCreditCard": true,
  "benefits": [
    "Includes 10% off food/drink",
    "Free parking",
    "Late check-in",
    "High-speed internet"
  ],
  "sortOrder": 0
}
```

## UI Components

### RoomSelection Component
Client component that displays booking.com-style room selection interface.

**Features:**
- Table layout with columns: Room type, Guests, Price, Benefits, Select
- Multiple packages per room type
- Deal badges (discount %, limited-time)
- Benefit icons (free cancellation, parking, etc.)
- Room quantity selector
- Sticky booking summary bar
- Real-time price calculation

**Usage:**
```tsx
<RoomSelection
  roomTypes={formattedRoomTypes}
  currency="KWD"
  locale="en"
  nights={2}
  checkIn="2026-02-12"
  checkOut="2026-02-14"
  propertyId={propertyId}
/>
```

## Property Details Page Integration

The property details page now:
1. Fetches room types and packages along with property data
2. Calculates number of nights from URL params (checkIn/checkOut)
3. Formats room types for RoomSelection component
4. Shows room selection interface if room types exist
5. Falls back to simple booking card if no room types

## Migration Steps

To add this feature to existing properties:

1. Run Prisma migration:
```bash
bunx prisma migrate dev --name add_room_types_and_packages
```

2. For each property, create room types:
```typescript
await prisma.roomType.create({
  data: {
    propertyId: property.id,
    name: "Standard Apartment",
    bedType: "1 double bed",
    maxGuests: 2,
    basePrice: property.basePrice,
    features: JSON.stringify([
      "Air conditioning",
      "Private bathroom",
      "Kitchen",
      "Free WiFi"
    ])
  }
});
```

3. For each room type, create packages:
```typescript
await prisma.roomPackage.create({
  data: {
    roomTypeId: roomType.id,
    name: "Flexible - Free Cancellation",
    finalPrice: roomType.basePrice,
    freeCancellation: true,
    cancellationDeadlineText: "before 48 hours",
    noCreditCard: true,
    benefits: JSON.stringify([
      "Free cancellation",
      "No credit card needed",
      "Pay at property"
    ])
  }
});
```

## Example: Creating Complete Room Setup

```typescript
// 1. Create Deluxe Room Type
const deluxeRoom = await prisma.roomType.create({
  data: {
    propertyId: "property-uuid",
    name: "Deluxe Room",
    bedType: "1 double bed",
    bedCount: 1,
    maxGuests: 2,
    roomSize: 35,
    basePrice: 6720,
    features: JSON.stringify([
      "Air conditioning",
      "Private bathroom",
      "Flat-screen TV",
      "Free WiFi",
      "Mini bar",
      "Safe"
    ])
  }
});

// 2. Create Limited Time Deal Package
await prisma.roomPackage.create({
  data: {
    roomTypeId: deluxeRoom.id,
    name: "Best Deal",
    originalPrice: 6720,
    finalPrice: 3162,
    discountPercent: 53,
    isLimitedTime: true,
    dealLabel: "Limited-time Deal",
    freeCancellation: true,
    cancellationDeadlineText: "before 11 February 2026",
    isRefundable: true,
    noCreditCard: true,
    benefits: JSON.stringify([
      "Includes 10% off food/drink",
      "Free parking",
      "Late check-in",
      "High-speed internet"
    ]),
    sortOrder: 0
  }
});

// 3. Create Non-refundable Package (cheaper)
await prisma.roomPackage.create({
  data: {
    roomTypeId: deluxeRoom.id,
    name: "Non-refundable",
    originalPrice: 6246,
    finalPrice: 2936,
    discountPercent: 53,
    isLimitedTime: true,
    dealLabel: "Limited-time Deal",
    freeCancellation: false,
    isRefundable: false,
    prepaymentRequired: true,
    noCreditCard: false,
    benefits: JSON.stringify([
      "Includes 10% off food/drink",
      "Free parking",
      "Late check-in",
      "High-speed internet"
    ]),
    sortOrder: 1
  }
});
```

## Benefits
- **Flexible Pricing**: Offer multiple price points for same room
- **Upselling**: Highlight limited-time deals and premium packages
- **Transparency**: Clear display of benefits and cancellation policies
- **User Choice**: Let customers choose package that fits their needs
- **Professional UI**: Matches booking.com industry standard

## Future Enhancements
- Host dashboard UI for managing room types
- Dynamic pricing based on dates/demand
- Inventory management (available rooms per type)
- Package recommendations based on user behavior
- Mobile-optimized layout
