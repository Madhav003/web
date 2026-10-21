# Movie Logger - HTML Explanation

## 1. What this page does

This page is a small movie tracker app. It lets the user:

- add a movie name
- choose a star rating
- save the movie through the Node.js API into MySQL
- view the saved movies as cards
- delete movies
- import movies from a JSON file
- show location data if geolocation is available

It is built as a single front-end page using HTML, CSS, and JavaScript.

---

## 2. Overall structure of the HTML

The file is divided into three main sections:

### A. Head section
This part loads external libraries and fonts:

- Bootstrap CSS for layout and component styling
- Bootstrap JS for dropdown behavior
- Tailwind CDN for utility-based styling
- Google Fonts for the elegant movie-like typography
- a small custom style block for project-specific tweaks

This is where the page brings in the frameworks and styles.

### B. Body section
This is the visible page layout:

- a large centered container
- a title: “Movie Logger”
- a link to the geolocation page
- a form with:
  - movie title input
  - rating selector
  - add button
- a drop area that accepts JSON files
- a grid where movie cards are displayed

### C. Script section
This contains the logic:

- save movies through the Node.js API
- load saved movies from MySQL when the page opens
- render movie cards dynamically
- add new movies
- delete movies
- handle drag-and-drop JSON import
- try to get user location with browser geolocation

---

## 3. Where Bootstrap is used

Bootstrap is used for the layout and reusable UI pieces.

Examples in this file:

- container: used to center the content
- row and col-auto: used to arrange the form controls
- form-control: styles the input field
- btn, btn-outline-secondary, btn-sm, btn-light: styles buttons
- dropdown, dropdown-menu, dropdown-toggle: powers the rating selector
- border, rounded, overflow-hidden, shadow-sm: improve card appearance

So Bootstrap is being used mainly for fast, consistent UI building.

---

## 4. Where Tailwind is used

Tailwind is used for quick utility styling.

Examples:

- min-h-screen: makes the page take full viewport height
- text-center: centers text
- mb-3, mb-4, py-5: spacing utilities
- font-semibold: makes the heading bold
- text-[clamp(...)] : responsive font sizing
- bg-[#f5efe7]: custom warm background color on movie cards
- border-[#e6ddcf]: border color
- tracking-[.2em]: spacing for star ratings
- rounded, shadow-sm, overflow-hidden: utility styling for cards

Tailwind here is used for smaller styling adjustments quickly without writing a lot of CSS.

---

## 5. What the custom CSS does

The custom CSS block is small and only handles the page-specific styling that the frameworks do not cover.

Examples:

- body sets the font to Jost and uses a paper-like beige background
- h1 uses Cormorant Garamond to make the title look more cinematic
- .poster sets the poster image ratio to 2:3 and makes it cover its container
- .drop-zone.drag-active changes the drop area when the user drags a file over it

This means the code combines:

- Bootstrap for layout and components
- Tailwind for quick utility styling
- custom CSS for typography and special effects

---

## 6. How the page works step by step

### Step 1: page loads
When the page opens, JavaScript runs.

It does this:

- requests the saved movie data from MySQL through the API

### Step 2: movie list is rendered
The function displayMovies() creates the card layout for each movie.

Each movie card contains:

- poster image
- movie title
- star rating
- delete button

### Step 3: add movie
When the user clicks Add Movie:

- it reads the text from the input
- checks that it is not empty
- asks the browser for geolocation
- if geolocation succeeds, it saves latitude and longitude
- if geolocation fails, it still saves the movie without coordinates
- saves the movie through the API into MySQL
- re-renders the page

### Step 4: delete movie
When the delete button is clicked:

- the movie is removed from the array
- the delete request is sent to the API
- the page is re-rendered

### Step 5: import JSON
The drag-and-drop area allows the user to drag a JSON file.

The file is expected to look like this:

```json
[
  { "title": "Movie A", "rating": 5 },
  { "title": "Movie B", "rating": 4 }
]
```

If the JSON is valid, each item is added to the movies list and displayed on the page.

---

## 7. What the geolocation logic does

The page uses the browser’s geolocation API:

```js
navigator.geolocation.getCurrentPosition(...)
```

This lets it get the user’s current coordinates.

If permission is granted, it saves:

- latitude
- longitude

These values are then stored with each movie object.

This is useful for a movie tracker where the user wants to remember where they watched a movie.

---

## 8. What the fallback poster logic does

The code tries to generate a poster URL using Picsum:

```js
https://picsum.photos/seed/.../400/600
```

If the image fails to load, the page uses a fallback SVG image generated in JavaScript.

That fallback contains:

- warm background colors
- a bordered poster frame
- the movie title written inside

This prevents broken images from showing on the page.

---

## 9. How the JavaScript is structured

The script contains several main functions:

- saveMovies()
  Movie writes are handled by the Node.js API and MySQL

- setRating(value)
  Changes the selected rating and updates the rating label

- buildFallbackPoster(title)
  Creates an SVG poster if the external image does not load

- displayMovies()
  Builds the movie cards in the page

- getMovieLocation(success, fail)
  Requests the user’s location

- addMovie()
  Adds a new movie and stores it

- deleteMovie(index, event)
  Removes a movie from the list

- drag-and-drop event handlers
  Handle importing JSON files

This structure keeps the app easy to understand.

---

## 10. Summary

This page is a small front-end movie tracking app built using:

- Bootstrap for layout and UI controls
- Tailwind for quick utility styling
- custom CSS for special design needs
- JavaScript for dynamic functionality

It is a good example of mixing libraries and custom code to create a clean and interactive interface without making the file too complicated.

## 11. Authentication and role-based access

The Node server in `app.js` provides a small demonstration authentication layer:

- `jay / 1234` signs in as an `admin`
- `student / 1234` signs in as a regular `user`
- authenticated users can view and add movies
- administrators can additionally delete movies and import JSON files
- `/api/admin` is protected on the server and returns `403` for regular users

The browser stores the signed-in user and movie list in `localStorage`. The demo users
and passwords are kept in the simple JavaScript server, matching the supplied example.
This is suitable for a classroom demonstration only, not production authentication.
