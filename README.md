# Academic Website

Static personal academic website for GitHub Pages. No build step is required.

## Files

- `index.html`: page structure
- `styles.css`: layout and visual styling
- `data/site-data.json`: all editable website content
- `data/images/`: editable image assets used by the site
- `js/main.js`: application entrypoint
- `js/site-data.js`: site data loading
- `js/render-site.js`: DOM rendering
- `js/theme.js`: theme toggle behavior

## Customize

1. Open `data/site-data.json`.
2. Replace the placeholder values with your real name, department, bio, links, research areas, publications, and contact details.
3. Replace files in `data/images/` if you want a different portrait or logo, and update their paths in `data/site-data.json` if needed.
4. Put your CV PDF at `assets/cv.pdf`, or change `cv.href` in `data/site-data.json` to another file path.

## Local preview

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages

1. Create a GitHub repository and push these files.
2. In GitHub, open `Settings > Pages`.
3. Set the source to `Deploy from a branch`.
4. Select your main branch and the `/ (root)` folder.
5. Save. GitHub Pages will publish `index.html` automatically.
