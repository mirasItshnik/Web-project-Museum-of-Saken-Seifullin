# Saken Seifullin Museum

We built this website as a team project for Introduction to Web Technologies. Our site introduces Saken Seifullin’s life, literary heritage and museum collection. For Assignment 6, we continued working on the same project and added jQuery to its interactive features.

**Group:** SE-2533

**Team:** Miras Kaldybek, Muratov Maksat, Sabira Baikadamova

- [Our website](https://mirasitshnik.github.io/Web-project-Museum-of-Saken-Seifullin/)
- [Our repository](https://github.com/mirasItshnik/Web-project-Museum-of-Saken-Seifullin)

## What we used

We use HTML, CSS, Bootstrap 5.3.3, JavaScript and jQuery 3.7.1. Bootstrap helps us with the responsive layout, navigation and modals. We use jQuery for events, filtering, DOM updates, effects and validation.

## Our pages

- **Home:** an introduction to the museum and its highlights.
- **Biography:** Seifullin’s life and key events.
- **Exhibitions:** an overview of the exhibitions.
- **Collection:** exhibit search, category filters, sorting and detail modals.
- **Gallery:** a photo carousel, viewer with previous/next buttons, zoom and random facts.
- **Visit & Feedback:** a ticket calculator, booking preview, field validation and visitor reviews.
- **Contacts:** the museum map, contact links, FAQ, opening status and a way to report incorrect contact information.
- **Museum History:** a timeline and animated museum statistics.
- **Poetry Wall:** poetry search, category filters, detail modals, text copying and additional cards created from an array.

## What we changed with jQuery

We rewrote collection interactions, gallery controls and booking validation using jQuery. We also use it for the history timeline, FAQ and Poetry Wall.

We attach events with `.on()`. Delegation lets visitors open poem cards that are created after the page has loaded. We use `.find()`, `.closest()`, `.parent()` and `.siblings()` to work with related elements, and `.text()`, `.html()`, `.val()`, `.attr()` and `.prop()` to update the page.

Our effects have specific uses: FAQ answers slide open, confirmations fade in and out, and museum statistics count up when they appear on screen. The gallery has − / 100% / + controls for photo zoom.

We kept the previous plain JavaScript versions in `js/old-js-version.js` and the individual archive files so they can be compared with the jQuery version. We do not connect these archives to our pages.

## Forms

Our booking form checks the visitor’s name, email, date, time and ticket quantities. Large groups must have at least 10 visitors and provide an organization name. The calculator shows the ticket and service costs before the booking preview. Booking and reviews are demonstrations; we do not store them on a server.

On Contacts, visitors can report a possible mistake in a phone number, email, address or map location. They describe the issue and can suggest a correction. We validate the correction according to its type, then prepare an email draft. The visitor reviews and sends it in their email app; our website does not send it automatically.

Contacts and Feedback use the same configured opening hours: Monday closed, Tuesday–Friday 10:00–18:00, Saturday–Sunday 10:00–17:00. The calculation uses the visitor’s device local time.

## Project structure

- HTML pages are in the project root.
- `css/` contains our styles; `css/site.css` is the main stylesheet.
- `images/` contains the website images.
- `js/main.js` handles Collection, Gallery and Feedback.
- `js/assignment4-jquery.js` handles Museum History, Poetry Wall and Contacts. We kept its existing filename.
- `js/old-js-version*.js` contains the comparison archives.
- `js/script.js` is a legacy file and is not connected to the current pages.

## How to run

1. Open the project folder in VS Code.
2. Open `index.html` with Live Server.
3. Use an internet connection to load Bootstrap, jQuery and external maps.

No build step is needed. When adding images, we use `images/filename` in HTML and `../images/filename` in CSS.
