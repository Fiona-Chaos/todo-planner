/* =========================================================
   ELEMENTS
========================================================= */

const $ = selector =>
    document.querySelector(selector);


const daysContainer =
    $("#daysContainer");

const emptyState =
    $("#emptyState");


const addDayBtn =
    $("#addDayBtn");

const emptyAddDay =
    $("#emptyAddDay");

const todayBtn =
    $("#todayBtn");

const themeBtn =
    $("#themeBtn");

const printBtn =
    $("#printBtn");

const notificationBtn =
    $("#notificationBtn");


/* STATISTICS */

const totalTasksEl =
    $("#totalTasks");

const completedTasksEl =
    $("#completedTasks");

const remainingTasksEl =
    $("#remainingTasks");

const progressPercentEl =
    $("#progressPercent");

const progressText =
    $("#progressText");

const progressBar =
    $("#progressBar");


/* FILTERS */

const searchInput =
    $("#searchInput");

const statusFilter =
    $("#statusFilter");

const categoryFilter =
    $("#categoryFilter");

const priorityFilter =
    $("#priorityFilter");

const resetFilters =
    $("#resetFilters");


/* CALENDAR */

const calendarTitle =
    $("#calendarTitle");

const calendarGrid =
    $("#calendarGrid");

const prevMonth =
    $("#prevMonth");

const nextMonth =
    $("#nextMonth");


/* DAY MODAL */

const dayModal =
    $("#dayModal");

const newDayDate =
    $("#newDayDate");

const newDayTitle =
    $("#newDayTitle");

const saveDayBtn =
    $("#saveDay");

const cancelDay =
    $("#cancelDay");

const closeDayModal =
    $("#closeDayModal");


/* TASK MODAL */

const taskModal =
    $("#taskModal");

const taskModalTitle =
    $("#taskModalTitle");

const taskName =
    $("#taskName");

const taskStart =
    $("#taskStart");

const taskEnd =
    $("#taskEnd");

const taskDeadline =
    $("#taskDeadline");

const taskCategory =
    $("#taskCategory");

const taskPriority =
    $("#taskPriority");

const taskRepeat =
    $("#taskRepeat");

const taskReminder =
    $("#taskReminder");

const taskNotes =
    $("#taskNotes");

const saveTaskBtn =
    $("#saveTask");

const cancelTask =
    $("#cancelTask");

const closeTaskModal =
    $("#closeTaskModal");

const addSubtaskBtn =
    $("#addSubtaskBtn");

const subtaskEditorList =
    $("#subtaskEditorList");


/* =========================================================
   DATA
========================================================= */

let days =
    JSON.parse(
        localStorage.getItem(
            "plannerProUltimate"
        )
    ) || [];


let theme =
    localStorage.getItem(
        "plannerTheme"
    ) || "light";


let selectedDayId = null;

let editingTaskId = null;

let temporarySubtasks = [];

let draggedTask = null;

let calendarDate =
    new Date();


/* =========================================================
   HELPERS
========================================================= */

function createId() {

    return (
        Date.now().toString()
        +
        Math.random()
            .toString(16)
            .slice(2)
    );

}


function saveData() {

    localStorage.setItem(
        "plannerProUltimate",
        JSON.stringify(days)
    );

}


function dateToString(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2,"0");

    const day =
        String(
            date.getDate()
        ).padStart(2,"0");


    return `${year}-${month}-${day}`;

}


function parseDate(dateString) {

    return new Date(
        dateString +
        "T00:00:00"
    );

}


function formatDate(dateString) {

    const date =
        parseDate(
            dateString
        );


    const value =
        date.toLocaleDateString(
            "ru-RU",
            {
                weekday:
                    "long",

                day:
                    "numeric",

                month:
                    "long",

                year:
                    "numeric"
            }
        );


    return (
        value.charAt(0)
            .toUpperCase()
        +
        value.slice(1)
    );

}


function formatDeadline(value) {

    if (!value)
        return "";


    const date =
        new Date(value);


    return date
        .toLocaleString(
            "ru-RU",
            {
                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        );

}


function escapeHtml(value) {

    return String(value || "")

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   THEME
========================================================= */

function applyTheme() {

    document.body
        .classList
        .toggle(
            "dark",
            theme === "dark"
        );


    themeBtn.textContent =
        theme === "dark"
            ? "☀️"
            : "🌙";

}


function toggleTheme() {

    theme =
        theme === "dark"
            ? "light"
            : "dark";


    localStorage.setItem(
        "plannerTheme",
        theme
    );


    applyTheme();

}


/* =========================================================
   DAY MODAL
========================================================= */

function openDayModal(
    predefinedDate = null
) {

    newDayDate.value =
        predefinedDate
        ||
        dateToString(
            new Date()
        );


    newDayTitle.value =
        "";


    dayModal
        .classList
        .add("active");

}


function closeDay() {

    dayModal
        .classList
        .remove("active");

}


function addDay() {

    const date =
        newDayDate.value;


    if (!date) {

        alert(
            "Выберите дату."
        );

        return;

    }


    if (
        days.some(
            day =>
                day.date === date
        )
    ) {

        alert(
            "Этот день уже существует."
        );

        return;

    }


    days.push({

        id:
            createId(),

        date,

        title:
            newDayTitle
                .value
                .trim(),

        tasks: []

    });


    sortDays();

    saveData();

    closeDay();

    renderAll();

}


function sortDays() {

    days.sort(
        (a,b) =>
            a.date.localeCompare(
                b.date
            )
    );

}


function deleteDay(dayId) {

    if (
        !confirm(
            "Удалить день вместе со всеми задачами?"
        )
    ) {

        return;

    }


    days =
        days.filter(
            day =>
                day.id !== dayId
        );


    saveData();

    renderAll();

}


/* =========================================================
   ENSURE DAY
========================================================= */

function ensureDay(date) {

    let day =
        days.find(
            item =>
                item.date === date
        );


    if (!day) {

        day = {

            id:
                createId(),

            date,

            title: "",

            tasks: []

        };


        days.push(day);

        sortDays();

    }


    return day;

}


/* =========================================================
   TASK MODAL
========================================================= */

function openTaskModal(
    dayId,
    taskId = null
) {

    selectedDayId =
        dayId;

    editingTaskId =
        taskId;


    temporarySubtasks =
        [];


    if (taskId) {

        const day =
            days.find(
                d =>
                    d.id === dayId
            );


        const task =
            day.tasks.find(
                t =>
                    t.id === taskId
            );


        taskModalTitle.textContent =
            "Редактировать задачу";


        taskName.value =
            task.name || "";

        taskStart.value =
            task.start || "";

        taskEnd.value =
            task.end || "";

        taskDeadline.value =
            task.deadline || "";

        taskCategory.value =
            task.category || "other";

        taskPriority.value =
            task.priority || "medium";

        taskRepeat.value =
            task.repeat || "none";

        taskReminder.value =
            String(
                task.reminderMinutes || 0
            );

        taskNotes.value =
            task.notes || "";


        temporarySubtasks =
            JSON.parse(
                JSON.stringify(
                    task.subtasks || []
                )
            );

    }

    else {

        taskModalTitle.textContent =
            "Новая задача";


        taskName.value = "";

        taskStart.value = "";

        taskEnd.value = "";

        taskDeadline.value = "";

        taskCategory.value =
            "work";

        taskPriority.value =
            "medium";

        taskRepeat.value =
            "none";

        taskReminder.value =
            "15";

        taskNotes.value =
            "";

    }


    renderSubtaskEditor();


    taskModal
        .classList
        .add("active");


    setTimeout(
        () =>
            taskName.focus(),
        100
    );

}


function closeTask() {

    taskModal
        .classList
        .remove("active");

}


/* =========================================================
   SUBTASK EDITOR
========================================================= */

function addSubtaskEditorItem() {

    temporarySubtasks.push({

        id:
            createId(),

        text: "",

        completed:
            false

    });


    renderSubtaskEditor();

}


function renderSubtaskEditor() {

    subtaskEditorList.innerHTML =
        "";


    temporarySubtasks
        .forEach(
            (subtask,index) => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "subtask-editor-row";


                const input =
                    document.createElement(
                        "input"
                    );


                input.type =
                    "text";


                input.placeholder =
                    "Название подзадачи";


                input.value =
                    subtask.text;


                input.addEventListener(
                    "input",
                    event => {

                        temporarySubtasks[
                            index
                        ].text =
                            event.target.value;

                    }
                );


                const remove =
                    document.createElement(
                        "button"
                    );


                remove.className =
                    "remove-subtask";


                remove.type =
                    "button";


                remove.textContent =
                    "×";


                remove.onclick =
                    () => {

                        temporarySubtasks.splice(
                            index,
                            1
                        );


                        renderSubtaskEditor();

                    };


                row.append(
                    input,
                    remove
                );


                subtaskEditorList
                    .appendChild(
                        row
                    );

            }
        );

}


/* =========================================================
   SAVE TASK
========================================================= */

function saveTask() {

    const name =
        taskName
            .value
            .trim();


    if (!name) {

        alert(
            "Введите название задачи."
        );

        return;

    }


    const day =
        days.find(
            item =>
                item.id ===
                selectedDayId
        );


    if (!day)
        return;


    const subtasks =
        temporarySubtasks

            .filter(
                item =>
                    item.text
                        .trim()
            )

            .map(
                item => ({
                    ...item,

                    text:
                        item.text
                            .trim()
                })
            );


    const data = {

        name,

        start:
            taskStart.value,

        end:
            taskEnd.value,

        deadline:
            taskDeadline.value,

        category:
            taskCategory.value,

        priority:
            taskPriority.value,

        repeat:
            taskRepeat.value,

        reminderMinutes:
            Number(
                taskReminder.value
            ),

        notes:
            taskNotes
                .value
                .trim(),

        subtasks

    };


    if (editingTaskId) {

        const task =
            day.tasks.find(
                item =>
                    item.id ===
                    editingTaskId
            );


        Object.assign(
            task,
            data
        );

    }

    else {

        const task = {

            id:
                createId(),

            ...data,

            completed:
                false,

            recurrenceId:
                createId()

        };


        day.tasks.push(
            task
        );


        if (
            task.repeat !== "none"
        ) {

            createRecurringTasks(
                day.date,
                task
            );

        }

    }


    saveData();

    closeTask();

    renderAll();

}


/* =========================================================
   RECURRING TASKS
========================================================= */

function createRecurringTasks(
    originalDate,
    originalTask
) {

    const startDate =
        parseDate(
            originalDate
        );


    /*
       Создаём следующие 8 повторов.
    */

    for (
        let i = 1;
        i <= 8;
        i++
    ) {

        const newDate =
            new Date(
                startDate
            );


        if (
            originalTask.repeat
            === "daily"
        ) {

            newDate.setDate(
                startDate.getDate()
                + i
            );

        }


        if (
            originalTask.repeat
            === "weekly"
        ) {

            newDate.setDate(
                startDate.getDate()
                + i * 7
            );

        }


        if (
            originalTask.repeat
            === "monthly"
        ) {

            newDate.setMonth(
                startDate.getMonth()
                + i
            );

        }


        const targetDate =
            dateToString(
                newDate
            );


        const targetDay =
            ensureDay(
                targetDate
            );


        const clone =
            JSON.parse(
                JSON.stringify(
                    originalTask
                )
            );


        clone.id =
            createId();


        clone.completed =
            false;


        clone.subtasks =
            clone.subtasks.map(
                subtask => ({

                    ...subtask,

                    id:
                        createId(),

                    completed:
                        false

                })
            );


        /*
           Для повторной задачи
           обновим дедлайн
           относительно новой даты.
        */

        if (
            originalTask.deadline
        ) {

            const oldDeadline =
                new Date(
                    originalTask.deadline
                );


            oldDeadline.setFullYear(
                newDate.getFullYear(),

                newDate.getMonth(),

                newDate.getDate()
            );


            clone.deadline =
                toLocalDateTimeInput(
                    oldDeadline
                );

        }


        targetDay.tasks.push(
            clone
        );

    }


    sortDays();

}


function toLocalDateTimeInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    const hours =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );

    const minutes =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
        +
        `T${hours}:${minutes}`
    );

}


/* =========================================================
   TASK ACTIONS
========================================================= */

function toggleTask(
    dayId,
    taskId
) {

    const task =
        findTask(
            dayId,
            taskId
        );


    if (!task)
        return;


    task.completed =
        !task.completed;


    saveData();

    renderAll();

}


function toggleSubtask(
    dayId,
    taskId,
    subtaskId
) {

    const task =
        findTask(
            dayId,
            taskId
        );


    if (!task)
        return;


    const subtask =
        task.subtasks.find(
            item =>
                item.id ===
                subtaskId
        );


    if (!subtask)
        return;


    subtask.completed =
        !subtask.completed;


    saveData();

    renderAll();

}


function findTask(
    dayId,
    taskId
) {

    const day =
        days.find(
            item =>
                item.id === dayId
        );


    if (!day)
        return null;


    return day.tasks.find(
        item =>
            item.id === taskId
    );

}


function deleteTask(
    dayId,
    taskId
) {

    const day =
        days.find(
            item =>
                item.id === dayId
        );


    if (!day)
        return;


    day.tasks =
        day.tasks.filter(
            task =>
                task.id !== taskId
        );


    saveData();

    renderAll();

}


/* =========================================================
   DRAG AND DROP
========================================================= */

function startDrag(
    dayId,
    taskId
) {

    draggedTask = {
        dayId,
        taskId
    };

}


function dropTask(
    targetDayId
) {

    if (!draggedTask)
        return;


    if (
        draggedTask.dayId
        === targetDayId
    ) {

        draggedTask = null;

        return;

    }


    const sourceDay =
        days.find(
            item =>
                item.id ===
                draggedTask.dayId
        );


    const targetDay =
        days.find(
            item =>
                item.id ===
                targetDayId
        );


    if (
        !sourceDay ||
        !targetDay
    ) {

        return;

    }


    const taskIndex =
        sourceDay.tasks
            .findIndex(
                task =>
                    task.id ===
                    draggedTask.taskId
            );


    if (
        taskIndex === -1
    ) {

        return;

    }


    const [
        task
    ] =
        sourceDay.tasks.splice(
            taskIndex,
            1
        );


    targetDay.tasks.push(
        task
    );


    draggedTask = null;


    saveData();

    renderAll();

}


/* =========================================================
   FILTERING
========================================================= */

function taskMatchesFilters(
    task
) {

    const search =
        searchInput
            .value
            .trim()
            .toLowerCase();


    if (
        search &&
        !(
            task.name
                .toLowerCase()
                .includes(search)
            ||
            (task.notes || "")
                .toLowerCase()
                .includes(search)
        )
    ) {

        return false;

    }


    if (
        statusFilter.value
        === "active"
        &&
        task.completed
    ) {

        return false;

    }


    if (
        statusFilter.value
        === "completed"
        &&
        !task.completed
    ) {

        return false;

    }


    if (
        categoryFilter.value
        !== "all"
        &&
        task.category
        !== categoryFilter.value
    ) {

        return false;

    }


    if (
        priorityFilter.value
        !== "all"
        &&
        task.priority
        !== priorityFilter.value
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   LABELS
========================================================= */

const categories = {

    work: {
        text:
            "💼 Работа",

        css:
            "category-work"
    },

    study: {
        text:
            "📚 Учёба",

        css:
            "category-study"
    },

    personal: {
        text:
            "🏠 Личное",

        css:
            "category-personal"
    },

    health: {
        text:
            "💗 Здоровье",

        css:
            "category-health"
    },

    shopping: {
        text:
            "🛍 Покупки",

        css:
            "category-shopping"
    },

    other: {
        text:
            "✨ Другое",

        css:
            "category-other"
    }

};


const priorities = {

    high: {
        text:
            "● Высокий",

        css:
            "priority-high"
    },

    medium: {
        text:
            "● Средний",

        css:
            "priority-medium"
    },

    low: {
        text:
            "● Низкий",

        css:
            "priority-low"
    }

};


const repeatNames = {

    none:
        "",

    daily:
        "🔁 Каждый день",

    weekly:
        "🔁 Каждую неделю",

    monthly:
        "🔁 Каждый месяц"

};


/* =========================================================
   RENDER DAYS
========================================================= */

function renderDays() {

    daysContainer.innerHTML =
        "";


    emptyState.style.display =
        days.length
            ? "none"
            : "block";


    days.forEach(
        day => {

            const visibleTasks =
                day.tasks.filter(
                    task =>
                        taskMatchesFilters(
                            task
                        )
                );


            const card =
                document.createElement(
                    "section"
                );


            card.className =
                "day-card";


            card.id =
                `day-${day.date}`;


            card.dataset.dayId =
                day.id;


            card.addEventListener(
                "dragover",
                event => {

                    event.preventDefault();

                    card.classList
                        .add(
                            "drag-over"
                        );

                }
            );


            card.addEventListener(
                "dragleave",
                () => {

                    card.classList
                        .remove(
                            "drag-over"
                        );

                }
            );


            card.addEventListener(
                "drop",
                event => {

                    event.preventDefault();

                    card.classList
                        .remove(
                            "drag-over"
                        );


                    dropTask(
                        day.id
                    );

                }
            );


            /* HEADER */

            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "day-header";


            header.innerHTML = `

                <div class="day-left">

                    <div class="day-icon">
                        📅
                    </div>

                    <div>

                        <div class="day-date">
                            ${formatDate(day.date)}
                        </div>

                        <input
                            class="day-title-input"
                            value="${escapeHtml(day.title)}"
                            placeholder="Добавить название дня..."
                        >

                    </div>

                </div>


                <div class="day-actions">

                    <button
                        class="day-btn add-task-btn"
                    >
                        + Задача
                    </button>

                    <button
                        class="delete-day-btn"
                        title="Удалить день"
                    >
                        🗑
                    </button>

                </div>
            `;


            header
                .querySelector(
                    ".add-task-btn"
                )
                .onclick =
                () =>
                    openTaskModal(
                        day.id
                    );


            header
                .querySelector(
                    ".delete-day-btn"
                )
                .onclick =
                () =>
                    deleteDay(
                        day.id
                    );


            header
                .querySelector(
                    ".day-title-input"
                )
                .addEventListener(
                    "input",
                    event => {

                        day.title =
                            event.target.value;

                        saveData();

                    }
                );


            card.appendChild(
                header
            );


            if (
                visibleTasks.length
                === 0
            ) {

                const empty =
                    document.createElement(
                        "div"
                    );


                empty.className =
                    "empty-day";


                empty.textContent =
                    day.tasks.length

                        ? "Нет задач, подходящих под выбранный фильтр."

                        : "На этот день задач пока нет ✨";


                card.appendChild(
                    empty
                );

            }


            visibleTasks
                .forEach(
                    task => {

                        card.appendChild(
                            renderTask(
                                day,
                                task
                            )
                        );

                    }
                );


            daysContainer
                .appendChild(
                    card
                );

        }
    );

}


/* =========================================================
   RENDER TASK
========================================================= */

function renderTask(
    day,
    task
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        task.completed
            ? "task completed"
            : "task";


    element.draggable =
        true;


    element.addEventListener(
        "dragstart",
        () => {

            element.classList
                .add(
                    "dragging"
                );


            startDrag(
                day.id,
                task.id
            );

        }
    );


    element.addEventListener(
        "dragend",
        () => {

            element.classList
                .remove(
                    "dragging"
                );

        }
    );


    const category =
        categories[
            task.category
        ]
        ||
        categories.other;


    const priority =
        priorities[
            task.priority
        ]
        ||
        priorities.medium;


    const deadlineOverdue =
        task.deadline
        &&
        !task.completed
        &&
        new Date(
            task.deadline
        ) < new Date();


    const completedSubtasks =
        (
            task.subtasks
            || []
        )
        .filter(
            item =>
                item.completed
        )
        .length;


    const totalSubtasks =
        (
            task.subtasks
            || []
        ).length;


    element.innerHTML = `

        <input
            type="checkbox"
            class="task-check"
            ${task.completed ? "checked" : ""}
        >


        <div>

            <div class="task-top">

                <span class="task-name">
                    ${escapeHtml(task.name)}
                </span>

                <span
                    class="badge ${category.css}"
                >
                    ${category.text}
                </span>

                <span
                    class="${priority.css}"
                    style="font-size:11px"
                >
                    ${priority.text}
                </span>

            </div>


            <div class="task-details">

                ${
                    task.start
                    ||
                    task.end
                    ?
                    `
                    <span>
                        🕒 ${task.start || "—"}
                        —
                        ${task.end || "—"}
                    </span>
                    `
                    :
                    ""
                }


                ${
                    task.deadline
                    ?
                    `
                    <span
                        class="${
                            deadlineOverdue
                            ? "deadline-overdue"
                            : ""
                        }"
                    >
                        ⏰ Дедлайн:
                        ${formatDeadline(task.deadline)}
                    </span>
                    `
                    :
                    ""
                }


                ${
                    task.repeat
                    &&
                    task.repeat !== "none"
                    ?
                    `
                    <span class="repeat-label">
                        ${repeatNames[task.repeat]}
                    </span>
                    `
                    :
                    ""
                }

            </div>


            ${
                task.notes
                ?
                `
                <div class="task-notes">
                    📝 ${escapeHtml(task.notes)}
                </div>
                `
                :
                ""
            }


            ${
                totalSubtasks
                ?
                `
                <div class="subtasks-progress">
                    Подзадачи:
                    ${completedSubtasks}
                    из
                    ${totalSubtasks}
                </div>

                <div class="subtask-list"></div>
                `
                :
                ""
            }

        </div>


        <div class="task-actions">

            <button
                class="icon-btn edit-task"
                title="Редактировать"
            >
                ✏️
            </button>

            <button
                class="icon-btn delete-task"
                title="Удалить"
            >
                🗑
            </button>

        </div>
    `;


    element
        .querySelector(
            ".task-check"
        )
        .onchange =
        () =>
            toggleTask(
                day.id,
                task.id
            );


    element
        .querySelector(
            ".edit-task"
        )
        .onclick =
        () =>
            openTaskModal(
                day.id,
                task.id
            );


    element
        .querySelector(
            ".delete-task"
        )
        .onclick =
        () =>
            deleteTask(
                day.id,
                task.id
            );


    if (
        totalSubtasks
    ) {

        const list =
            element.querySelector(
                ".subtask-list"
            );


        task.subtasks
            .forEach(
                subtask => {

                    const row =
                        document.createElement(
                            "label"
                        );


                    row.className =
                        subtask.completed
                            ? "subtask-row completed"
                            : "subtask-row";


                    row.innerHTML = `

                        <input
                            type="checkbox"
                            class="subtask-check"
                            ${
                                subtask.completed
                                ? "checked"
                                : ""
                            }
                        >

                        <span>
                            ${escapeHtml(subtask.text)}
                        </span>
                    `;


                    row
                        .querySelector(
                            ".subtask-check"
                        )
                        .onchange =
                        () =>
                            toggleSubtask(
                                day.id,
                                task.id,
                                subtask.id
                            );


                    list.appendChild(
                        row
                    );

                }
            );

    }


    return element;

}


/* =========================================================
   STATISTICS
========================================================= */

function renderStatistics() {

    let total = 0;

    let completed = 0;


    days.forEach(
        day => {

            total +=
                day.tasks.length;


            completed +=
                day.tasks.filter(
                    task =>
                        task.completed
                ).length;

        }
    );


    const remaining =
        total - completed;


    const percent =
        total
            ?
            Math.round(
                completed
                /
                total
                *
                100
            )
            :
            0;


    totalTasksEl.textContent =
        total;


    completedTasksEl.textContent =
        completed;


    remainingTasksEl.textContent =
        remaining;


    progressPercentEl.textContent =
        `${percent}%`;


    progressText.textContent =
        `${completed} из ${total}`;


    progressBar.style.width =
        `${percent}%`;

}


/* =========================================================
   CALENDAR
========================================================= */

function renderCalendar() {

    calendarGrid.innerHTML =
        "";


    const year =
        calendarDate
            .getFullYear();


    const month =
        calendarDate
            .getMonth();


    calendarTitle.textContent =
        new Date(
            year,
            month,
            1
        )
        .toLocaleDateString(
            "ru-RU",
            {
                month:
                    "long",

                year:
                    "numeric"
            }
        )
        .replace(
            /^./,
            value =>
                value.toUpperCase()
        );


    let weekday =
        new Date(
            year,
            month,
            1
        )
        .getDay();


    if (
        weekday === 0
    ) {

        weekday = 7;

    }


    for (
        let i = 1;
        i < weekday;
        i++
    ) {

        calendarGrid
            .appendChild(
                document.createElement(
                    "div"
                )
            );

    }


    const daysCount =
        new Date(
            year,
            month + 1,
            0
        )
        .getDate();


    const today =
        dateToString(
            new Date()
        );


    for (
        let number = 1;
        number <= daysCount;
        number++
    ) {

        const date =
            new Date(
                year,
                month,
                number
            );


        const dateString =
            dateToString(
                date
            );


        const plannerDay =
            days.find(
                day =>
                    day.date ===
                    dateString
            );


        const element =
            document.createElement(
                "div"
            );


        element.className =
            "calendar-day";


        element.textContent =
            number;


        if (
            dateString === today
        ) {

            element.classList
                .add(
                    "today"
                );

        }


        if (
            plannerDay
        ) {

            element.classList
                .add(
                    "has-plan"
                );


            const dot =
                document.createElement(
                    "span"
                );


            dot.className =
                "calendar-dot";


            element.appendChild(
                dot
            );

        }


        element.onclick =
            () => {

                if (
                    plannerDay
                ) {

                    document
                        .getElementById(
                            `day-${dateString}`
                        )
                        ?.scrollIntoView({
                            behavior:
                                "smooth",

                            block:
                                "start"
                        });

                }

                else {

                    openDayModal(
                        dateString
                    );

                }

            };


        calendarGrid
            .appendChild(
                element
            );

    }

}


/* =========================================================
   TODAY
========================================================= */

function goToToday() {

    const today =
        dateToString(
            new Date()
        );


    calendarDate =
        new Date();


    renderCalendar();


    const existingDay =
        days.find(
            day =>
                day.date === today
        );


    if (
        existingDay
    ) {

        document
            .getElementById(
                `day-${today}`
            )
            ?.scrollIntoView({
                behavior:
                    "smooth"
            });

    }

    else {

        openDayModal(
            today
        );

    }

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

async function enableNotifications() {

    if (
        !(
            "Notification"
            in window
        )
    ) {

        alert(
            "Этот браузер не поддерживает уведомления."
        );

        return;

    }


    const permission =
        await Notification
            .requestPermission();


    if (
        permission === "granted"
    ) {

        notificationBtn
            .textContent =
            "🔔 Включены";


        alert(
            "Уведомления включены."
        );

    }

    else {

        alert(
            "Разрешение на уведомления не предоставлено."
        );

    }

}


function checkNotifications() {

    if (
        !(
            "Notification"
            in window
        )
        ||
        Notification.permission
        !== "granted"
    ) {

        return;

    }


    const now =
        new Date();


    const today =
        dateToString(
            now
        );


    const day =
        days.find(
            item =>
                item.date === today
        );


    if (!day)
        return;


    day.tasks
        .forEach(
            task => {

                if (
                    task.completed
                    ||
                    !task.start
                    ||
                    !task.reminderMinutes
                ) {

                    return;

                }


                const [
                    hour,
                    minute
                ] =
                    task.start
                        .split(":")
                        .map(Number);


                const taskTime =
                    new Date();


                taskTime.setHours(
                    hour,
                    minute,
                    0,
                    0
                );


                const reminderTime =
                    new Date(
                        taskTime.getTime()
                        -
                        task.reminderMinutes
                        *
                        60000
                    );


                const difference =
                    now.getTime()
                    -
                    reminderTime.getTime();


                /*
                    Уведомляем в течение
                    первых 60 секунд
                    после наступления
                    времени напоминания.
                */

                if (
                    difference >= 0
                    &&
                    difference < 60000
                ) {

                    const key =
                        `notified-${today}-${task.id}`;


                    if (
                        localStorage
                            .getItem(key)
                    ) {

                        return;

                    }


                    new Notification(
                        "Скоро задача",
                        {
                            body:
                                `${task.start} — ${task.name}`
                        }
                    );


                    localStorage
                        .setItem(
                            key,
                            "1"
                        );

                }

            }
        );

}


/* =========================================================
   PDF / PRINT
========================================================= */

function printPlanner() {

    window.print();

}


/* =========================================================
   FILTER EVENTS
========================================================= */

function resetAllFilters() {

    searchInput.value =
        "";

    statusFilter.value =
        "all";

    categoryFilter.value =
        "all";

    priorityFilter.value =
        "all";


    renderDays();

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    renderDays();

    renderStatistics();

    renderCalendar();

}


/* =========================================================
   EVENTS
========================================================= */

addDayBtn.onclick =
    () =>
        openDayModal();


emptyAddDay.onclick =
    () =>
        openDayModal();


saveDayBtn.onclick =
    addDay;


cancelDay.onclick =
    closeDay;


closeDayModal.onclick =
    closeDay;


saveTaskBtn.onclick =
    saveTask;


cancelTask.onclick =
    closeTask;


closeTaskModal.onclick =
    closeTask;


themeBtn.onclick =
    toggleTheme;


todayBtn.onclick =
    goToToday;


notificationBtn.onclick =
    enableNotifications;


printBtn.onclick =
    printPlanner;


addSubtaskBtn.onclick =
    addSubtaskEditorItem;


prevMonth.onclick =
    () => {

        calendarDate =
            new Date(
                calendarDate
                    .getFullYear(),

                calendarDate
                    .getMonth() - 1,

                1
            );


        renderCalendar();

    };


nextMonth.onclick =
    () => {

        calendarDate =
            new Date(
                calendarDate
                    .getFullYear(),

                calendarDate
                    .getMonth() + 1,

                1
            );


        renderCalendar();

    };


searchInput.addEventListener(
    "input",
    renderDays
);


statusFilter.addEventListener(
    "change",
    renderDays
);


categoryFilter.addEventListener(
    "change",
    renderDays
);


priorityFilter.addEventListener(
    "change",
    renderDays
);


resetFilters.onclick =
    resetAllFilters;


/* MODAL CLICK */

dayModal.addEventListener(
    "click",
    event => {

        if (
            event.target
            === dayModal
        ) {

            closeDay();

        }

    }
);


taskModal.addEventListener(
    "click",
    event => {

        if (
            event.target
            === taskModal
        ) {

            closeTask();

        }

    }
);


/* ESC */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key
            === "Escape"
        ) {

            closeDay();

            closeTask();

        }

    }
);


/* =========================================================
   START
========================================================= */

applyTheme();

sortDays();

renderAll();


/*
    Проверяем напоминания каждые 30 секунд.
*/

setInterval(
    checkNotifications,
    30000
);


checkNotifications();