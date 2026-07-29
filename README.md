# Shreya's Portfolio

## For the designer — how to update content without touching code

### Adding a new case study
1. Create a new file in `/content/case-studies/` e.g. `my-new-project.md`
2. Start the file with this block (called frontmatter):

```
---
title: "My Project Title"
date: "2024-06-01"
tags: ["UX Research", "Mobile"]
thumbnail: "/images/projects/my-project.jpg"
description: "One or two sentence summary shown on cards."
featured: true
---
```

3. Write your case study content below in regular text (Markdown)
4. Set `featured: true` to show it on the homepage (only the 3 newest featured ones appear)
5. Add your thumbnail image to `/public/images/projects/`

That's it — the page is automatically created at `/case-studies/my-new-project`

---

### Adding play/gallery images
Drop any `.jpg`, `.png`, `.gif`, or `.webp` image into `/public/images/play/`
The gallery updates automatically on next build.

---

### Adding your profile photo
Save your photo as `/public/images/about/profile.jpg`

---

### Adding your letter block images
Save each letter image as `/public/images/letter-blocks/s.png`, `h.png`, `r.png`, `e.png`, `y.png`, `a.png`, `k.png`

---

### Updating your LinkedIn / email
Open `components/Footer.jsx` and update the `href` values:
- LinkedIn: change `https://linkedin.com` to your profile URL
- Email: change `your@email.com` to your email address

---

## Folder structure
```
/content/case-studies/    ← your Markdown case study files
/public/images/
  letter-blocks/          ← S H R E Y A K block images
  projects/               ← case study thumbnails
  play/                   ← gallery images
  about/                  ← your profile photo
/components/              ← site components (don't edit)
/pages/                   ← site pages (don't edit)
/lib/                     ← data layer (don't edit)
/styles/                  ← global CSS (don't edit)
```
