
/*
This file only works with data (the list of tasks). It never reads
or changes the page; app.js does that.

Each task is an object:
  { id, title, description, status, priority }
  status:   "pending" or "complete"
  priority: "high", "medium" or "low"

Every function takes the current list and returns a NEW list, so the
original list is never changed. This makes the functions predictable
and easy to test in tests.html.
*/

/*
Copies all fields of one object into a new object.
Used so that editing a task never changes the original object.
*/
function copyObject(original) {
    const copy = {};
    for(const key in original){
        copy[key] = original[key];
    }
    return copy;
}

/*
Returns the next free id: one more than the highest id in the list.
*/
function nextId(tasks){
    let highest = 0;
    for(const task of tasks){
        if(task.id > highest){
            highest = task.id;
        }
    }
    return highest+1;
}

/*
Creates a new task object. New tasks always start as "pending".

Extra spaces at the start and end of the title and description are
removed.
*/
function createTask(id, title, description, priority){
    return {
        id: id,     // unique id, provided by nextId()
        title: title.trim(),    
        description: description.trim(),
        status: "pending",
        priority: priority
    };
}

/*
Returns a new list with a new task added at the end.

If the title is empty (or only spaces), the list is returned unchanged.
*/
function addTask(tasks, title, description, priority){
    // A task must have a title; ignore titles that are empty or only spaces
    if(title.trim()===""){
        return tasks;   // return the list unchanged
    }
    const result=[];
    for(const task of tasks){
        result.push(task);      // copy the existing tasks
    }
    result.push(createTask(nextId(tasks), title, description,priority));
    return result;
}

/*
Returns a new list where the task with the given id has its fields
replaced by the values in `changes`. Other tasks are unchanged.
Example: updateTask(tasks, 3, { title: "New title", priority: "low" })
An edit that would leave the title empty is ignored.
*/
function updateTask(tasks, id, changes){
    // Don't allow an edit that would leave the title empty
    if(changes.title !== undefined && changes.title.trim() === ""){
        return tasks;
    }
    const result=[];

    for (const task of tasks){
        if (task.id === id){
            // Copy the task, then overwrite only the fields in `changes`
            const edited = copyObject(task);
            for(const key in changes){
                edited[key] = changes[key];
            }
            result.push(edited);
        }else {
            result.push(task);
        }
    }
    return result;
}

//Returns a new list without the task that has the given id.
function deleteTask(tasks, id){
    const result = [];
    for(const task of tasks){
        if(task.id !== id){
            result.push(task);  // keep every task except this one
        }
    }
    return result;
}

/*
Returns a new list where the task with the given id switches between
"pending" and "complete". Other tasks are unchanged.
*/
function toggleTaskStatus(tasks, id){
    const result=[];
    for(const task of tasks){
        if(task.id===id){
            const toggled = copyObject(task);
            if(task.status === "pending"){
                toggled.status = "complete";
            }else {
                toggled.status = "pending";
            }
            result.push(toggled);
        }else{
            result.push(task);
        }
    }
    return result;
}