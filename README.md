# Who Am I?

A "guess your character" party game for 2–4 players over Discord (or in person).
Everyone gets a secret character from the same category. You can see everyone
else's character but not your own, and you ask yes/no questions to figure it out.

No server, no accounts, no install. It's plain HTML, CSS and JavaScript.

## Play it

**Offline / locally:** double-click `index.html` to open it in your browser.
Everything works without internet. Only the fonts need a connection; offline, it
falls back to system fonts.

**With friends:** host it on GitHub Pages (below) and share the link once.

### How a round works
1. One person opens **Host a game**, enters 2–4 names, picks a category, and
   presses **Create game code**.
2. Paste the code (starts with `WAI-`) into Discord.
3. Everyone opens the page, goes to **Join with a code**, pastes it, and picks
   their own name.
4. Ask yes/no questions. Press **Reveal mine** when you're done.
5. For the next round, everyone presses **Next round** together.

## Project layout

| File | What it is |
|---|---|
| `index.html` | The page structure |
| `style.css` | Colors, fonts, layout (light and dark mode) |
| `categories.js` | **All the categories and characters. Edit this to add your own.** |
| `app.js` | Game logic: code creation, seeded shuffle, rendering |

## Adding or editing categories

Open `categories.js` and add a block like this:

```js
  "Characters with a pet": [
    "Ash Ketchum",
    "Shaggy",
    "Wallace",
    "Jon Arbuckle"
  ],
```

Keep at least 4 characters per category (one per player); 15+ is better.

> **Everyone must use the same version.** The game code doesn't contain the
> characters. Each copy of the page deals from its own `categories.js`, so if
> your friend's copy has different lists, you'll see different cards. Hosting on
> GitHub Pages solves this since everyone loads the same files.
> (Custom categories made in the app *are* stored inside the code, so those
> always match.)

## Hosting on GitHub Pages

1. Create a new repository on GitHub (e.g. `who-am-i`) and push these files:
   ```bash
   git init
   git add .
   git commit -m "Who Am I? game"
   git branch -M main
   git remote add origin https://github.com/<your-username>/who-am-i.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a
   branch**, choose `main` and `/ (root)`, then **Save**.
3. After a minute your game is at
   `https://<your-username>.github.io/who-am-i/`.

Every push to `main` updates the live site.

## Working in VS Code

- Open the folder: **File → Open Folder…**
- To preview with auto-reload, install the **Live Server** extension, then
  right-click `index.html` → **Open with Live Server**.
