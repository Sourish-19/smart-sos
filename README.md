# Smart SOS

Smart SOS is an intelligent emergency alert and response application designed to provide rapid assistance in critical situations. Leveraging modern technologies, the application enables users to quickly send SOS signals, share their real-time location, and notify emergency contacts or authorities efficiently.

![SmartSOS Landing Page](./screenshot.png)

## Features

- **One-Tap SOS Alert:** Instantly send emergency alerts with your live location.
- **Location Tracking:** Sends your real-time coordinates to predefined emergency contacts via Google Maps integration.
- **Customizable Emergency Contacts:** Manage and update your list of key contacts easily.
- **AI Health Guardian:** Uses Google Gemini to analyze vitals and provide health insights.
- **Simulation Mode:** Built-in simulation for heart rate, blood pressure, and emergency scenarios.
- **Intuitive UI:** Simple and user-friendly interface for rapid response under stress.

## Technologies Used

- **Primary Language:** TypeScript
- **Frontend Framework:** React
- **Styling:** Tailwind CSS
- **AI Integration:** Google Gemini API (@google/genai)
- **Location Services:** Browser Geolocation API & Google Maps Embed
- **Notification System:** Simulated WhatsApp & In-App Notifications

## Getting Started

### Prerequisites

- [ ] Node.js (v16+)
- [ ] npm or yarn
- [ ] Google Gemini API Key (Optional for live AI, simulation provided)

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Sourish-19/smart-sos.git
    ```
2. **Navigate to directory:**
    ```bash
    cd smart-sos
    ```
3. **Install dependencies:**
    ```bash
    npm install
    ```
4. **Start the application:**
    ```bash
    npm start
    ```

### Configuration

- The application uses `localStorage` to simulate a backend database.
- To enable live AI features, create a `.env` file and add `API_KEY=your_gemini_api_key`.
- Ensure permissions for location and microphone are granted in the browser.

## Usage

1. Launch the Smart SOS app.
2. Register a new account or log in with the demo credentials.
3. Set up your emergency contacts in the settings menu.
4. To send an SOS alert, tap the designated SOS button.
5. Your emergency message with real-time location will be sent to your contacts for swift assistance.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a pull request

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

Sourish-19  
GitHub: [https://github.com/Sourish-19](https://github.com/Sourish-19)

---

*Stay safe, stay connected!*