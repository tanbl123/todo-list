/*
app.js - connects the page to the task logic in tasks.js

tasks.js changes the data; this file reads the form, calls those
functions, and redraws the list. Every action follows the same steps:
  1. call a tasks.js function to get the new list
  2. store it in `tasks`
  3. call renderTasks() to redraw the page from `tasks`
*/

// The current list of tasks (the single source of truth for the page)
let tasks = [];

// The id of the task being edited, or null when adding a new task
let editingId=null;

// Which task should play an animation on the next render, and which one.
// Only one task animates at a time, because the whole list is rebuilt.
let animatedId = null;
let animationClass = "";

// Elements on the page, found once by their id
const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const priorityInput = document.getElementById("task-priority");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");

// Name under which the tasks are stored in the browser
const STORAGE_KEY = "todo-tasks";

/*
Saves the current task list to localStorage, so it is kept after the
page is refreshed or the browser is closed. localStorage only stores
text, so the array is converted to a JSON string first.
*/
function saveTasks(){
    try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }catch(error){
        // Storage can be unavailable (e.g. blocked in private browsing);
        // the app still works, the tasks just won't be kept.
        console.warn("Could not save tasks: ",error);
    }
}

/*
Loads the saved task list from localStorage.
Returns an empty list if nothing is saved yet, or if the saved data
cannot be read.
*/
function loadTasks(){
    try{
        const saved = localStorage.getItem(STORAGE_KEY);
        if(saved === null){
            return [];   // nothing saved yet (first visit)
        }
        const parsed = JSON.parse(saved);
        if(Array.isArray(parsed)){
            return parsed;
        }
        return [];  // saved data is not a list
    }catch(error){
        console.warn("Could not load tasks: ", error);
        return [];  // saved data is corrupted
    }
}

// Marks one task to be animated the next time the list is drawn.
function animateNext(id, className) {
    animatedId = id;
    animationClass = className;
}

/*
Redraws the whole task list from the `tasks` array.
The old list is cleared first, then one <li> is built for each task.
*/

function renderTasks(){
    saveTasks();    // keep the stored list in sync with the page
    taskList.innerHTML='';  // remove the old list

    for(const task of tasks){
        const item = document.createElement("li");  // create a new <li> element
        item.className = "task priority-border-" + task.priority;   // e.g. "task priority-border-high"

        //completed tasks get an extra class, so the CSS can style them differently
        if(task.status === "complete"){
            item.classList.add("completed");
        }

        if(task.id === animatedId){
            item.classList.add(animationClass);
        }

        //checkbox, ticked when the task is complete; clicking it toggles the status
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = (task.status === "complete");
        checkbox.addEventListener("change", function(){
            tasks = toggleTaskStatus(tasks, task.id);
            animateNext(task.id, "task-changed");
            renderTasks();
        });
        item.appendChild(checkbox);

        // Content: title and description, grouped so they stack together
        const content = document.createElement("div");
        content.className = "task-content";

        // Title
        const title = document.createElement("h3"); // create a new <h3> element
        title.textContent = task.title;
        content.appendChild(title);        // put the title inside the content box

        // Description (only if there is one)
        if(task.description !== ""){
            const description = document.createElement("p");
            description.textContent=task.description;
            content.appendChild(description);
        }
        item.appendChild(content);

        // Actions: priority badge and buttons, grouped on the right
        const actions = document.createElement("div");
        actions.className = "task-actions";

        //Priority badge
        const priority = document.createElement("span");
        priority.className = "priority priority-" + task.priority;  // e.g. "priority priority-high"
        priority.textContent = task.priority;
        actions.appendChild(priority);
        
        // Edit button: loads this task into the form for editing
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-button";
        editButton.addEventListener("click", function(){
            startEditing(task);
        });
        actions.appendChild(editButton);

        // Delete button: asks for confirmation, then removes the task
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.addEventListener("click", function(){
            if(confirm("Delete \"" + task.title + "\"?")){
                deleteButton.disabled = true;   // prevent double clicks during the animation
                item.classList.add("task-leave");   // start the fade-out

                // When the fade-out finishes, remove the task for real
                item.addEventListener("animationend", function(){
                    tasks = deleteTask(tasks, task.id);
                    // If this task was being edited, leave edit mode
                    if(editingId === task.id){
                        stopEditing();
                    }
                    renderTasks();
                }, {once: true});   //runs the listener only once, then removes it automatically.
            }
        });
        actions.appendChild(deleteButton);

        item.appendChild(actions);

        taskList.appendChild(item); // add the finished <li> to the list on the page
    }

    // The animation has been applied; don't replay it on the next render
    animatedId = null;

    // Show the "No tasks yet" message only when the list is empty
    if(tasks.length === 0){
        emptyMessage.style.display = "block";
    }else{
        emptyMessage.style.display = "none";
    }
}

/*
Switches the form into edit mode for one task:
fills the inputs with the task's current values and changes the
button text, so submitting saves changes instead of adding a task.
*/
function startEditing(task){
    editingId = task.id;
    titleInput.setCustomValidity("");   // clear any earlier title error

    titleInput.value = task.title;
    descriptionInput.value = task.description;
    priorityInput.value = task.priority;

    submitButton.textContent = "Save Changes";
    cancelButton.hidden = false;

    titleInput.focus();     // move the cursor to the form, ready to edit
}

/*
Switches the form back to add mode: clears the inputs and resets the button text.
*/

function stopEditing(){
    editingId = null;
    form.reset();
    titleInput.setCustomValidity("");   // clear any earlier title error
    submitButton.textContent="Add Task";
    cancelButton.hidden=true;
}


/*
When the form is submitted:
  - in add mode, add a new task
  - in edit mode, save the changes to the task being edited
Then redraw the list and return the form to add mode.
*/

form.addEventListener("submit", function(event){
    event.preventDefault(); // stop the browser reloading the page

    // A title of only spaces passes the HTML "required" check, so check it
    // here and show the browser's own validation message. The form is not
    // reset, so the user keeps what they typed.
    if (titleInput.value.trim() === ""){
        titleInput.setCustomValidity("Please enter a title.");
        titleInput.reportValidity();
        return; // stop here: don't add or save anything
    }

    if(editingId === null){
        const countBefore = tasks.length;
        tasks = addTask(
            tasks,
            titleInput.value,
            descriptionInput.value,
            priorityInput.value
        );
        // Animate the new task (the last one), but only if one was actually added  
        if(tasks.length > countBefore){
            animateNext(tasks[tasks.length-1].id, "task-enter");
        }
    }else{
        tasks = updateTask(tasks, editingId, {
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim(),
            priority: priorityInput.value
        });
        animateNext(editingId, "task-changed");
    }
    
    renderTasks();
    stopEditing();  // clear the form and go back to add mode
    titleInput.focus(); // put the cursor back in the title box
});

// Cancel: leave edit mode without saving
cancelButton.addEventListener("click", function(){
    stopEditing();
});

// Clear the title error as soon as the user starts typing again
titleInput.addEventListener("input", function(){
    titleInput.setCustomValidity("");
});

// Load saved tasks, then draw the list once when the page first loads
tasks = loadTasks();
renderTasks();