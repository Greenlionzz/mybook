const fs = require('fs');
const path = require('path');

// 1. Update package.json
const packagePath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Increment the patch version (e.g., 0.0.1 -> 0.0.2)
const parts = pkg.version.split('.');
parts[2] = parseInt(parts[2]) + 1;
pkg.version = parts.join('.');

fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
console.log(`Bumping version to ${pkg.version}`);

// 2. Update Android Version (If you have an android folder)
const gradlePath = path.join(__dirname, 'android/app/build.gradle');
if (fs.existsSync(gradlePath)) {
  let content = fs.readFileSync(gradlePath, 'utf8');
  
  // Increment versionCode (Integer)
  content = content.replace(/versionCode (\d+)/, (match, v) => {
    return `versionCode ${parseInt(v) + 1}`;
  });
  
  // Update versionName (String)
  content = content.replace(/versionName "([^"]+)"/, `versionName "${pkg.version}"`);
  
  fs.writeFileSync(gradlePath, content);
  console.log('Android build.gradle updated.');
}
