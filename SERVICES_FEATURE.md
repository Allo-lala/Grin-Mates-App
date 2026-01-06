# Eco Services Feature

## Overview
The Services feature replaces the Profile button in the bottom navigation and provides eco-friendly activities and conservation tools for users. Features a comprehensive Green Points reward system for eco-friendly activities.

## Features Implemented

### 🌿 Green Points System
- **Reward Currency**: Users earn Green Points (GP) for eco-friendly activities
- **Dual Payment Options**: Pay with crypto (ETH) or Green Points
- **Earning Mechanism**: 1000 GP per 1 ETH spent on services
- **Virtual Card**: Dedicated Green Points card in profile with balance and history
- **Transparency**: White service cards with black text for better visibility

### 🔥 Gas Refill Service
- **Cooking Gas Delivery**: Order gas cylinders for cooking
- **Size Options**: Small (3kg/150 GP), Medium (6kg/250 GP), Large (12kg/450 GP)
- **Dual Payment**: Pay with ETH (0.015-0.045) or Green Points (150-450 GP)
- **Rewards**: Earn 1000 GP per ETH spent when paying with crypto

### ☀️ Solar Connection Service
- **Solar Packages**: Basic (2kW/500 GP), Standard (5kW/1200 GP), Premium (10kW/2000 GP)
- **Appliance Add-ons**: LED lights, ceiling fans, smart TVs, refrigerators
- **Location Integration**: GPS location capture with Geoapify address resolution
- **Dual Payment**: Pay with ETH or Green Points
- **Complete Installation**: Includes panels, inverters, warranties, and installation

### ♻️ Smart Recycling System
- **QR Code Scanning**: Scan recycling machine QR codes
- **Waste Categories**: Plastic bottles, glass bottles, aluminum cans
- **Crypto Rewards**: Earn 0.001-0.003 ETH per item recycled
- **Green Points**: Also earn GP for recycling activities
- **European/US Style**: Similar to deposit systems in Europe and USA

### 🦎 Animal Conservation Reporting
- Take photos of endangered animals
- Automatic location capture using device GPS
- Address resolution using Geoapify API
- Endangerment level classification
- Blockchain submission for transparency

### 💚 Organization Donations
- **Green Mates**: Environmental conservation organization
- Direct ETH donations to organization wallet
- Preset donation amounts (0.01, 0.05, 0.1, 0.5, 1.0 ETH)
- Custom donation amounts

### 📍 Location Services
- **Nearby Services**: Find eco-friendly services using Geoapify API
- Location-based service discovery
- Integration with gas stations, solar providers, recycling centers

## Technical Implementation

### Green Points System
- `GreenPointsCard`: Virtual card component for profile
- `PaymentMethodModal`: Dual payment selection (crypto/points)
- **Conversion Rate**: 1000 GP = 1 ETH equivalent
- **Balance Tracking**: Mock balance of 1250 GP for demonstration
- **Earning History**: Recent activities and points earned

### Responsive Design
- **Transparent Cards**: White backgrounds with black text
- Mobile-first approach with responsive grid layouts
- Adaptive text sizes and spacing (sm: breakpoints)
- Touch-friendly buttons with proper sizing
- Optimized for various screen sizes

### Navigation Changes
- Replaced Profile button with Services in bottom navigation
- Profile now accessible via icon above virtual card in dashboard
- Services accessible at `/services` route

### New Components Created
- `PaymentMethodModal`: Dual payment method selection
- `GreenPointsCard`: Virtual card for Green Points
- `GasRefillModal`: Gas cylinder ordering with dual payment
- `SolarConnectionModal`: Solar system ordering with dual payment
- `RecyclingModal`: QR code scanning and waste disposal
- `AnimalReportModal`: Wildlife reporting (enhanced)
- `DonationModal`: Organization donations

### API Integration
- **Geoapify API**: Location services and address resolution
- Environment variable: `NEXT_PUBLIC_GEOAPIFY_API_KEY`
- Reverse geocoding for addresses
- Places API for nearby eco services

### Service Updates
- **Transparent Design**: White service cards with black text and borders
- **Gas Refill**: Flame icon, cooking gas focus with GP pricing
- **Solar**: Complete ordering system with location, appliances, and GP pricing
- **Recycling**: Smart recycling system with QR codes and rewards
- **Dual Payment**: All services support both crypto and Green Points

## Green Points Economics

### Earning Green Points
- **Service Purchases**: 1000 GP per 1 ETH spent
- **Recycling**: Variable GP based on waste type
- **Conservation**: GP rewards for wildlife reporting
- **Solar Usage**: Bonus GP for renewable energy adoption

### Spending Green Points
- **Gas Refill**: 150-450 GP based on cylinder size
- **Solar Systems**: 500-2000 GP based on package
- **Other Services**: GP equivalent to ETH pricing

### Profile Integration
- Green Points virtual card with balance display
- Recent earning history and activities
- Tips on how to earn more points
- Balance hiding/showing toggle


## Future Enhancements
- **Real GP Blockchain Token**: Deploy actual Green Points as ERC-20 token
- **GP Marketplace**: Trade Green Points between users
- **Staking Rewards**: Earn interest on held Green Points
- **Merchant Integration**: More businesses accepting Green Points
- **Carbon Credit Conversion**: Convert GP to verified carbon credits
- **Community Challenges**: Group activities to earn bonus GP
- **NFT Rewards**: Special NFTs for high GP earners