---
# The program to copy when adding one (Programs → Recipes → Add a program in
# AGENTS.md). draft: true keeps it off the site, and the build checks it, so
# every field here works. In your copy: delete these comments and the draft
# line, replace every value with the organisation's own, and delete the
# fields the program does not have.
draft: true
status: open
title: Example Program
subtitle: Its Tagline as the Flyer Gives It
summary: One sentence on what students will learn and why it matters.
area: womens-learning
# One part for a regular pattern, never a part per date. BYDAY is the
# weekday the flyer gives, and the build stops if start is not on it.
schedule:
  - start: 2027-01-09
    time: 10:00 AM–12:00 PM
    repeat: FREQ=WEEKLY;INTERVAL=2;BYDAY=SA;COUNT=4
audience: Adult women
format: Online & on-site
venue: masjid-istiqlal
location: Sabeel Classroom at Masjid Istiqlal or online via Zoom
fee:
  - $40 early bird, through Dec 31
  - $50 from Jan 1
highlight: Register by December 31 and save $10.
registration:
  zeffy: example-program
deadline: Register by Wednesday, January 6
outcomes:
  - The first thing students will learn
  - The second thing students will learn
  - The third thing students will learn
instructors:
  - sameera-shah
expect: |
  How sessions run, in the organization's words:

  - **Lesson** — what each session teaches
  - **Discussion** — questions and reflection together
policies: Attendance, refunds, and recording, in the organization's words.
# Add these once the folder has its flyer and program image (Programs →
# Program images in AGENTS.md):
# image: ./image.webp
# imageAlt: "Title artwork: Example Program, Its Tagline as the Flyer Gives It"
# flyer: ./flyer.webp
---

What the program is about, in the organization's words. This text is the
page's “Program details”, or “What to know” when the program has no
`outcomes`.

## Session by session

1. **January 9** — the first session’s topic
2. **January 23** — the second session’s topic

Taught by [Ustadhah Sameera Shah](/teachers-and-team/sameera-shah/).
