# Video Call Debugging Steps

## Issue
Video call incoming modal not appearing for receiver.

## Quick Fixes to Try

### 1. **Hard Refresh Browser**
- Press **Ctrl + Shift + R** (or **Ctrl + F5**)
- This clears cached JavaScript files

### 2. **Clear Browser Cache**
- Open DevTools (F12)
- Right-click refresh button → "Empty Cache and Hard Reload"

### 3. **Check Console for Errors**
- Press F12
- Go to Console tab
- Look for any red errors when the call comes in

### 4. **Test Flow**
1. **Browser A (Caller)**: 
   - Login as Patient
   - Go to Messages
   - Open chat with a doctor
   - Click video camera icon
   - Should see "Calling..." and your own video

2. **Browser B (Receiver)**:
   - Login as Doctor (different user)
   - Go to /video.html directly OR wait for the call
   - Should see a modal popup with "Accept" and "Reject" buttons

### 5. **Common Issues**

**If modal doesn't appear:**
- Check browser console for JavaScript errors
- Verify both users are logged in
- Ensure WebSocket connection is active
- Make sure you're not on the same user in both browsers

**If video doesn't work:**
- Grant camera/microphone permissions
- Use HTTPS or localhost (browsers require this)
- Check if camera is already in use by another app

**If stuck on "Calling...":**
- The receiver might not have video.html open
- WebSocket might not be connected
- Try refreshing both browsers

### 6. **Manual Test**
Open browser console and type:
```javascript
// Check if variables are defined
console.log('Sender ID:', senderId);
console.log('Recipient ID:', recipientId);
console.log('Recipient Name:', recipientName);
console.log('Stomp Client:', stompClient);
```

### 7. **Direct Video Page Test**
1. Browser A: Navigate to `http://localhost:3000/video.html` manually
2. Should ask for camera permission
3. Should see local video

If this doesn't work, camera permissions might be blocked.

---

## Code Changes Made
- Fixed `docName` → `recipientName` in modal
- Added REJECT signal handling
- Added accept/reject functions
- Modal shows automatically when OFFER signal received

## Next Steps
1. Hard refresh both browsers (Ctrl+Shift+R)
2. Test the call flow
3. If still not working, share console errors
