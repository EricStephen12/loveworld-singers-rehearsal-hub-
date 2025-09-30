# 🔐 LWSRHP Admin Panel - Individual User Accounts

## ⚠️ IMPORTANT - READ THIS FIRST!

**Each admin now has their OWN individual account!**

### Why Individual Accounts?

Previously, everyone was using the same `admin` account with password `@admin1234@`. This caused problems:
- ❌ When one admin made changes, it affected what another admin was editing
- ❌ Changes would overwrite each other
- ❌ No way to track who made what changes
- ❌ Sessions would conflict and clear each other's work

**Now with individual accounts:**
- ✅ Each admin has their own session
- ✅ No more conflicts or overwriting
- ✅ Track who made what changes
- ✅ Better security
- ✅ 8-hour session timeout for security

---

## 👥 Admin Accounts

**ALL ADMINS HAVE FULL ACCESS - NO RESTRICTIONS**

### 🟢 Super Administrator
**Individual account for Super Admin**

- **Username:** `superadmin`
- **Password:** `@superadmin2024@`
- **Email:** superadmin@lwsrhp.com
- **Role:** Admin (Full Access)
- **Permissions:** Everything

---

### 🟢 Admin User 1
**Individual account for Admin Team Member 1**

- **Username:** `admin1`
- **Password:** `@admin1_2024@`
- **Email:** admin1@lwsrhp.com
- **Role:** Admin (Full Access)
- **Permissions:** Everything

---

### 🟢 Admin User 2
**Individual account for Admin Team Member 2**

- **Username:** `admin2`
- **Password:** `@admin2_2024@`
- **Email:** admin2@lwsrhp.com
- **Role:** Admin (Full Access)
- **Permissions:** Everything

---

### 🟢 Admin User 3
**Individual account for Admin Team Member 3**

- **Username:** `admin3`
- **Password:** `@admin3_2024@`
- **Email:** admin3@lwsrhp.com
- **Role:** Admin (Full Access)
- **Permissions:** Everything

---

### 🟢 Admin User 4
**Individual account for Admin Team Member 4**

- **Username:** `admin4`
- **Password:** `@admin4_2024@`
- **Email:** admin4@lwsrhp.com
- **Role:** Admin (Full Access)
- **Permissions:** Everything

---

## 📋 How to Use

### 1. **Assign Accounts to Your Team**
   - Give each admin team member their own username and password
   - Don't share accounts between people
   - Keep passwords secure

### 2. **Login Process**
   - Go to `/admin` page
   - Enter YOUR assigned username and password
   - You'll see your name in the top right corner
   - Session lasts 8 hours, then you'll need to login again

### 3. **What You'll See**
   - **Sidebar (when expanded):** Shows your full name, username, and role
   - **Top Header:** Shows your name and role badge
   - **Green dot:** Indicates you're logged in

### 4. **Session Management**
   - Sessions expire after 8 hours for security
   - You can logout anytime using the "Logout" button
   - Each person's session is independent

---

## 🔒 Security Best Practices

1. **Don't Share Your Password**
   - Each person should use their own account
   - Don't give your password to others

2. **Change Default Passwords**
   - After first login, consider changing your password
   - Use strong, unique passwords

3. **Logout When Done**
   - Always logout when finished
   - Especially on shared computers

4. **Report Issues**
   - If you see someone else's name when you login, logout immediately
   - Report any suspicious activity

---

## 🆘 Troubleshooting

### "Invalid username or password"
- Check you're using the correct username (case-sensitive)
- Check you're using the correct password
- Make sure there are no extra spaces

### "Session expired"
- Your 8-hour session has ended
- Just login again with your credentials

### "Seeing someone else's work"
- This should NOT happen anymore with individual accounts
- If it does, logout and report the issue immediately

### "Can't access certain features"
- Check your role (Editor has limited access)
- Contact Super Admin if you need more permissions

---

## 📞 Need Help?

Contact the Super Administrator if you:
- Forgot your password
- Need your account activated/deactivated
- Need different permissions
- Experience any issues

---

## 🔄 Migration from Old System

**Old System (Deprecated):**
- Username: `admin`
- Password: `@admin1234@`
- ❌ **DO NOT USE THIS ANYMORE!**

**New System:**
- Each person has their own account (see above)
- ✅ **Use your assigned account**

---

## 📝 Notes for Developers

If you need to add more admin accounts, edit the `ADMIN_USERS` array in `/src/app/admin/page.tsx`:

```typescript
{
  id: 'admin-6',
  username: 'newadmin',
  email: 'newadmin@lwsrhp.com',
  password: '@newadmin_2024@',
  fullName: 'New Admin Name',
  role: 'admin',
  createdAt: new Date().toISOString()
}
```

**Roles:**
- `super_admin` - Full access to everything
- `admin` - Manage content, users, media
- `editor` - Edit content only

---

## ✅ Summary

- ✅ Each admin has their own account
- ✅ No more session conflicts
- ✅ No more overwriting each other's work
- ✅ Better security and tracking
- ✅ 8-hour session timeout
- ✅ Individual accountability

**Remember:** Use YOUR assigned account, not the old shared `admin` account!

---

**Last Updated:** 2025-09-30
**Version:** 2.0 (Individual Accounts System)

