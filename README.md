# FinSight - Financial Management Application

FinSight is a financial management application built with Expo and React Native that helps users track expenses, visualize financial data, and gain insights into their spending habits.

## Features

- User authentication with Firebase
- Financial tracking and visualization
- Personalized financial insights
- Cross-platform support (iOS & Android)

## Getting Started

### Prerequisites

- Node.js (16.x or newer)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional for mobile testing)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd FinSight
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Firebase:
   - The app is already configured with Firebase in [firebase.js](firebase.js)
   - Make sure you have the necessary Firebase services enabled (Authentication, Firestore, Storage)

4. Start the app:

   ```bash
   npx expo start
   ```

## Development

This project uses:
- [Expo](https://expo.dev) as the development platform
- [React Native](https://reactnative.dev/) for mobile app development
- [Firebase](https://firebase.google.com/) for backend services
- [Expo Router](https://docs.expo.dev/router/introduction) for file-based routing

### Project Structure

- `/app` - Main application code with file-based routing
- `/components` - Reusable UI components
- `/constants` - Application constants
- `/assets` - Static assets like images and fonts
- `/hooks` - Custom React hooks

### Testing

You can test the app using:
- iOS Simulator
- Android Emulator
- Expo Go on a physical device
- Development build for unrestricted native functionality

## Troubleshooting

If you encounter issues with dependencies or Firebase, try:

```bash
npm install firebase @react-native-async-storage/async-storage
```
