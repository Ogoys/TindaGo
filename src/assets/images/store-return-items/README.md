# Store Owner Return Items - Asset Documentation

## Screen Information
- **Figma File**: 8I1Nr3vQZllDDknSevstvH
- **Node**: 1428-6992 (Store Owner Return Items)
- **Baseline**: 440x956
- **Screen File**: `app/(main)/(store-owner)/profile/return-history.tsx`

## Implementation Status

The Store Owner Return History screen has been implemented using **text-based icons** instead of image assets due to Figma API access restrictions. This approach maintains the design functionality while eliminating the need for external image files.

## Design Elements Used

### 1. Return Icon
- **Location**: Left side of each return card
- **Implementation**: Text character "↩" (U+21A9)
- **Styling**: Brown background (#8B4513), white text, 40x40px container

### 2. Status Badges
- **Pending**: Orange background (#FFA500), white text
- **Processed**: Primary green background (#3BB77E), white text
- **Rejected**: Red background (#E92B45), white text

### 3. Search Icon
- **Implementation**: Emoji "🔍" (magnifying glass)
- **Location**: Search input field

### 4. Filter Icon
- **Implementation**: Three horizontal bars (CSS-based)
- **Colors**: Primary green (#3BB77E)

### 5. Empty State Icon
- **Implementation**: Emoji "📦" (package box)
- **Size**: 80pt scaled with ms()

### 6. Back Button
- **Implementation**: Text character "←" (left arrow)
- **Location**: Top-left header

## Screen Features

1. **Return Request Cards**
   - Display return number, customer name, date, items count, and total refund
   - Status badges with color coding (Pending/Processed/Rejected)
   - Clickable to view return details (currently shows alert)
   - Brown icon background for visual consistency

2. **Search Functionality**
   - Search by customer name or return number
   - Real-time filtering as user types

3. **Filter Options**
   - Filter by refund method: All, GCash, PayMaya, Loan
   - Toggle filter panel with visual indicator

4. **Analytics Summary**
   - Total Refunded amount
   - Total Returns count
   - Pending Returns count

5. **Empty State**
   - Friendly message when no returns exist
   - Option to record new return
   - Different messages for filtered vs. empty states

6. **Floating Action Button (FAB)**
   - Quick access to record new return
   - Only visible when returns exist

## Design Measurements (Baseline: 440x956)

- **Header**: y:0-130, height:130px
- **Back Button**: x:20, y:79, size:30x30
- **Title**: Centered, fontSize:20
- **Return Card**: width:400, minHeight:100
- **Logo Container**: size:40x40
- **Search Input**: Full width with 10px margin for filter button
- **Filter Button**: size:50x50

## Integration Details

### Firebase Integration
- Fetches return data using `getReturns()` from `src/api/returns`
- Real-time updates with pull-to-refresh
- Filters and searches client-side for performance

### Navigation
- Back button navigates to previous screen
- Return cards navigate to return details (currently Alert, ready for detail screen)
- FAB and button navigate to record-return screen

### Responsive Scaling
All dimensions use responsive functions:
- `s()` - Horizontal scaling
- `vs()` - Vertical scaling  
- `ms()` - Moderate scaling for fonts

## Future Enhancements

If you want to replace text-based icons with actual image assets:

1. Extract images from Figma design
2. Save to this directory with these names:
   - `return-icon.png` (32x32px white icon on transparent)
   - `chevron-left.png` (15x15px navigation arrow)
   - `search-icon.png` (20x20px magnifying glass)
   - `empty-state.png` (150x150px illustration)

3. Update the code to use image imports:
   ```typescript
   <Image 
     source={require("../../../../src/assets/images/store-return-items/return-icon.png")}
     style={styles.returnIcon}
   />
   ```

## Color Palette

- **Background Gray**: #F4F6F6
- **Primary Green**: #3BB77E
- **Dark Gray**: #1E1E1E
- **White**: #FFFFFF
- **Brown (Return Icon)**: #8B4513
- **Orange (Pending)**: #FFA500
- **Red (Rejected)**: #E92B45
- **Shadow**: rgba(0, 0, 0, 0.25)

## Status Indicators

| Status     | Color   | Background | Use Case                    |
|------------|---------|------------|-----------------------------|
| Pending    | #FFFFFF | #FFA500    | Awaiting store action       |
| Processed  | #FFFFFF | #3BB77E    | Return completed            |
| Rejected   | #FFFFFF | #E92B45    | Return rejected by store    |

