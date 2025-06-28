# Gym Tracker 🏋️‍♂️ — Offline‑First Workout Logger

**A sleek, minimal, all-in-one mobile app to track your gym workouts, monitor your progress, and stay motivated. Built with React and designed to run completely offline on your device.**


---

## 📑 Table of Contents

1. [About](#about)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Tech Stack](#tech-stack)
5. [Getting Started](#getting-started)
6. [Building for Mobile](#building-for-mobile)
7. [Roadmap](#roadmap)
8. [Contributing](#contributing)
9. [License](#license)

---

## About

Gym Tracker is the companion app for lifters who want **total control over their training data** while keeping things private and lightweight. Everything — from workout templates to PR graphs — is stored locally, so you can lift in airplane mode and still have every rep logged.

---

## Features

| Category                     | Highlights                                                                                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Offline & Data Ownership** | • Works 100 % offline 🔒<br>• No sign‑up or cloud account <br>• One‑tap export & import of your data                                                                                                        |
| **Workout Flow**             | • *Return to Workout* button restores an unfinished session<br>• Auto rest‑timer with sound cues ⏱️<br>• Handles both strength (sets × reps × weight) and cardio (time / distance)                          |
| **Templates**                | • Unlimited preset workouts & exercises 🏗️<br>• Per‑exercise defaults (reps, weight, rest)<br>• Metric ⇄ Imperial switch updates all values instantly                                                      |
| **Progress Analytics**       | • Calendar heat‑map of training days 📆<br>• Body‑weight tracker with line chart<br>• Auto‑detected PRs (max weight & volume) 🏅<br>• Muscle‑group distribution pie chart<br>• Per‑exercise progress graphs |
| **Settings & UX**            | • Custom default rest time<br>• Themed modals replace native alerts<br>• Native Android back‑button support via Capacitor                                                                                   |

---

## 📸 Screenshots

<p align="center">
  <img src="repo_assets/gym-tracker-ss/cropped_Dashboard.jpg" alt="Dashboard screenshot" />
  <img src="repo_assets/gym-tracker-ss/cropped_Active_Workout.jpg" alt="Active workout screenshot" />
  <img src="repo_assets/gym-tracker-ss/cropped_Workout_Templates.jpg" alt="Templates screenshot" />
</p>

<p align="center">
  <img src="repo_assets/gym-tracker-ss/cropped_Progress_Analytics_1.jpg" alt="Workout Calendar and Body Weight Tracker screenshot" />
  <img src="repo_assets/gym-tracker-ss/cropped_Progress_Analytics_2.jpg" alt="Progress Analytics screenshot" />
  <img src="repo_assets/gym-tracker-ss/cropped_Exercise_Stat.jpg" alt="Individual Exercise Analytics screenshot" />
</p>

<p align="center">
  <img src="repo_assets/gym-tracker-ss/cropped_Workout_Template_editing.jpg" alt="Template Editor screenshot" />
  <img src="repo_assets/gym-tracker-ss/cropped_Workout_History.jpg" alt="Workout History screenshot" />
  <img src="repo_assets/gym-tracker-ss/cropped_Settings.jpg" alt="Settings screenshot" />
</p>

---

## Tech Stack

<div align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" alt="React" width="50" />
  &nbsp;&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/capacitor/capacitor-plain.svg" alt="Capacitor" width="50" />
  &nbsp;&nbsp;
  <img src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" alt="Tailwind" width="50" />
  &nbsp;&nbsp;
  <img src="https://lucide.dev/logo.light.svg" alt="Lucide" width="50" />
</div>

* **React** — component‑based UI
* **Capacitor** — native shell & device APIs
* **Tailwind CSS** — utility‑first styling
* **Recharts** — responsive charts
* **Lucide React** — iconography

---

## Getting Started

### Prerequisites

* **Node.js** 18 + (includes npm)

```bash
npm install -g npm@latest   # update npm (optional)
npm install capacitor-resources # for icons
```

### Installation & Dev Server

```bash
git clone https://github.com/Git-Aarya/Gym-Tracker.git
cd Gym-Tracker
npm install        # install dependencies
npm run start      # launch Vite dev server
```

Visit `http://localhost:5173` in your browser; the page reloads on save.

---

## Building for Mobile

```bash
npm run build   # create production web assets
npx cap sync    # copy assets & sync native deps
npm run resources # create nessecary icons

# then, open in your IDE of choice

npx cap open android   # Android Studio
npx cap open ios       # Xcode (macOS only)
```

### 🛠️ Running on a Mobile Device

#### For Android:

1. Connect your Android device via USB and enable **Developer Mode** and **USB Debugging**.
2. In Android Studio, click **Run** ▶ or select your device from the device list.
3. The app will be installed and launched on your connected device.

#### For iOS:

1. Open the project in Xcode using `npx cap open ios`.
2. Select your iOS device or a simulator.
3. Click **Run** ▶ to build and deploy.
4. Note: You may need a valid Apple Developer account and provisioning profile to install on a physical device. From Android Studio or Xcode, choose an emulator or device and hit **Run**.

---

## Roadmap

* [ ] 🔄 Optional cloud backup/sync
* [ ] 🤝 Social workout sharing
* [ ] 📊 Weekly summary reports
* [ ] ⌚ Wearable integration (Apple Watch, etc.)

See [open issues](https://github.com/Git-Aarya/Gym-Tracker/issues) for more.

---

## Contributing

Pull requests are welcome! Please open an issue first to discuss any major changes.

```bash
# example workflow
fork → feature branch → commit → push → open PR
```

---

## License

This project is licensed under the **MIT License**. See the [`LICENSE`](LICENSE) file for details.





