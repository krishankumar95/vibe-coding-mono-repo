# How to Fix the Gradle Version Error

If you're seeing this error:

```
Could not find com.android.tools.build:gradle:8.10.2.
Searched in the following locations:
  - https://dl.google.com/dl/android/maven2/com/android/tools/build/gradle/8.10.2/gradle-8.10.2.pom
  - https://repo.maven.apache.org/maven2/com/android/tools/build/gradle/8.10.2/gradle-8.10.2.pom
```

Follow these steps to fix it:

## Option 1: Run the Fix Script (Easiest)

1. Run the provided fix script:
   ```bash
   ./fix-gradle-version.sh
   ```

2. Try building again:
   ```bash
   cd android
   ./gradlew clean assembleDebug
   ```

## Option 2: Manual Fix

If the script doesn't work, you can fix it manually:

### Step 1: Check and Fix build.gradle

1. Open `android/build.gradle` in a text editor
2. Find the line with the Gradle plugin version:
   ```gradle
   classpath 'com.android.tools.build:gradle:8.10.2'
   ```
3. Change it to:
   ```gradle
   classpath 'com.android.tools.build:gradle:7.3.1'
   ```

### Step 2: Check gradle.properties

1. Open or create `android/gradle.properties`
2. Make sure there's no reference to version 8.10.2
3. If you find a property like `pluginVersion=8.10.2`, change it to `pluginVersion=7.3.1`

### Step 3: Check Gradle Wrapper

1. Open `android/gradle/wrapper/gradle-wrapper.properties`
2. Ensure it points to a valid Gradle version:
   ```properties
   distributionUrl=https\://services.gradle.org/distributions/gradle-7.5.1-all.zip
   ```

### Step 4: Clean and Rebuild

```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

## Option 3: Using Android Studio

If you're in Android Studio:

1. Open the project in Android Studio
2. Go to File > Project Structure
3. Select the "Project" section
4. Change "Android Gradle Plugin Version" to 7.3.1
5. Change "Gradle Version" to 7.5.1
6. Click "Apply" and "OK"
7. Let Android Studio sync the project
8. Build from Build > Build Bundle(s)/APK(s) > Build APK(s)

## Still Having Issues?

Look for the actual file that might be referencing this incorrect version:

```bash
cd android
grep -r "8.10.2" --include="*.gradle" --include="*.properties" .
```

If you find any files with this reference, edit them to use version 7.3.1 instead.