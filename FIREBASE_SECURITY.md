# 🔥 Firebase Security Rules Configuration

To secure your "Riphah Scinence Academy,Rachna Town Admin Panel", you need to apply these security rules in your Firebase Console.

## 1. Firestore Database Rules

1. Go to **Firebase Console** > **Firestore Database** > **Rules** tab.
2. Copy and paste the following code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Allow authenticated access to specific collections
    match /students/{studentId} { allow read, write: if isAuthenticated(); }
    match /teachers/{teacherId} { allow read, write: if isAuthenticated(); }
    match /attendance/{attendanceId} { allow read, write: if isAuthenticated(); }
    match /fees/{feeId} { allow read, write: if isAuthenticated(); }
    match /expenses/{expenseId} { allow read, write: if isAuthenticated(); }
    match /results/{resultId} { allow read, write: if isAuthenticated(); }
    match /school_exams/{examId} { allow read, write: if isAuthenticated(); }
    match /notices/{noticeId} { allow read, write: if isAuthenticated(); }
    match /staff/{staffId} { allow read, write: if isAuthenticated(); }
    match /classes/{classId} { allow read, write: if isAuthenticated(); }

    // Default deny for everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**.

---

## 2. Storage Rules

1. Go to **Firebase Console** > **Storage** > **Rules** tab.
2. Copy and paste the following code:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Allow authenticated users to upload images (max 5MB)
    match /{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() 
                   && request.resource.contentType.matches('image/.*')
                   && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

3. Click **Publish**.

---

## 🛡️ What do these rules do?
- **Authentication Required**: Only logged-in users (Admins/Staff) can access data.
- **Collection Locking**: Explicitly whitelists only the collections we use (`students`, `teachers`, etc.). Unknown collections are blocked.
- **Storage Safety**: Ensures only **images** are uploaded and restricts file size to **5MB**.
