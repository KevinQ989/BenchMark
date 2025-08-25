# BenchMark

## Aim

BenchMark aims to be an all-in-one AI-powered gym companion that makes going to the gym easier and more enjoyable by helping out with personalised workout plans, progress gamification with friends, and an exercise form correction tool.

## Motivation

As frequent gym-goers, we have tried numerous apps designed to assist with workouts. However, we found that many lacked several valuable features, or offered different features that would have been more convenient if combined into a single app. This led us to identify an opportunity to develop a comprehensive platform that not only helps users plan and track their workouts, but also integrates personalized recommendations, progress monitoring, and community features.

## Features

- User Authentication
- Workout Tracking & History
- Exercise Catalog
- AI Workout Plan Generation
- Community Features
- Progress Visualisation

## Testing Instructions

1. Clone this repository:
   ```sh
   git clone https://github.com/KevinQ989/BenchMark.git
   ```
2. Navigate to the project root directory:
   ```sh
   cd BenchMark
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. **Set up Google Gemini API Key**

To use the AI workout recommendations feature, you'll need to set up a Google Gemini API key:

- Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create a new API key
- Create a `.env` file in the root directory of the project
- Add your API key to the `.env` file:
  ```
  GOOGLE_GEMINI_API_KEY=your_api_key_here
  ```
- Replace `your_api_key_here` with your actual Google Gemini API key
- If you forgot to do this step before running the app, make sure to restart the server after adding the .env file!

5. Run the application:
   ```sh
   npx expo run:ios
   ```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
