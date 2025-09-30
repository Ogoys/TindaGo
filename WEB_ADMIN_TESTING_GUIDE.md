# 🌐 Web Admin Dashboard Testing Guide

Complete testing procedures for the TindaGo admin dashboard to verify store registration approval/rejection workflow.

## 📍 Admin Dashboard Location
**Path**: `C:\Users\Toph\Desktop\Github\Projects\React Native Projects\tindago-admin`

## 🚀 Setup & Access

### Start Admin Dashboard
```bash
cd tindago-admin
npm install
npm run dev
```
**Access**: http://localhost:3000

### Required Environment Variables
Ensure `.env` file contains:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyBDeGdo1GmlBTolD7bYhtDyQAqobYSBVnE"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tindagoproject.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_DATABASE_URL="https://tindagoproject-default-rtdb.asia-southeast1.firebasedatabase.app"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="tindagoproject"
# ... other Firebase config
```

---

## 🎯 Testing Workflow

### Phase 1: Dashboard Access & Navigation

**1. Login to Admin Dashboard**
- Open http://localhost:3000
- Complete admin authentication
- Verify dashboard loads properly

**2. Navigate to Store Management**
- Click "Stores" in sidebar navigation
- Verify main store management interface loads
- Check statistics cards display correctly

**3. Access Pending Registrations**
- Click "Pending" tab or navigate to `/stores/pending`
- Verify pending registrations list appears
- Confirm table headers and data structure

### Phase 2: Pending Registration Review

**1. Locate Test Registration**
✅ **What to Look For:**
- Your test store registration from mobile app
- Status shows "pending"
- Submission timestamp matches mobile app submission
- Store name and owner details are correct

**2. Click on Registration Row**
- Navigate to detailed review page: `/stores/pending/{userId}`
- Verify comprehensive registration details load:
  - ✅ Business Owner Section (avatar, name, email, phone)
  - ✅ Business Details (address, business type, permit type)
  - ✅ Business Description
  - ✅ Submitted Documents (with view links)
  - ✅ Action Buttons (Approve/Reject)

**3. Review Document Uploads**
- Click document view links
- Verify uploaded documents display correctly
- Confirm business permits, IDs, and other docs are visible

### Phase 3: Approval Testing

**1. Test Approval Process**
- Click green "✅ Approve" button
- Confirm approval action in dialog/modal
- Wait for success feedback

**2. Verify Database Changes**
✅ **Expected Results:**
- Registration status changes to "approved"
- New entry created in `stores/{userId}` collection
- Timestamp updated in Firebase

**3. Check Mobile App Update**
- Switch to mobile app (keep it open)
- Status should update to "✅ Approved" within 2-3 seconds
- Pull-to-refresh should work
- Push notification should appear

**4. Verify Admin Dashboard Update**
- Registration should move from "Pending" to "Active" stores
- Pending count should decrease by 1
- Active stores count should increase by 1

### Phase 4: Rejection Testing

**1. Create Second Test Registration**
- Complete another store registration in mobile app
- Return to admin dashboard pending list

**2. Test Rejection Process**
- Click red "❌ Reject" button on new registration
- **Fill Rejection Reason**:
  - Modal should appear requesting rejection reason
  - Enter test reason: "Incomplete business permit documentation"
  - Confirm rejection

**3. Verify Rejection Results**
✅ **Expected Outcomes:**
- Registration status changes to "rejected"
- Rejection reason saved in database
- Mobile app shows "❌ Rejected" status
- Registration appears in "Rejected" stores list

---

## 🔍 Database Verification

### Firebase Console Checks

**Before Approval:**
```json
{
  "store_registrations": {
    "user123": {
      "status": "pending",
      "store_name": "Test Store",
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

**After Approval:**
```json
{
  "store_registrations": {
    "user123": {
      "status": "approved",
      "updated_at": "2024-01-15T11:00:00Z"
    }
  },
  "stores": {
    "user123": {
      "status": "active",
      "store_name": "Test Store",
      "business_address": "123 Test St.",
      "approved_at": "2024-01-15T11:00:00Z"
    }
  }
}
```

**After Rejection:**
```json
{
  "store_registrations": {
    "user456": {
      "status": "rejected",
      "rejection_reason": "Incomplete business permit documentation",
      "rejected_at": "2024-01-15T11:15:00Z"
    }
  }
}
```

---

## 🧪 Advanced Testing Scenarios

### Multi-Registration Testing

**1. Bulk Registration Test**
- Create 5+ test registrations in mobile app
- Verify all appear in pending list
- Test batch approval/rejection
- Check performance with multiple entries

**2. Search & Filter Testing**
- Use search bar to find specific registrations
- Test status filters (Pending, Active, Rejected)
- Verify pagination works with multiple entries

**3. Real-Time Updates**
- Open admin dashboard in multiple browser tabs
- Approve registration in one tab
- Verify other tabs update automatically
- Test concurrent admin actions

### Data Integrity Testing

**1. Document Verification**
- Test document viewing for all uploaded file types
- Verify document links work correctly
- Check for broken or missing document references

**2. Business Information Accuracy**
- Compare mobile app submitted data with admin dashboard display
- Verify all form fields transferred correctly
- Check special characters and formatting

**3. Status Transition Testing**
- Test approve → reject (if supported)
- Verify status history tracking
- Check for invalid status transitions

---

## 🚨 Common Issues & Solutions

### Issue 1: Pending Registration Not Appearing
**Symptoms:**
- Mobile app shows "pending" but admin doesn't see it
- Registration count doesn't match

**Check:**
```javascript
// Console log in browser dev tools
console.log('Pending registrations:', pendingRegistrations);
console.log('Firebase connection:', firebase.database().ref().key);
```

**Solution:**
- Verify Firebase database permissions
- Check environment variables match
- Confirm database rules allow admin read access

### Issue 2: Approval/Rejection Not Working
**Symptoms:**
- Clicking approve/reject has no effect
- Mobile app doesn't update
- Database status unchanged

**Debug Steps:**
1. Open browser developer tools
2. Check network tab for failed requests
3. Look for JavaScript errors in console
4. Verify Firebase write permissions

### Issue 3: Mobile App Not Updating
**Symptoms:**
- Admin action successful but mobile doesn't reflect changes
- Status remains "pending" after approval

**Troubleshooting:**
- Check mobile app Firebase listeners
- Verify useStoreRegistration hook is active
- Test pull-to-refresh functionality
- Check notification permissions

### Issue 4: Document Viewing Issues
**Symptoms:**
- Document links don't work
- Images don't load
- File format not supported

**Solutions:**
- Verify Firebase Storage rules
- Check document URL formats
- Test with different file types
- Confirm storage bucket permissions

---

## ✅ Success Criteria Checklist

### Admin Dashboard Functionality
- [ ] Dashboard loads without errors
- [ ] Pending registrations list populates
- [ ] Individual registration details load completely
- [ ] Document viewing works for all uploaded files
- [ ] Approve button functions correctly
- [ ] Reject button with reason modal works
- [ ] Search and filter features work
- [ ] Statistics cards update accurately

### Integration with Mobile App
- [ ] Approved stores immediately show "✅ Approved" in mobile
- [ ] Rejected stores show "❌ Rejected" with reason
- [ ] Push notifications deliver on status changes
- [ ] Pull-to-refresh updates status correctly
- [ ] No manual app restart required

### Database Consistency
- [ ] store_registrations status updates correctly
- [ ] stores collection created on approval
- [ ] Rejection reasons saved properly
- [ ] Timestamps accurate for all actions
- [ ] No orphaned or inconsistent data

### Performance & UX
- [ ] Dashboard responsive and fast
- [ ] Real-time updates work smoothly
- [ ] Multiple admin sessions work simultaneously
- [ ] Bulk operations handle gracefully
- [ ] Error states display helpful messages

---

## 📊 Testing Metrics

Track these metrics during testing:

**Response Times:**
- Dashboard load: < 2 seconds
- Approval action: < 1 second
- Mobile app update: < 3 seconds
- Document viewing: < 2 seconds

**Accuracy Rates:**
- Data transfer mobile → admin: 100%
- Status update propagation: 100%
- Document upload success: > 95%
- Notification delivery: > 90%

**Reliability Measures:**
- Zero data loss during status changes
- No phantom registrations
- Consistent status across platforms
- Robust error recovery

---

## 🎯 Production Readiness Verification

Your system is production-ready when:

1. **✅ Seamless Workflow**: Complete registration → approval cycle works flawlessly
2. **✅ Real-Time Sync**: Mobile and admin stay perfectly synchronized
3. **✅ Error Handling**: Graceful recovery from network issues
4. **✅ Document Security**: Proper access controls for business documents
5. **✅ Audit Trail**: Complete logging of all admin actions
6. **✅ Performance**: Fast response times under realistic load
7. **✅ User Experience**: Intuitive admin interface with clear feedback

Remember: The goal is seamless, instant synchronization between your admin dashboard and mobile app with zero manual intervention required! 🚀