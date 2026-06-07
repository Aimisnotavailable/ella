# 🌸 Her Secret Garden - Birthday Website

A charming interactive birthday gift website for a friend who loves flowers, books, murder mysteries (Detective Conan), mini gardens, Taylor Swift, and Morse code. Deploy instantly via GitHub Pages.

## 🕵️‍♀️ How It Works

1. **Landing Page** – Warm greeting with falling petals.
2. **Morse Code Gate** – Listen to the Morse code for "prophecy", type it correctly to unlock the garden.
3. **Mini Garden** – Click flowers to play Taylor Swift snippets, reveal a lyric portrait where words light up during "The Prophecy".

## 🚀 Quick Start

1. Clone or download this repository.
2. Place your own 20-30 second Taylor Swift song clips (MP3 format) inside the `audio/` folder:
   - `willow.mp3`
   - `cardigan.mp3`
   - `enchanted.mp3`
   - `lover.mp3`
   - `prophecy.mp3` (for the lyric sync)
   - `blankspace.mp3` (or rename them as you like, then update `songLibrary` in `js/garden.js`)
3. (Optional) Customize the lyric portrait by modifying `assets/portrait-mapping.json`. See the section below.
4. Push to a GitHub repository and enable GitHub Pages from the main branch.

## 🎨 Customizing the Lyric Portrait

The portrait is a 30x30 CSS grid where each cell contains a short lyric snippet. The JSON file `portrait-mapping.json` has two parts:
- `grid`: array of objects with `row`, `col`, `text`, `color` (CSS color) and optional `fontSize`.
- `sync`: time-based mapping for "The Prophecy". Each entry has `start` (seconds), `end`, and `cells` (array of [row, col] to highlight).

To turn a personal photo into a lyric portrait:
1. Convert the image to a 30x30 pixel grayscale bitmap.
2. Map each pixel's brightness to lyric length/darkness: darker pixels get longer, darker-coloured lyrics; lighter pixels get short words or blanks.
3. Fill the grid array accordingly.
4. Adjust the sync map to match your chosen song segment.

## 🎵 Audio Files

For copyright reasons, this project does not include actual Taylor Swift song recordings. You must provide your own short MP3 clips. Consider using excerpts that are 20-30 seconds long and save them in the `audio/` folder with the expected filenames.

## 🔐 Security Note

Access to `garden.html` is protected via `sessionStorage`. The password "prophecy" is only checked on the client side – perfect for a fun puzzle, not for real security.

## 🌟 Credits & Love

Made with love and detective spirit. Happy birthday, dear friend! 🎂🔍