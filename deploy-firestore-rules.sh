#!/bin/bash

# Deploy Firestore Rules Script
# This script deploys the updated Firestore security rules to fix permission issues

echo "🔥 Deploying Firestore Rules..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Deploy only Firestore rules
echo "📋 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully!"
    echo "🔧 The updated rules should fix Firebase permission issues for authenticated users."
else
    echo "❌ Failed to deploy Firestore rules. Please check your configuration."
    exit 1
fi
