<div align="center">
  <h1>Toodaloo</h1>
  <img src="toodaloo/assets/toodaloo.png" alt="Toodaloo Logo" width="200"/>
  <p><em>Find a bathroom wherever you go</em></p>
</div>

# About
Toodaloo is a React Native mobile application that helps users find nearby public bathrooms with detailed information about accessibility features, reviews, and directions. The app addresses a crucial need for accessible sanitation facilities, particularly for people with medical conditions, travelers in unfamiliar areas, and individuals experiencing homelessness.

# Key Features
- **Location-Based Bathroom Finder**: Displays nearby bathrooms on an interactive map
- **Comprehensive Bathroom Information**:
  - Distance calculations
  - Accessibility features
  - Gender-neutral options
  - Baby changing facilities
  - Detailed directions
- **User Reviews System**: Read and write reviews for bathrooms
- **AI-Powered Review Summaries**: Gemini API integration for condensed insights
- **Preference Settings**: Save bathroom feature preferences for personalized recommendations
- **Achievement System**: Gamification to encourage community contributions
- **User Authentication**: Secure login system with personalized features

# Tech Stack
- **Frontend**: React Native with Expo
- **Backend & Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **API Integrations**:
  - RapidAPI Public Bathrooms API
  - Google's Gemini AI API for review summarization
 
# Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/toodaloo.git
cd toodaloo
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a .env.js file in the root directory with your API keys
```javascript
export default {
  FIREBASE_API_KEY: "your-firebase-api-key",
  FIREBASE_AUTH_DOMAIN: "your-firebase-auth-domain",
  FIREBASE_PROJECT_ID: "your-firebase-project-id",
  FIREBASE_STORAGE_BUCKET: "your-firebase-storage-bucket",
  FIREBASE_MESSAGING_SENDER_ID: "your-firebase-messaging-sender-id",
  FIREBASE_APP_ID: "your-firebase-app-id",
  FIREBASE_MEASUREMENT_ID: "your-firebase-measurement-id",
  RAPID_API_KEY: "your-rapidapi-key",
  RAPID_API_HOST: "public-bathrooms.p.rapidapi.com",
  GEMINI_API_KEY: "your-gemini-api-key"
};
```

4. Start the development server
```bash
npm start
```

