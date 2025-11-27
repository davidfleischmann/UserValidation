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

# 3. Create Web App & Configure Deployment
echo "🌐 Creating Web App, Configuring Startup, and Connecting to GitHub..."
az webapp create --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan "plan-$APP_NAME" \
    --runtime "NODE:20-lts" \
    --startup-file "npm start" \
    --deployment-source-url $REPO_URL \
    --deployment-source-branch $BRANCH \
    --output none

echo "--------------------------------"
echo "✅ Deployment Setup Complete!"
echo "--------------------------------"
echo "🌍 Your App URL: https://$APP_NAME.azurewebsites.net"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Go to the Azure Portal or Entra Admin Center."
echo "2. Update your App Registration Redirect URI to: https://$APP_NAME.azurewebsites.net/"
echo "3. Update your src/config/auth-config.ts with this new URL if needed."
echo ""
# 5. Enable Continuous Deployment (Auto-Update)
# Using 'az rest' to bypass the current Azure CLI bug in 'az webapp deployment source config'
echo "🔄 Enabling Continuous Deployment..."
az rest --method put \
    --uri "/subscriptions/{subscriptionId}/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$APP_NAME/sourcecontrols/web?api-version=2022-03-01" \
    --body "{\"properties\": {\"repoUrl\": \"$REPO_URL\", \"branch\": \"$BRANCH\", \"isManualIntegration\": false, \"deploymentRollbackEnabled\": true}}" \
    --output none

echo "--------------------------------"
echo "✅ Deployment Setup Complete!"
echo "--------------------------------"
echo "🌍 Your App URL: https://$APP_NAME.azurewebsites.net"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Go to the Azure Portal or Entra Admin Center."
echo "2. Update your App Registration Redirect URI to: https://$APP_NAME.azurewebsites.net/"
echo "3. Update your src/config/auth-config.ts with this new URL if needed."
echo ""
echo "🛠️  MANUAL UPDATE (Fallback):"
echo "If auto-update fails, you can manually pull changes:"
echo "az webapp deployment source sync --name $APP_NAME --resource-group $RESOURCE_GROUP"
