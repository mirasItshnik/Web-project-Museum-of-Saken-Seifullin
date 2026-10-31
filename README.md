# Saken Seifullin Museum — учебный сайт

## Структура
- `index.html` — главная страница и точка входа.
- Остальные `.html` — страницы сайта; находятся в корне для простой навигации.
- `css/site.css` — основной стиль, ранее `style1.css` в корне.
- `css/base.css` — базовые стили.
- `css/style1.css`, `css/maks.css` — дополнительные существующие стили.
- `js/` — JavaScript: интерактивные элементы и логика страниц.
- `images/` — все изображения.

## Запуск
Откройте `index.html` через расширение Live Server в VS Code.
При добавлении изображений используйте путь `images/имя-файла` в HTML и `../images/имя-файла` в CSS.

## jQuery assignment

jQuery 3.7.1 loads from the official CDN before our scripts. Open the site with Live Server. An internet connection is needed for jQuery and Bootstrap. JavaScript lives in external files; no inline event attributes are used.

### Rewritten features and comparison

- `js/main.js`: delegated collection details and filters, gallery viewer and useful effects, booking validation and calculation. Each rewritten feature has a comparison comment.
- `js/assignment4-jquery.js`: history timeline and animated statistics, poetry filtering and generated cards, FAQ and contact-information correction drafts.
- `js/old-js-version.js`: archived plain JavaScript for comparison, never linked to a page. Per-author archives are retained too.

### Demonstrate at defense

1. Collection: search, category, title/year sorting, then Museum order/Clear Filters; open multiple objects and compare their metadata.
2. Gallery: carousel counter, previous/next, − / 100% / + photo zoom and Fact of the Day.
3. Feedback: submit blank; fix name/email and see errors disappear; test a past date, Monday, no time, negative/fractional tickets and group below 10. A group also needs an organization. Verify reset updates prices and slots.
4. Reviews: choose stars and enter at least 10 characters; confirmation fades in and out with a callback.
5. Poetry: generate extra cards using Show More and open one. Its click is caught by a delegated handler attached before the card existed.
6. Contacts: open FAQ answers and the contact-information correction form. Choose a topic, describe the issue and optionally suggest a correction. Test invalid/valid phone numbers and email addresses, prepare an email draft, then edit a field to clear the stale draft. No email is sent automatically.
7. Museum History: switch timeline years and scroll to Museum Key Metrics to see each counter animate once.

### Methods to explain

- `.text()` treats content as text; `.html()` parses markup and is used here with fixed/trusted content.
- `.attr()` reads/writes HTML attributes; `.prop('checked')` reads the checkbox's current state, unlike the initial `checked` attribute.
- `.find()`, `.closest()`, `.parent()`, `.siblings()`, `.each()` traverse actual DOM relationships. Selectors include IDs, classes, elements, attributes and filters such as `:checked`, `:first`, `:not()`.
- All application event listeners use `.on()`. Effects include fadeIn, fadeOut, slideDown, slideUp and slideToggle, with durations/callbacks.
- Existing classes control selection and validation states. Gallery zoom uses `.css('transform', ...)` to scale the photo; this remains an exception to the assignment's class-only appearance requirement. jQuery effects also set temporary animation styles internally.
- Per-ticket errors, extra poem cards, the contact-information correction form and price breakdown are created in JavaScript. Feedback booking has no phone field. Contacts validates an optional suggested phone/email correction only when supplied; its draft is opened in the visitor’s email app.
- Booking and reviews are demos. The contact correction feature prepares a mailto draft; the visitor reviews and sends it in an email app. Browser validation does not secure a real service: a server must validate independently, including dates, quantities and availability.

### Configured opening hours

Contacts status and Feedback booking use the same schedule: Monday closed; Tuesday–Friday 10:00–18:00; Saturday–Sunday 10:00–17:00. Calculations currently use the visitor’s device local date/time. This documents the project configuration, not independently verified museum opening hours.

### Remaining submission checks

- Continue in the existing Web-assigment-1 team repository. Before submission, verify real commits from each member: at least four across three different days (six if solo).
- Compare HTML/CSS to your midterm freeze commit: that baseline is not present here, so freeze compliance cannot be certified from this folder alone.
- Browser console and visual checks still need a real Live Server browser session. Syntax/static and focused logic checks do not replace that step.
