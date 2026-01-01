# 🔐 כספת מפתחות - Secrets Vault

## ⚠️ אזהרה חשובה!
**קובץ זה הוא רק לתיעוד. אל תשמור כאן ערכים אמיתיים!**

---

## 📋 רשימת מפתחות API

### 1. 📦 Database (Supabase PostgreSQL)
| שם | משתנה | מיקום |
|----|-------|-------|
| Database URL | `DATABASE_URL` | `.env`, `server/.env` |
| **תיאור**: חיבור לבסיס הנתונים PostgreSQL ב-Supabase |
| **פורמט**: `postgresql://user:password@host:port/database` |
| **רגישות**: 🔴 גבוה מאוד |

---

### 2. 🔑 JWT Secret
| שם | משתנה | מיקום |
|----|-------|-------|
| JWT Secret | `JWT_SECRET` | `.env`, `server/.env` |
| **תיאור**: מפתח הצפנה ליצירת ואימות טוקנים |
| **פורמט**: מחרוזת אקראית (מינימום 32 תווים) |
| **רגישות**: 🔴 גבוה מאוד |

---

### 3. ☁️ Supabase Keys
| שם | משתנה | מיקום |
|----|-------|-------|
| Supabase URL | `NEXT_PUBLIC_SUPABASE_URL` | `.env` |
| Supabase Key | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | `.env` |
| **תיאור**: הגדרות חיבור ל-Supabase |
| **רגישות**: 🟡 בינוני (Public keys) |

---

## 📁 מיקום קבצי Environment

```
📂 New folder/
├── 📄 .env                 ← מפתחות Frontend
├── 📄 .env.example         ← תבנית (בטוח ל-Git)
└── 📂 server/
    └── 📄 .env             ← מפתחות Backend
```

---

## 🛡️ הנחיות אבטחה

### ✅ מותר:
- לשמור מפתחות רק בקבצי `.env`
- להשתמש ב-`.env.example` כתבנית
- לשנות מפתחות באופן קבוע

### ❌ אסור:
- להעלות קבצי `.env` ל-Git
- לשתף מפתחות בצ'אטים
- להשאיר מפתחות בקוד

---

## 🔄 איך להחליף מפתחות

### Database URL:
1. לך ל-[Supabase Dashboard](https://supabase.com/dashboard)
2. Settings → Database → Connection string
3. העתק והדבק ב-`.env`

### JWT Secret:
```bash
# צור מפתח חדש:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Supabase Keys:
1. לך ל-[Supabase Dashboard](https://supabase.com/dashboard)
2. Settings → API
3. העתק את ה-URL ו-anon/public key

---

## 🚀 הגדרה ב-Production (Vercel)

ב-Vercel לך ל:
**Project Settings → Environment Variables**

הוסף את כל המשתנים:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

---

## 📊 סטטוס מפתחות נוכחי

| משתנה | Root `.env` | Server `.env` | Production |
|-------|-------------|---------------|------------|
| DATABASE_URL | ✅ | ✅ | ⚠️ צריך להגדיר |
| JWT_SECRET | ✅ | ✅ | ⚠️ צריך להחליף |
| SUPABASE_URL | ✅ | ❌ | ⚠️ צריך להגדיר |
| SUPABASE_KEY | ✅ | ❌ | ⚠️ צריך להגדיר |

---

## 🔐 המלצות לחיזוק אבטחה

1. **החלף את JWT_SECRET** - הנוכחי ("secret_key_change_me") חלש!
2. **הוסף rate limiting** - להגנה מפני התקפות brute force
3. **הפעל RLS ב-Supabase** - Row Level Security
4. **צור backup לסודות** - שמור במקום מוגן (Password Manager)

---

*עודכן לאחרונה: 01/01/2026*
