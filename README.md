# Gym Tracker - All-in-One Workout Logger

<div align="center">

**A sleek, minimal, all-in-one mobile app to track your gym workouts, monitor your progress, and stay motivated. Built with React and designed to run completely offline on your device.**

<br>


## ✨ About The Project

This application is a comprehensive tool for fitness enthusiasts who want to meticulously log their workouts and track their physical progress over time. It operates entirely on your device, requiring no internet connection and no user account, ensuring your data is private and always accessible. From creating detailed workout templates to analyzing your strength gains with charts, this app is designed to be your perfect gym companion.

---

## 🚀 Key Features

**🔒 Offline First:** All data is stored locally. No internet connection or account needed. Your data is private and always available.
**🔄 Persistent Workouts:** Start a workout and navigate away. A "Return to Workout" button brings you right back to your active session.
**🏋️ Customizable Templates:** Create, edit, and save detailed workout presets, including exercises, sets, reps, weights, and rest times. New sets added to templates now correctly initialize with independent default values (e.g., 8 reps, 10 kg/22 lbs).
**🏃 Cardio & Weight Training:** Log both weightlifting (sets, reps, weight) and cardio exercises (duration).
* **⏱️ Live Rest Timer:** An automatic timer with sound notifications appears after each set to keep your workout on track.
* **📊 Dynamic Unit Conversion:** Seamlessly switch between Metric (kg) and Imperial (lbs) units. All weight inputs and displays in active workouts and templates instantly update to reflect your chosen unit. Default weights for new exercises/sets also adjust accordingly (10 kg or 22 lbs).
* **📈 Advanced Progress Analytics:**
    * **Workout Calendar:** A visual calendar highlights your completed workout days.
    * **Body Weight Tracker:** Log your body weight and visualize your progress on a line graph.
    * **PR Tracking:** Automatically detects and saves your Personal Records (max weight & max volume) for each exercise.
    * **Muscle Group Analysis:** Tag exercises with a muscle group and see your training distribution in a clear pie chart.
    * **Exercise-Specific Charts:** Deep dive into your performance for any exercise with dedicated progression graphs.
* **⚙️ User-Friendly Settings:**
    * **Unit System:** Seamlessly switch between Metric (kg) and Imperial (lbs).
    * **Custom Rest Time:** Set your own default rest period.
    * **Custom Modals:** All alert and confirmation dialogs now use a consistent, app-themed modal interface instead of native browser pop-ups.
    * **Data Management:** Easily export all your data to a backup file and import it back when needed.
* **📱 Native Back Button Support:** Enhanced navigation experience for Android users with proper back button handling via Capacitor.

### 📸 Screenshots

<!-- IMPORTANT: Replace these placeholder images with actual screenshots of your app. -->
| Dashboard | Active Workout | Progress |
| :---: | :---: | :---: |
| <img src="https://placehold.co/300x600/3b82f6/ffffff?text=Dashboard+Screen" alt="Dashboard" width="200"/> | <img src="https://placehold.co/300x600/8b5cf6/ffffff?text=Active+Workout+Screen" alt="Workout" width="200"/> | <img src="https://placehold.co/300x600/ec4899/ffffff?text=Progress+Charts+Screen" alt="Progress" width="200"/> |

---

## 🛠️ Tech Stack

Built with a modern, efficient, and mobile-first tech stack.

<!-- You can find more icons at https://skillicons.dev/ -->
<p align="left">
  <a href="https://reactjs.org/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" alt="react" width="40" height="40"/> </a>
  <a href="https://capacitorjs.com/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/capacitor-community/awesome-capacitor/main/logo.svg" alt="capacitor" width="40" height="40"/> </a>
  <a href="https://tailwindcss.com/" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" alt="tailwind" width="40" height="40"/> </a>
  <a href="https://recharts.org/" target="_blank" rel="noreferrer"> <img src="https://recharts.org/assets/images/logo.png" alt="recharts" width="40" height="40"/> </a>
  <a href="https://lucide.dev/" target="_blank" rel="noreferrer"> <img src="https://lucide.dev/logo.light.svg" alt="lucide" width="40" height="40"/> </a>
</p>

* **React:** For building the user interface.
* **Capacitor:** To wrap the web app into a native mobile application, providing access to native features like the back button.
* **Tailwind CSS:** For all styling and layout, ensuring a responsive and modern design.
* **Recharts:** For creating beautiful and responsive progress charts.
* **Lucide React:** For a clean and modern icon set, enhancing the visual appeal.

---

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.
* npm
    ```sh
    npm install npm@latest -g
    ```

### Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/Git-Aarya/Gym-Tracker](https://github.com/Git-Aarya/Gym-Tracker)
    ```
2.  Navigate into the project directory:
    ```bash
    cd Gym-Tracker
    ```
3.  Install NPM packages:
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    npm run start
    ```

---

## 📱 Building for Mobile (with Capacitor)

To deploy and test the app on a physical device or emulator:

1.  Build the web assets for production:
    ```bash
    npm run build
    ```
2.  Sync the web assets with your native projects (this copies your web code and updates native dependencies):
    ```bash
    npx cap sync
    ```
    (You can also use `npx cap copy` to just copy assets, or `npx cap update [platform]` to just update native dependencies, but `sync` does both.)
3.  Open the native project in its respective IDE:
    * For Android:
        ```bash
        npx cap open android
        ```
    * For iOS (requires macOS and Xcode):
        ```bash
        npx cap open ios
        ```
4.  From Android Studio or Xcode, you can then select your desired emulator or connected physical device and run the app.

---

## 🗺️ Roadmap

-   [ ] Cloud backup & sync across devices (optional feature).
-   [ ] Social features: share workouts or progress.
-   [ ] More advanced statistics and weekly summaries.
-   [ ] Wearable device integration (e.g., Apple Watch).

See the [open issues](https://github.com/Git-Aarya/Gym-Tracker/issues) for a full list of proposed features (and known issues).

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` file for more information.

---
