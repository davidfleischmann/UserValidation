#!/bin/bash

# Azure Setup Script for MSP Validator App
# Prerequisites: Azure CLI installed (brew install azure-cli) and logged in (az login)

# Stop script on any error
set -e

# Configuration
APP_NAME="msp-validator-$RANDOM" # Unique name
RESOURCE_GROUP="rg-msp-validator"
LOCATION="australiaeast" # Change if you hit quota limits in specific regions
REPO_URL="https://github.com/davidfleischmann/UserValidation"
BRANCH="main"
SKU="F1" # Using Free tier to avoid quota limits. Use "B1" for Basic if you have quota.

echo "🚀 Starting Azure Setup..."
echo "--------------------------------"
echo "App Name: $APP_NAME"
echo "Resource Group: $RESOURCE_GROUP"
echo "Region: $LOCATION"
echo "SKU: $SKU"
echo "--------------------------------"

# 1. Create Resource Group
echo "📦 Creating Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output none

# 2. Create App Service Plan
echo "🏗️ Creating App Service Plan ($SKU)..."
# Note: F1 (Free) does not support 'Always On', so sessions may reset if the app sleeps.
az appservice plan create --name "plan-$APP_NAME" \
    --resource-group $RESOURCE_GROUP \
    --sku $SKU \
    --is-linux \
    --output none

# 3. Create Web App
echo "🌐 Creating Web App..."
az webapp create --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan "plan-$APP_NAME" \
    --runtime "NODE:20-lts" \
    --output none

# 4. Configure Startup Command
echo "⚙️ Configuring Startup Command..."
az webapp config set --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --startup-file "npm start" \
    --output none

# 5. Configure Deployment from GitHub
echo "🔗 Connecting to GitHub..."
az webapp deployment source config --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --repo-url $REPO_URL \
    --branch $BRANCH \
    --manual-integration \
    --output none # Uses simple git pull, for GitHub Actions remove this and set up separately

echo "--------------------------------"
echo "✅ Deployment Setup Complete!"
echo "--------------------------------"
echo "🌍 Your App URL: https://$APP_NAME.azurewebsites.net"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Go to the Azure Portal or Entra Admin Center."
echo "2. Update your App Registration Redirect URI to: https://$APP_NAME.azurewebsites.net/"
echo "3. Update your src/config/auth-config.ts with this new URL if needed (optional)."
