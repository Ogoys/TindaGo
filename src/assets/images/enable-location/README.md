# Enable Location Screen - Image Assets

## Required Images

Please export the following images from Figma and place them in this directory:

### 1. location-illustration.png
- **Figma Node**: Main illustration showing location/map concept
- **Recommended Size**: 300x250px @ 3x (900x750px)
- **Format**: PNG with transparency
- **Description**: The main hero illustration at the top of the screen

### 2. location-pin.png
- **Figma Node**: Location pin/marker icon
- **Recommended Size**: 60x60px @ 3x (180x180px)
- **Format**: PNG with transparency
- **Description**: The location pin icon displayed in the circular container

## Export Instructions from Figma

1. Open the Figma design: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1196-2259&m=dev

2. Select the illustration/icon element

3. In the right panel, find "Export" section

4. Set export settings:
   - Format: PNG
   - Scale: 3x (for high-resolution displays)
   - Check "Preview" to verify quality

5. Click "Export [element name]"

6. Save files to this directory with the exact names listed above

## Alternative: Use Ionicons

If the images are not available, you can temporarily use Ionicons by replacing the Image components:

```typescript
// Replace location-illustration
<Ionicons name="location" size={200} color={Colors.primary} />

// Replace location-pin
<Ionicons name="location-sharp" size={60} color={Colors.primary} />
```

## File Structure
```
src/assets/images/enable-location/
├── README.md (this file)
├── location-illustration.png
└── location-pin.png
```
