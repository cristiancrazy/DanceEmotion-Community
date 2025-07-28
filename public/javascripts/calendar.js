/**
 * @author Cristian Capraro
 * @description Simple frontend calendar implementation
 * @version 1.0.0
 */

/**
 * Calendar class to manage and display a calendar with activities
 */
"use strict"; // Use strict mode for better error handling and cleaner code
class Calendar {
    // Usage: user must insert the following HTML elements in the body:
    // <div id="calendar" class="table-responsive">
    //    <table class="table table-bordered text-center">
    //    <thead>
    //        <tr>
    //            <th>Lunedì</th>
    //            <th>Martedì</th>
    //            <th>Mercoledì</th>
    //            <th>Giovedì</th>
    //            <th>Venerdì</th>
    //            <th>Sabato</th>
    //            <th>Domenica</th>
    //        </tr>
    //    </thead>
    //    <tbody id="calendar-body">
    //        <!-- Calendar days will be dynamically generated here -->
    //    </tbody>
    // </table>
    // </div>
    // ------------------------------------------------------------------------------
    // And adding two buttons for navigation, like the following:
    // <button id="prev-month" class="btn btn-primary">Previous Month</button>
    // <button id="next-month" class="btn btn-primary">Next Month</button>

    /**
     * Constructor for the Calendar class
     * @param {HTMLElement} calendarBody - The HTML element representing the calendar body
     * @param {HTMLElement} currentMonth - The HTML element displaying the current month
     * @param {HTMLElement} prevMonthBtn - The HTML element for the previous month button
     * @param {HTMLElement} nextMonthBtn - The HTML element for the next month button
     */
    constructor(calendarBody = document.getElementById("calendar-body"), currentMonth = document.getElementById("current-month"), prevMonthBtn = document.getElementById("prev-month"), nextMonthBtn = document.getElementById("next-month")) {
        // Start with today's date
        this.date = new Date(); 
        this.activities = {}; // Store activities for each date
        this.calendarBody = calendarBody;
        this.currentMonth = currentMonth;
        this.prevMonthBtn = prevMonthBtn;
        this.nextMonthBtn = nextMonthBtn;
        this.init(); // Initialize the calendar
    }

    /** 
     * Add activity function
     * @param {Date} date - The date of the activity
     * @param {string} name - The name of the activity
     * @param {string} time - The time of the activity
     * @param {string} className - The CSS class for styling
     */
    addActivity(date, name, time, className) {
        const dateKey = date.toISOString().split("T")[0]; // Format date as YYYY-MM-DD
        if (!this.activities[dateKey]) {
            this.activities[dateKey] = [];
        }
        this.activities[dateKey].push({ name, time, class: className });
    }

    /**
     * Add activities from a JSON string
     * @param {string} json - A JSON string representing an array of activities
     * This function parses the JSON string and adds each activity to the calendar.
     * The expected format of the JSON string is an array of objects, each containing:
     * {
     *   date: "YYYY-MM-DD", // Date of the activity
     *   name: "Activity Name", // Name of the activity
     *   time: "HH:MM - HH:MM", // Time of the activity
     *   className: "CSS class name" // CSS class for styling
     * }
     */
    addActivityJSON(json) {
        // Parse the JSON string to an object
        //console.log("Adding activities from JSON:", json);
        json.forEach(activity => {
            // Ensure the activity has the required properties
            if (activity.date && activity.name && activity.time && activity.className) {
                this.addActivity(new Date(activity.date), activity.name, activity.time, activity.className);
            } else {
                console.warn("Invalid activity format:", activity);
            }
        });
        this.renderCalendar(); // Render the calendar after adding activities
    }

    /**
     * Render the calendar for the current month...
     * This function generates the calendar grid and populates it with days and activities.
     * It clears the previous content of the calendar body and fills it with new rows and cells.
     * @returns {void}
     */
    renderCalendar() {
        const year = this.date.getFullYear();
        const month = this.date.getMonth();
        // Set the current month text to display the month and year
        // The toLocaleDateString method formats the date according to the specified locale and options
        try {
            this.currentMonth.textContent = this.date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
        }catch (err) {
            // Current month element not found, do nothing
            console.info("Missing current month text element. Cannot set current month.");
        }

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        this.calendarBody.innerHTML = "";
        let row = document.createElement("tr");
        // Fill the first row with empty cells until the first day of the month
        for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
            row.appendChild(document.createElement("td"));
        }

        // Fill the calendar with days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement("td");
            // padStart(2, "0") ensures that the month and day are always two digits
            // e.g., 2025-03-01 instead of 2025-3-1
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            cell.textContent = day;

            // Check if there are activities for the current date
            if (this.activities[dateKey]) {
                this.activities[dateKey].forEach(activity => {
                    const badge = document.createElement("span");
                    badge.className = `badge ${activity.class} d-block mb-1`;
                    badge.innerHTML = `${activity.name}<br>${activity.time}`;
                    cell.appendChild(badge);
                });
            }

            row.appendChild(cell);
            if ((firstDayOfMonth + day - 1) % 7 === 0) {
                this.calendarBody.appendChild(row);
                row = document.createElement("tr");
            }
        }

        if (row.children.length > 0) {
            this.calendarBody.appendChild(row);
        }
        this.highlightToday();
    }

    // Today color
    /**
     * Highlight today's date in the calendar
     * @returns {void}
     */
    highlightToday() {
        const today = new Date();
        const cells = this.calendarBody.getElementsByTagName("td");
        for (let i = 0; i < cells.length; i++) {
            // Check if the cell represents a day (not empty)
            const cellDay = parseInt(cells[i].childNodes[0]?.nodeValue);
            if (
                !isNaN(cellDay) &&
                cellDay === today.getDate() &&
                this.date.getMonth() === today.getMonth() &&
                this.date.getFullYear() === today.getFullYear()
            ) {
                cells[i].style.color = "#00f"; // Text color for today
                cells[i].style.fontWeight = "bold"; // Bold text for today
                cells[i].style.backgroundColor = "#f0f8ff"; // Background color for today
            }
        }
    }

    /**
     * Move to the previous month and render the calendar
     * @returns {void}
     */
    prevMonth() {
        this.date.setMonth(this.date.getMonth() - 1);
        this.renderCalendar();
    }

    /**
     * Move to the next month and render the calendar
     * @returns {void}
     */
    nextMonth() {
        this.date.setMonth(this.date.getMonth() + 1);
        this.renderCalendar();
    }

    /**
     * Initialize the calendar by setting up event listeners for the buttons and rendering the calendar
     * @returns {void}
     */
    init() {
        // Check if the buttons exist before adding event listeners
        try {
            this.prevMonthBtn.addEventListener("click", () => this.prevMonth());
            this.nextMonthBtn.addEventListener("click", () => this.nextMonth());
        } catch (err) {
            console.info("Cannot link Event Listeners to Prev/Next Calendar buttons. Init without buttons.");
        }
        this.renderCalendar();
    }

    /** 
     * Calendar test data for activities
     * ONLY FOR DEBUGGING AND DEMO PURPOSES
     * This function adds test activities to the calendar for demonstration purposes.
     * @param {Array} activities - An array of activity objects to be added to the calendar
     */
    renderTestData(activities = []) {
        // Add test activities to the calendar
        activities.forEach(activity => {
            this.addActivity(activity.date, activity.name, activity.time, activity.className);
        });

        // Example test data
        const day = 24 * 60 * 60 * 1000; // One day in milliseconds
        const month = 30 * day; // One month in milliseconds

        this.addActivity(new Date(), "Salsa", "18:00 - 19:30", "bg-primary");
        this.addActivity(new Date(), "Salsa", "20:00 - 21:00", "bg-primary");
        this.addActivity(new Date(Date.now() + day), "Tango", "19:30 - 21:00", "bg-success");
        this.addActivity(new Date(Date.now() + month), "Hip Hop", "21:00 - 22:30", "bg-warning");
        this.renderCalendar(); // Call the renderCalendar method to display the activities on the calendar
    }
} 

//let calendar = new Calendar(); // DEBUG AND DEMO ONLY
//calendar.renderTestData(); // DEBUG AND DEMO ONLY