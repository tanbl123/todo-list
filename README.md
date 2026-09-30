# ASD Interview Questions

## Instructions

- Fork this repository into your own GitHub account. If you don't have a GitHub account, please create one.
- Commit all your changes to your forked repository, following clean Git commit hygiene.
    - Demonstrate clean Git commit hygiene, following best practices for commit messages and organizing your commits.
    - For guidelines on clean Git commit hygiene, you can refer to [this source](https://cbea.ms/git-commit/).
- Place all your source code files in the `src` folder.
- The bonus challenge is optional but greatly welcomed. You can choose to tackle it if you'd like.
- Include comments in your code to explain your approach, algorithms, and any important details.
- Additionally, if possible, include test cases for your solutions.

# Problem - To-Do List Web Application

Your mission is to develop a basic To-Do List web application. You have the flexibility to use fundamental HTML, CSS, and JavaScript or opt for a broader range of web stacks, such as React, Bootstrap, Angular, Laravel, or even WebAssembly (WASM). This application must enable users to seamlessly add, modify, and remove tasks, each characterized by a title, description, status (complete or pending), and priority. The design should be clean and intuitive.

## Requirements

1. Create a user interface using HTML and CSS to display a list of tasks.
2. Implement functionality using JavaScript to add new tasks, edit existing tasks, and mark tasks as completed or not.
3. Allow users to input a title and description for each task.
4. Implement a feature to prioritize tasks (e.g., high, medium, low).
5. Display tasks with appropriate styling to indicate their completion status.
6. Provide options to edit or delete tasks.

## Evaluation Criteria

1. Correct implementation of task creation, editing, and deletion.
2. Proper handling of task status and user interactions.
3. Clear and concise indication of task priority.
4. User interface design and user experience.
5. Code organization, clarity, and maintainability.
6. Proper usage of HTML, CSS, and JavaScript.
7. Documentation explaining how to run the application and any additional features you've implemented.

## Bonus (Optional)

1. Ensure responsive design, so the web application is usable on both desktop and mobile devices.
2. Add animations or transitions to enhance the user experience.

---

## My Solution

A To-Do List web application built with plain **HTML, CSS and JavaScript**. It needs no installation, server or build step.

### How to run

1. Clone or download this repository.
2. Open `src/index.html` in any modern browser (Chrome, Edge, Firefox or Safari).

Tasks are saved in the browser's `localStorage`, so they are kept after the page is refreshed or the browser is closed.

### How to run the tests

Open `src/tests.html` in a browser. It runs automated tests on the task logic in `tasks.js` and shows each result as passed (green) or failed (red), with a summary at the bottom.

### Features

- **Add tasks** with a title, an optional description and a priority (high, medium or low).
- **Edit tasks:** clicking Edit loads the task into the form; Save Changes updates it, and Cancel leaves it unchanged.
- **Delete tasks**, with a confirmation prompt to prevent accidental deletion.
- **Mark tasks as complete or pending** with a checkbox. Completed tasks are faded and crossed out.
- **Priority** is shown clearly in two ways: a coloured label (red HIGH, amber MEDIUM, green LOW) and a coloured left edge on each task. Priority is shown as text as well as colour, so it is readable for colour-blind users.

### Additional features

- **Tasks are saved** in `localStorage` and restored when the page is opened again.
- **Validation:** a task must have a title. A title made only of spaces is rejected with a message, and the form keeps what the user typed. Titles are limited to 200 characters and descriptions to 500.
- **Empty state:** a message is shown when there are no tasks.
- **Accessibility:** labelled form fields, visible focus outlines for keyboard users, and user text is always displayed as plain text (never as HTML), which prevents code injection.

### Bonus

- **Responsive design:** on screens 600px wide or less, the layout adapts: each task's label and buttons move onto their own line, and buttons and checkboxes become larger for touch. The page includes a viewport meta tag so it scales correctly on phones.
- **Animations:** new tasks slide in, completed or edited tasks briefly glow, deleted tasks fade out, and buttons change colour smoothly. Animations are reduced to almost nothing when the user's system has "reduce motion" enabled.

### Project structure

| File | Purpose |
|---|---|
| `src/index.html` | Page structure: the task form and the task list |
| `src/styles.css` | Layout, colours, completed and priority styling, responsive design and animations |
| `src/tasks.js` | Task logic only: create, add, edit, delete and toggle tasks. It never touches the page, so it can be tested on its own |
| `src/app.js` | Connects the page to the task logic: reads the form, handles clicks, redraws the list and saves to `localStorage` |
| `src/tests.html` | Automated tests for `tasks.js` |

### Design decisions

- **Logic separated from the page:** `tasks.js` works only with data, and every function returns a new list without changing the original. This keeps the logic predictable and easy to test.
- **One page for adding and viewing:** the form and the list are on the same page, so new tasks appear immediately without navigating.
- **The whole list is redrawn after every change**, directly from the task data, so the page can never get out of sync with the saved tasks.
- **Task ids** are one more than the highest existing id, which guarantees each id is unique.
- **Completed tasks can still be edited and deleted**, so the user can correct details or remove finished tasks.