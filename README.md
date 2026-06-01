# 🛒 GrocerySplit

Split grocery bills with your family — upload a receipt, share a link, everyone swipes to claim their items.

---

## How it works

1. **You** upload a Walmart (or any grocery) receipt screenshot
2. AI reads every item, price, and tax — and finds product images
3. You get a **unique shareable link per person**
4. Each person opens their link and **swipes** through items:
   - → right = **Share** (split cost with others who also share)
   - ↓ down = **Mine** (I'll pay for this myself)
   - ← left = **Skip** (not eating this)
5. Your dashboard shows **exactly what everyone owes**, including tax

---

## Deploy to Vercel (step by step)

### Step 1 — Get your Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Click **API Keys** in the sidebar → **Create Key**
4. Copy the key — you'll need it in Step 4

---

### Step 2 — Put the code on GitHub

1. Go to [github.com](https://github.com) and sign in (create a free account if needed)
2. Click the **+** icon (top right) → **New repository**
3. Name it `grocerysplit`, leave it **Private**, click **Create repository**
4. On your computer, open a terminal in this project folder and run:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/grocerysplit.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your GitHub username shown on the page after creating the repo.

---

### Step 3 — Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New… → Project**
3. Find `grocerysplit` in the list and click **Import**
4. Under **Framework Preset**, Vercel should auto-detect **Vite** — if not, select it manually
5. Leave all other settings as-is for now — don't click Deploy yet

---

### Step 4 — Add your API key

Still on the Vercel import screen:

1. Expand the **Environment Variables** section
2. Add a new variable:
   - **Name:** `VITE_ANTHROPIC_API_KEY`
   - **Value:** paste your Anthropic API key from Step 1
3. Click **Add**
4. Now click **Deploy** 🚀

Vercel will build and deploy in about 60 seconds. You'll get a live URL like:
`https://grocerysplit-yourname.vercel.app`

---

### Step 5 — Share with your sisters!

1. Open your live URL
2. Upload a receipt screenshot
3. Add your sisters' names
4. Copy each person's survey link and send it via text/WhatsApp
5. Check your dashboard as they respond

---

## Running locally (optional)

If you want to test on your own computer before deploying:

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env.local
# Then open .env.local and paste your API key

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project structure

```
grocerysplit/
├── src/
│   ├── components/
│   │   ├── SetupView.jsx      # Receipt upload + people entry
│   │   ├── SurveyView.jsx     # Swipe interface for family members
│   │   ├── DashboardView.jsx  # Totals + share links
│   │   ├── SwipeCard.jsx      # The swipeable item card
│   │   └── ProductImage.jsx   # Image fetching + display
│   ├── lib/
│   │   ├── api.js             # Claude API + image fetching
│   │   └── utils.js           # Helpers (encode, format, etc.)
│   ├── App.jsx                # Root + URL-based routing
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles + design tokens
├── index.html
├── vite.config.js
├── package.json
└── .env.example
```

---

## Notes

- **No database needed** — survey responses are stored in each person's browser localStorage. When they open the link and submit, the data lives on their device. Your dashboard reads responses from your own device (so you and your sisters should be on the same network, OR — for across devices — host a tiny backend. For most families sharing one household this works great as-is.)
- **Images** come from Open Food Facts (real product photos for branded items) with an Unsplash fallback for everything else.
- **Tax** is split proportionally: if you're paying for 40% of the grocery value, you pay 40% of the tax.
