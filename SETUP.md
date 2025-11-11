# TindaGo Setup Instructions

## 🔐 Google Maps API Key Setup

The `app.json` file is not committed to the repository for security reasons (contains API keys).

### For New Team Members:

1. **Copy the example file:**
   ```bash
   cp app.json.example app.json
   ```

2. **Get the Google Maps API key:**
   - Ask a team member for the API key
   - OR create your own:
     1. Go to [Google Cloud Console](https://console.cloud.google.com/)
     2. Create a new project: "TindaGo-Maps"
     3. Enable "Maps SDK for Android"
     4. Create API key
     5. Restrict key to "Maps SDK for Android"

3. **Add the API key to app.json:**
   - Open `app.json`
   - Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key
   - Save the file

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Build the development build:**
   ```bash
   eas build --profile development --platform android
   ```

## 📦 Dependencies

- **react-native-maps** - Google Maps integration
- **expo-location** - GPS location and permissions
- **geolib** - Distance calculations

## 🚀 Running the App

```bash
# Start dev server
npx expo start --dev-client

# On your phone, open the TindaGo development build
```

## ⚠️ Important Notes

- **NEVER commit `app.json`** - It contains your API key!
- Always use `app.json.example` as the template
- Keep your API key secure and don't share it publicly
- Set API key restrictions in Google Cloud Console

## 🗺️ Testing Maps

Navigate to `/test-map` in the app to verify Google Maps is working correctly.
