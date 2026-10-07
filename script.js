/* =========================================
   CONFIGURATION
========================================= */

const START_HOUR = 6;
const END_HOUR = 22;


const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];


const shortDays = [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN"
];


/* =========================================
   ELEMENTS
========================================= */

const scheduleElement =
    document.getElementById("schedule");

const selectedDayLabel =
    document.getElementById("selectedDayLabel");

const clearSelectionButton =
    document.getElementById(
        "clearSelectionButton"
    );


const modalOverlay =
    document.getElementById(
        "modalOverlay"
    );

const scheduleForm =
    document.getElementById(
        "scheduleForm"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const activityInput =
    document.getElementById(
        "activity"
    );

const dayInput =
    document.getElementById(
        "day"
    );

const categoryInput =
    document.getElementById(
        "category"
    );

const startTimeInput =
    document.getElementById(
        "startTime"
    );

const endTimeInput =
    document.getElementById(
        "endTime"
    );

const notesInput =
    document.getElementById(
        "notes"
    );

const scheduleIdInput =
    document.getElementById(
        "scheduleId"
    );

const deleteButton =
    document.getElementById(
        "deleteButton"
    );

const closeModalButton =
    document.getElementById(
        "closeModal"
    );


/* =========================================
   STATE
========================================= */

/*
    selectedDay:

    null = show all days

    0 = Monday
    1 = Tuesday
    ... 
    6 = Sunday
*/

let selectedDay = null;


/*
    Weekly recurring schedules.

    These schedules are NOT attached
    to a specific date.

    They simply belong to a day
    of the week.
*/

let schedules =
    JSON.parse(
        localStorage.getItem(
            "weeklySchedules"
        )
    ) || [];


/* =========================================
   GET TODAY
========================================= */

function getTodayName() {

    const today =
        new Date().getDay();

    /*
        JavaScript:
        Sunday = 0
        Monday = 1
        Tuesday = 2
        ...
        Saturday = 6

        Our days array:
        Monday = 0
        Tuesday = 1
        ...
        Sunday = 6
    */

    const todayIndex =
        today === 0
            ? 6
            : today - 1;

    return days[todayIndex];
}


/* =========================================
   RENDER CALENDAR
========================================= */

function renderCalendar() {

    scheduleElement.innerHTML = "";


    /*
        Determine which days should
        be displayed.
    */

    let visibleDays;


    if (selectedDay === null) {

        visibleDays = [
            0,
            1,
            2,
            3,
            4,
            5,
            6
        ];

    } else {

        visibleDays = [
            selectedDay
        ];

    }


    /*
        Grid columns.

        First column = time.

        Remaining columns = days.
    */

    scheduleElement.style.gridTemplateColumns =
        `70px repeat(${visibleDays.length}, minmax(150px, 1fr))`;


    /* =====================================
       EMPTY HEADER
    ===================================== */

    const timeHeader =
        document.createElement("div");

    timeHeader.className =
        "time-header";

    scheduleElement.appendChild(
        timeHeader
    );


    /* =====================================
       DAY HEADERS
    ===================================== */

    visibleDays.forEach(
        dayIndex => {

            const header =
                document.createElement(
                    "button"
                );


            header.className =
                "day-header";


            if (
                selectedDay === dayIndex
            ) {

                header.classList.add(
                    "selected"
                );

            }


            header.innerHTML = `

                <span>
                    ${shortDays[dayIndex]}
                </span>

                <strong>
                    ${days[dayIndex]}
                </strong>

            `;


            /*
                CLICKING A DAY
                switches the view.
            */

            header.addEventListener(
                "click",
                () => {

                    if (
                        selectedDay ===
                        dayIndex
                    ) {

                        /*
                            Clicking the
                            already selected
                            day returns
                            to all days.
                        */

                        selectedDay = null;

                    } else {

                        selectedDay =
                            dayIndex;

                    }


                    updateSelectedDay();

                    renderCalendar();

                }
            );


            scheduleElement.appendChild(
                header
            );

        }
    );


    /* =====================================
       TIME ROWS
    ===================================== */

    for (
        let hour = START_HOUR;
        hour <= END_HOUR;
        hour++
    ) {


        const time =
            document.createElement(
                "div"
            );


        time.className =
            "time";


        time.textContent =
            `${String(hour).padStart(2, "0")}:00`;


        scheduleElement.appendChild(
            time
        );


        visibleDays.forEach(
            dayIndex => {

                const slot =
                    document.createElement(
                        "div"
                    );


                slot.className =
                    "slot";


                slot.dataset.day =
                    dayIndex;

                slot.dataset.hour =
                    hour;


                /*
                    Click empty slot
                    to create schedule.
                */

                slot.addEventListener(
                    "click",
                    () => {

                        openAddModal(
                            dayIndex,
                            hour
                        );

                    }
                );


                scheduleElement.appendChild(
                    slot
                );

            }
        );

    }


    renderSchedules();
}


/* =========================================
   SELECTED DAY LABEL
========================================= */

function updateSelectedDay() {

    if (selectedDay === null) {

        // Show today's day instead of "All Days"
        selectedDayLabel.textContent =
            getTodayName();

        clearSelectionButton.textContent =
            getTodayName();

        return;
    }


    selectedDayLabel.textContent =
        days[selectedDay];


    clearSelectionButton.textContent =
        "Show All";
}

/* =========================================
   UPDATE TODAY BUTTON
========================================= */

/*
    Check the current day every minute.

    This means:

    Monday -> Tuesday

    automatically at midnight,
    without needing to refresh.
*/

function updateTodayButton() {

    if (
        selectedDay === null
    ) {

        clearSelectionButton.textContent =
            getTodayName();

    }

}


/*
    Run once immediately.
*/




/*
    Check every 60 seconds.
*/

setInterval(
    updateTodayButton,
    60000
);


/* =========================================
   RENDER ALL SCHEDULES
========================================= */

function renderSchedules() {

    schedules.forEach(
        schedule => {

            /*
                If a day is selected,
                don't render schedules
                from other days.
            */

            if (
                selectedDay !== null &&
                schedule.day !== selectedDay
            ) {

                return;

            }


            renderSchedule(
                schedule
            );

        }
    );
}


/* =========================================
   RENDER ONE SCHEDULE
========================================= */

function renderSchedule(schedule) {

    const start =
        convertTimeToMinutes(
            schedule.start
        );


    const end =
        convertTimeToMinutes(
            schedule.end
        );


    const duration =
        end - start;


    if (duration <= 0) {
        return;
    }


    const startHour =
        Math.floor(
            start / 60
        );


    const startMinute =
        start % 60;


    const slot =
        document.querySelector(
            `.slot[data-day="${schedule.day}"][data-hour="${startHour}"]`
        );


    if (!slot) {
        return;
    }


    const event =
        document.createElement(
            "div"
        );


    event.className =
        `schedule-event ${schedule.category}`;


    event.style.top =
        `${(startMinute / 60) * 64}px`;


    event.style.height =
        `${Math.max(
            (duration / 60) * 64 - 6,
            30
        )}px`;


    event.innerHTML = `

        <div class="event-title">
            ${escapeHTML(
                schedule.activity
            )}
        </div>


        <div class="event-time">
            ${schedule.start}
            —
            ${schedule.end}
        </div>


        ${
            schedule.notes
                ? `
                    <div class="event-notes">
                        ${escapeHTML(
                            schedule.notes
                        )}
                    </div>
                `
                : ""
        }

    `;


    event.addEventListener(
        "click",
        function(e) {

            e.stopPropagation();

            openEditModal(
                schedule
            );

        }
    );


    slot.appendChild(
        event
    );
}


/* =========================================
   TIME
========================================= */

function convertTimeToMinutes(time) {

    const [
        hours,
        minutes
    ] =
        time
            .split(":")
            .map(Number);


    return (
        hours * 60 +
        minutes
    );
}


/* =========================================
   ADD MODAL
========================================= */

function openAddModal(
    day,
    hour
) {

    modalTitle.textContent =
        "Add Schedule";


    scheduleIdInput.value =
        "";


    activityInput.value =
        "";


    dayInput.value =
        String(day);


    categoryInput.value =
        "study";


    startTimeInput.value =
        `${String(
            hour
        ).padStart(2, "0")}:00`;


    endTimeInput.value =
        `${String(
            Math.min(
                hour + 1,
                23
            )
        ).padStart(2, "0")}:00`;


    notesInput.value =
        "";


    deleteButton.style.display =
        "none";


    modalOverlay.classList.add(
        "active"
    );


    activityInput.focus();
}


/* =========================================
   EDIT MODAL
========================================= */

function openEditModal(
    schedule
) {

    modalTitle.textContent =
        "Edit Schedule";


    scheduleIdInput.value =
        schedule.id;


    activityInput.value =
        schedule.activity;


    dayInput.value =
        String(schedule.day);


    categoryInput.value =
        schedule.category;


    startTimeInput.value =
        schedule.start;


    endTimeInput.value =
        schedule.end;


    notesInput.value =
        schedule.notes || "";


    deleteButton.style.display =
        "block";


    modalOverlay.classList.add(
        "active"
    );
}


/* =========================================
   CLOSE MODAL
========================================= */

function closeModal() {

    modalOverlay.classList.remove(
        "active"
    );
}


closeModalButton.addEventListener(
    "click",
    closeModal
);


modalOverlay.addEventListener(
    "click",
    function(e) {

        if (
            e.target ===
            modalOverlay
        ) {

            closeModal();

        }

    }
);


/* =========================================
   SAVE
========================================= */

scheduleForm.addEventListener(
    "submit",
    function(e) {

        e.preventDefault();


        const activity =
            activityInput.value.trim();


        const day =
            Number(
                dayInput.value
            );


        const category =
            categoryInput.value;


        const start =
            startTimeInput.value;


        const end =
            endTimeInput.value;


        const notes =
            notesInput.value.trim();


        if (!activity) {
            return;
        }


        if (
            convertTimeToMinutes(end)
            <=
            convertTimeToMinutes(start)
        ) {

            alert(
                "End time must be after start time."
            );

            return;

        }


        const existingId =
            scheduleIdInput.value;


        if (existingId) {

            const index =
                schedules.findIndex(
                    item =>
                        item.id ===
                        existingId
                );


            if (index !== -1) {

                schedules[index] = {

                    ...schedules[index],

                    activity,

                    day,

                    category,

                    start,

                    end,

                    notes

                };

            }

        } else {

            schedules.push({

                id:
                    Date.now().toString(),

                activity,

                day,

                category,

                start,

                end,

                notes

            });

        }


        saveSchedules();

        renderCalendar();

        closeModal();

    }
);


/* =========================================
   DELETE
========================================= */

deleteButton.addEventListener(
    "click",
    function() {

        const id =
            scheduleIdInput.value;


        if (!id) {
            return;
        }


        if (
            !confirm(
                "Delete this schedule?"
            )
        ) {

            return;

        }


        schedules =
            schedules.filter(
                item =>
                    item.id !== id
            );


        saveSchedules();

        renderCalendar();

        closeModal();

    }
);


/* =========================================
   STORAGE
========================================= */

function saveSchedules() {

    localStorage.setItem(
        "weeklySchedules",
        JSON.stringify(
            schedules
        )
    );
}


/* =========================================
   SHOW ALL
========================================= */

clearSelectionButton.addEventListener(
    "click",
    function() {

        selectedDay = null;

        updateSelectedDay();

        renderCalendar();

    }
);


/* =========================================
   SECURITY
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;
}


/* =========================================
   INITIALIZE
========================================= */

updateSelectedDay();
setInterval(() => {

    if (selectedDay === null) {
        updateSelectedDay();
    }

}, 60000);
renderCalendar();
