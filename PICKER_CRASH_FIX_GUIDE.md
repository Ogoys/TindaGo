# Picker Crash Fix Guide: "Already resumed" Error

## Problem
The `java.lang.IllegalStateException: Already resumed` crash occurs when Expo's activity result launchers (used by `ImagePicker` and `DocumentPicker`) try to resume a Kotlin coroutine multiple times. This happens when:

1. User rapidly taps the upload button multiple times
2. Screen unmounts while the picker is still open
3. The activity result callback is triggered concurrently

## Solution Pattern

Add a state variable to track if a picker is currently open and prevent concurrent calls:

```typescript
// Add state
const [isPickingImage, setIsPickingImage] = useState(false);

// Wrap picker call
const handlePickImage = async () => {
  // Prevent concurrent picker calls
  if (isPickingImage) {
    console.log('⚠️ Picker already open, ignoring request');
    return;
  }

  try {
    setIsPickingImage(true);
    
    // Your picker code here
    const result = await ImagePicker.launchImageLibraryAsync({
      // ... options
    });
    
    // Handle result
    
  } catch (error) {
    // Handle error
  } finally {
    // ALWAYS reset state
    setIsPickingImage(false);
  }
};
```

## Files Already Fixed ✅

1. `app/(auth)/(store-owner)/DocumentUpload.tsx`
   - Added `uploading` state
   - Protected `handleDocumentUpload`
   - Disabled buttons while uploading

2. `app/(main)/(store-owner)/profile/order-supplies.tsx`
   - Added `isPickingImage` state
   - Protected `handleUploadImage`

## Files That Need Fixing ⚠️

Apply the same pattern to these files:

### High Priority (Supplier-related screens you mentioned):
1. `app/(main)/(store-owner)/inventory/add-product.tsx`
   - Line ~183: `ImagePicker.launchImageLibraryAsync`
   
2. `app/(main)/(store-owner)/inventory/edit-product.tsx`
   - Line ~167: `ImagePicker.launchImageLibraryAsync`

3. `app/(auth)/(store-owner)/StoreDetails.tsx`
   - Line ~171: Image picker for store logo

### Medium Priority:
4. `app/(main)/(store-owner)/inventory/record-damage.tsx`
   - Line ~184: Image picker for damage photos

5. `app/(main)/(customer)/profile/return-request.tsx`
   - Line ~136: Image picker for return photos

6. `app/(main)/(customer)/review.tsx`
   - Line ~97: Image picker for review photos

7. `app/(main)/(store-owner)/profile/my-account.tsx`
   - Line ~222: Image picker for profile photo

8. `app/(main)/(customer)/profile/account-settings.tsx`
   - Line ~199: Image picker for profile photo

## Implementation Checklist

For each file:
- [ ] Add state variable (e.g., `isPickingImage`, `uploading`)
- [ ] Check state at start of picker function
- [ ] Set state to `true` before picker call
- [ ] Use `try-catch-finally` block
- [ ] Reset state in `finally` block
- [ ] Optionally disable button/TouchableOpacity during picking

## Example Implementation

```typescript
// In component state
const [isPickingImage, setIsPickingImage] = useState(false);

// Picker handler
const handleUploadImage = async () => {
  // Guard clause
  if (isPickingImage) {
    console.log('⚠️ Image picker already open, ignoring request');
    return;
  }

  try {
    setIsPickingImage(true);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Handle the selected image
      setImage(result.assets[0].uri);
    }
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'Failed to pick image');
  } finally {
    // CRITICAL: Always reset state
    setIsPickingImage(false);
  }
};

// In JSX (optional but recommended)
<TouchableOpacity 
  onPress={handleUploadImage}
  disabled={isPickingImage}
>
  <Text>Upload Image</Text>
</TouchableOpacity>
```

## Testing

After applying fixes:
1. Test rapid tapping of upload button
2. Test navigating away while picker is open
3. Test uploading multiple images in succession
4. Test on both Android and iOS

## Why This Works

The guard clause (`if (isPickingImage) return;`) prevents a second picker from being launched while one is already open. The `finally` block ensures the state is always reset, even if an error occurs, preventing the UI from becoming stuck in a "picking" state.

## Related Expo Issues

- https://github.com/expo/expo/issues/24518
- https://github.com/expo/expo/issues/23105
- https://github.com/expo/expo/issues/27830

These issues are tracked in Expo's repository and may be fixed in future releases, but the workaround is stable and recommended.
