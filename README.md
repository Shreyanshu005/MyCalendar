# Responsive Calendar Application

This project is a responsive calendar application built with **React**, **Tailwind CSS**, and **Framer Motion**. The application allows users to view a calendar, navigate between months, and manage events (add, search, and remove). It also includes functionality to export events as JSON or CSV files.

---

## Features

- **Responsive Design**: Fully responsive layout for all screen sizes.
- **Interactive Calendar**: Display days of the month and highlight current dates.
- **Event Management**:
  - Add new events with title, start time, end time, description, and category.
  - Search and filter events by title.
  - Remove events.
- **Export Events**:
  - Export events as JSON.
  - Export events as CSV.
- **Smooth Animations**: Page elements are animated using Framer Motion.

---

## Technologies Used

### Frontend
- **React**: Component-based library for building the user interface.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Framer Motion**: Library for animations.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/responsive-calendar-app.git
   ```

2. Navigate to the project directory:
   ```bash
   cd responsive-calendar-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

---

## Usage

### Navigation
- **Previous/Next Month**: Use the "Previous" and "Next" buttons to navigate between months.
- **Add Events**:
  1. Click on a specific date to open the event modal.
  2. Fill in the event details (title, time, description, category).
  3. Click "Add Event" to save.
- **Search Events**:
  - Use the search bar to find events by title.
- **Remove Events**:
  - Click "Remove" next to an event to delete it.
- **Export Events**:
  - Click "Export JSON" to download events in JSON format.
  - Click "Export CSV" to download events in CSV format.

---

## Project Structure

```
responsive-calendar-app/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Calendar.js
│   │   ├── DayCell.js
│   │   ├── EventModal.js
│   │   └── Header.js
│   ├── App.js
│   ├── index.js
│   ├── styles/
│   │   └── index.css
│   └── utils/
│       ├── calendarUtils.js
│       ├── eventUtils.js
│       └── exportUtils.js
├── .gitignore
├── package.json
├── README.md
└── tailwind.config.js
```

---

## Customization

- **Theme Customization**:
  - Modify the `tailwind.config.js` file to adjust colors, fonts, and other Tailwind CSS configurations.
- **Animations**:
  - Customize animations in components using Framer Motion properties.

---

## Deployment

1. Build the project for production:
   ```bash
   npm run build
   ```

2. Deploy the `build/` folder to your hosting provider (e.g., Netlify, Vercel, or GitHub Pages).

---

## Enhancements

- Add recurring events.
- Enable drag-and-drop event management.
- Implement calendar syncing with Google or Outlook.
- Add user authentication for event data storage.

---


