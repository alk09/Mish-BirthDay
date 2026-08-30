# Birthday Surprise ✦

A premium, mobile-first interactive birthday experience built with **HTML5, CSS3, and Vanilla JavaScript**. It works on static hosts such as GitHub Pages, Netlify, and Vercel without a build step or runtime dependencies.

## Features

- Mobile-first responsive layout from 320px upward
- Safe-area support and dynamic viewport units (`svh` / `dvh`)
- Touch-friendly, keyboard-accessible controls
- Guided flow: opening, welcome, gifts, cards, celebration, and final message
- Gifts and cards driven by simple data files
- 100 celebration messages with consecutive-duplicate avoidance
- Temporary confetti effect
- Native `<dialog>` reveal modal with keyboard/Escape support
- Optional local music with autoplay-safe behavior
- `prefers-reduced-motion` and high-contrast support
- LocalStorage persistence for progress and interaction state
- Graceful handling of invalid data, missing media, and storage failures

## Project structure

```text
birthday-surprise/
├── index.html
├── welcome.html
├── gifts.html
├── cards.html
├── celebrate.html
├── final.html
├── css/
│   └── style.css
├── assets/
│   ├── cards/
│   └── gifts/
└── js/
    ├── page.js
    ├── components/
    ├── config/
    ├── data/
    ├── services/
    └── utils/
```

## Customize the birthday person

Edit `js/config/birthdayConfig.js`:

- `name`
- `title`
- `subtitle`
- `welcomeMessage`
- `finalTitle`
- `finalMessage`
- `signature`
- `theme.primary`, `theme.secondary`, `theme.accent`

The final message accepts HTML paragraphs so longer messages remain readable without changing layout code.

## Add a gift

Edit `js/data/gifts.js` and add another object:

```js
{
  id: "gift-4",
  order: 4,
  title: "Your title",
  description: "Short description",
  message: "The revealed message",
  emoji: "🎁",
  image: "assets/gifts/my-gift.svg",
  link: "",
  enabled: true
}
```

A gift needs a unique `id`, `title`, and `message` to render.

## Add a card

Edit `js/data/cards.js`:

```js
{
  id: "card-4",
  order: 4,
  title: "A new card",
  description: "A tiny description",
  message: "The full card message",
  footer: "Your footer",
  emoji: "💌",
  image: "assets/cards/my-card.svg",
  style: "soft",
  enabled: true
}
```

## Add celebration messages

Edit `js/data/celebrations.js` and append strings to the `celebrations` array. Empty/non-string entries are ignored, and the randomizer avoids repeating the previous message when another option exists.

## Add images

Put gift images in `assets/gifts/` and card images in `assets/cards/`. The reveal modal starts with the emoji and replaces it with the image once the image loads, so a missing image will not break the experience.

## Add music

Create `assets/music/` and place an MP3 inside it, for example:

```text
assets/music/birthday.mp3
```

Then set `music.src` in `js/config/birthdayConfig.js`:

```js
music: {
  enabled: true,
  src: "assets/music/birthday.mp3"
}
```

The project does not force autoplay. If audio fails, the music control disables itself without breaking the rest of the site.

## Run locally

Because the site uses native ES modules, serve the project over HTTP instead of opening `index.html` directly with `file://`.

### Python

From the project root:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

### VS Code

Use any static-server extension such as Live Server.

## Deploy

The folder can be uploaded directly to GitHub Pages, Netlify, Vercel, or another static host. No `npm install`, bundler, or build command is required.
