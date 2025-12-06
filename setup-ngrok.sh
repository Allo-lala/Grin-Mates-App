#!/bin/bash

# Setup script for ngrok with Self Protocol
# This script helps you set up ngrok for local development

echo "🚀 Grin Mates - ngrok Setup Helper"
echo "=================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "Please install ngrok first:"
    echo "  - Mac: brew install ngrok/ngrok/ngrok"
    echo "  - Or download from: https://ngrok.com/download"
    echo ""
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Development server is not running on port 3000"
    echo ""
    echo "Please start your dev server first:"
    echo "  npm run dev"
    echo ""
    echo "Then run this script again in a new terminal."
    exit 1
fi

echo "✅ Development server is running on port 3000"
echo ""

echo "🌐 Starting ngrok tunnel..."
echo ""
echo "📋 Instructions:"
echo "1. Copy the 'Forwarding' URL (https://xxxxx.ngrok-free.app)"
echo "2. Update apps/web/.env.local:"
echo "   NEXT_PUBLIC_SELF_ENDPOINT=https://xxxxx.ngrok-free.app/api/kyc/verify"
echo "3. Restart your dev server (Ctrl+C and run 'npm run dev' again)"
echo "4. Navigate to /kyc page"
echo ""
echo "Press Ctrl+C to stop ngrok when done"
echo ""
echo "=================================="
echo ""

# Start ngrok
ngrok http 3000
