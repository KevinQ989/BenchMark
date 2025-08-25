# Google Services Configuration Setup

This project uses Firebase and Google services. The configuration files contain sensitive API keys and should not be committed to version control.

## Setup Instructions

### 1. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Add your iOS and Android apps to the project

### 2. iOS Configuration
1. Download `GoogleService-Info.plist` from Firebase Console
2. Place it in `ios/BenchMark/GoogleService-Info.plist`
3. Make sure it's added to your Xcode project

### 3. Android Configuration
1. Download `google-services.json` from Firebase Console
2. Place it in the root directory of your project
3. Make sure it's referenced in your `android/app/build.gradle`

## Important Security Notes

- **NEVER commit** `GoogleService-Info.plist` or `google-services.json` to version control
- These files contain API keys that could be misused if exposed
- The files are already added to `.gitignore` to prevent accidental commits
- Template files are provided for reference

## Template Files

- `google-services.json.template` - Android configuration template
- `ios/BenchMark/GoogleService-Info.plist.template` - iOS configuration template

## What to Do If Files Are Already Committed

If these files were already committed to your repository:

1. **Immediately rotate your API keys** in Firebase Console
2. **Remove the files from git tracking**:
   ```bash
   git rm --cached google-services.json
   git rm --cached ios/BenchMark/GoogleService-Info.plist
   git commit -m "Remove sensitive Google service files"
   ```
3. **Update your `.gitignore`** (already done)
4. **Force push** to remove from remote history if necessary

## Environment Variables (Alternative)

For additional security, consider using environment variables for sensitive values:

```bash
# .env file (also in .gitignore)
GOOGLE_API_KEY=your_api_key_here
GOOGLE_CLIENT_ID=your_client_id_here
```

Then reference these in your code instead of hardcoding values.
