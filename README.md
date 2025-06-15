# Gym Tracker - All-in-One Workout Logger

A sleek, minimal, all-in-one mobile app to track your gym workouts, monitor your progress, and stay motivated. Built with React and designed to run completely offline on your device.

## Overview

This application is a comprehensive tool for fitness enthusiasts who want to meticulously log their workouts and track their physical progress over time. It operates entirely on your device, requiring no internet connection and no user account, ensuring your data is private and always accessible. From creating detailed workout templates to analyzing your strength gains with charts, this app is designed to be your perfect gym companion.

## Features

- **Offline First:** All data is stored locally on your device, meaning the app works perfectly without an internet connection.
- **Persistent Workouts:** Start a workout and navigate freely through the app. A "Return to Workout" button on the dashboard brings you right back to your active session.
- **Customizable Workout Templates:** Create, edit, and save detailed workout presets, including exercises, sets, reps, weights, and rest times.
- **Cardio & Weight Training:** Log both weightlifting (sets, reps, weight) and cardio exercises (duration in minutes).
- **Live Rest Timer:** An automatic timer with sound notifications appears after you complete a set, helping you stay on track.
- **Detailed Workout History:** Review past workouts with a clean, expandable summary showing duration, total volume, total sets, and a breakdown of each exercise performed.
- **Advanced Progress Analytics:**
    - **Workout Calendar:** A visual calendar on the progress screen highlights the days you've completed a workout.
    - **Body Weight Tracker:** Log your body weight over time and visualize your progress on a line graph.
    - **Personal Record (PR) Tracking:** The app automatically detects and saves your PRs for both max weight and max volume on a per-exercise basis.
    - **Muscle Group Analysis:** Tag exercises with a muscle group and see your training distribution in a clear pie chart.
    - **Exercise-Specific Charts:** Dive deep into your performance for any exercise with line graphs showing your max weight and volume progression over time.
- **User-Friendly Settings:**
    - **Unit System:** Seamlessly switch between Metric (kg) and Imperial (lbs) units.
    - **Custom Rest Time:** Set your own default rest time for workouts.
    - **Sound Toggles:** Enable or disable sound effects.
    - **Data Management:** Easily export all your data to a backup file and import it back when needed.

## Technologies Used

- **React:** For building the user interface.
- **Capacitor:** To wrap the web app into a native mobile application for Android & iOS.
- **Tailwind CSS:** For all styling and layout.
- **Recharts:** For creating beautiful and responsive progress charts.
- **Lucide React:** For a clean and modern icon set.

## Getting Started

To get the project running, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Git-Aarya/Gym-Tracker
    ```
2.  **Navigate into the project directory:**
    ```bash
    cd gym-tracker-app
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

## Building for Mobile (with Capacitor)

1.  **Build the web assets:**
    ```bash
    npm run build
    ```
2.  **Sync the web assets with your native projects:**
    ```bash
    npx cap sync
    ```
3.  **Open the native project in its IDE:**
    - For Android: `npx cap open android`
    - For iOS: `npx cap open ios`
4.  From Android Studio or Xcode, you can run the app on an emulator or a physical device.

