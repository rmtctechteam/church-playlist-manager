const express = require('express');
const cheerio = require('cheerio');

const LECTIONARY_URL = 'https://marthoma.in/lectionary/';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function createLectionaryRouter() {
  const router = express.Router();

  function formatDateForMatch(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTHS[d.getMonth()];
    return { day, month };
  }

  function extractEnglishTheme(rawTheme) {
    // Theme format: "Malayalam text; English text" or "Malayalam; label; English text"
    // Split on semicolons and take the last non-empty segment as English
    const parts = rawTheme.split(';').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return rawTheme.trim();
    // The last part is the English theme
    return parts[parts.length - 1];
  }

  function parseLectionaryEntry($, li) {
    const dateFld = $(li).find('.date-fld').text().trim();
    const monthFld = $(li).find('.month-fld').text().trim();
    const theme = $(li).find('.lec-title').text().trim();

    const readings = {};
    $(li).find('.reading-list').each((_, readingList) => {
      const label = $(readingList).find('.reading-left span').text().trim();
      const refs = [];
      $(readingList).find('.reading-content').each((_, rc) => {
        const ref = $(rc).text().trim();
        if (ref) refs.push(ref);
      });
      readings[label] = refs;
    });

    return { day: dateFld, month: monthFld, theme, readings };
  }

  async function fetchLectionaryPage(pageNum) {
    const url = pageNum <= 1 ? LECTIONARY_URL : `${LECTIONARY_URL}page/${pageNum}/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch lectionary page ${pageNum}: ${res.status}`);
    return res.text();
  }

  async function findLectionaryEntry(dateStr) {
    const { day, month } = formatDateForMatch(dateStr);

    // Try pages 1 through 5 (covers special occasions + monthly pages)
    for (let page = 1; page <= 5; page++) {
      let html;
      try {
        html = await fetchLectionaryPage(page);
      } catch (_) {
        break;
      }

      const $ = cheerio.load(html);

      // Search through regular lectionary entries (not special-lectionary)
      const entries = $('.lectionary-list:not(.special-lectionary) li');
      for (let i = 0; i < entries.length; i++) {
        const entry = parseLectionaryEntry($, entries[i]);
        if (entry.day === day && entry.month === month) {
          return entry;
        }
      }
    }

    return null;
  }

  // GET /api/lectionary?date=YYYY-MM-DD
  router.get('/', async (req, res) => {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
    }

    let entry;
    try {
      entry = await findLectionaryEntry(date);
    } catch (err) {
      return res.status(502).json({ error: 'Could not reach the lectionary website' });
    }

    if (!entry) {
      return res.status(404).json({ error: `No lectionary entry found for ${date}` });
    }

    const theme = extractEnglishTheme(entry.theme);

    // Collect lessons from Lessons + Epistle Gospel only (exclude Evening Reading)
    const lessons = [];
    if (entry.readings['Lessons']) lessons.push(...entry.readings['Lessons']);
    if (entry.readings['Epistle Gospel']) lessons.push(...entry.readings['Epistle Gospel']);

    res.json({
      theme,
      bibleLessons: lessons.join(', '),
    });
  });

  return router;
}

module.exports = { createLectionaryRouter };
