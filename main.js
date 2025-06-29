const tasksList = document.getElementById("tasks-list");
const form = document.getElementById("form");

const actionTypes = {
    set: "set",
    get: "get",
    clear: "clear"
}

const useLSTasks = (actionType, obj) => {
    if (actionType === actionTypes.get)
        return JSON.parse(localStorage.getItem("tasks"));

    if (actionType === actionTypes.set)
        localStorage.setItem("tasks", JSON.stringify(obj));

    if (actionType === actionTypes.clear)
        localStorage.clear();
}

let tasks = [
    {
        title: "Example task title",
        desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi officia porro, quos mollitia iste maxime delectus, sint corporis quas quasi libero, natus ullam ad voluptatem placeat voluptatum sapiente praesentium ratione.",
        id: 1,
        completed: false,
    }
];

const lsTasks = useLSTasks(actionTypes.get);

lsTasks
    ? tasks = lsTasks
    : useLSTasks(actionTypes.set, tasks);

function writeToDoc() {
    tasksList.innerHTML = "";

    if (!tasks.length) {
        tasksList.innerHTML = '<p class="text-center text-slate-500 text-lg border py-2 rounded border-slate-400">Empty</p>'
        return;
    };

    const readyArray = sortTasks(tasks);

    readyArray.forEach(task => {
        tasksList.innerHTML += `
            <div class="border p-2 rounded border-slate-400">
                <p class="font-bold text-lg ${task.completed ? 'line-through' : ''}">${task.title}</p>
                <p class="text-sm text-slate-400 mb-2">${task.desc}</p>
                <button 
                    onclick="completeTask(${task.id})"
                    ${task.completed ? "disabled" : ""} 
                    class="bg-slate-600 text-white px-2 py-1 rounded text-sm">
                        ${task.completed ? 'Completed' : 'Complete'}
                </button>
                <button
                    onclick="deleteTask(${task.id})"
                    class="bg-red-400 text-white px-2 py-1 rounded text-sm">
                        Delete
                </button>
            </div>
        `;
    })
}

writeToDoc();


form.addEventListener("submit", e => {
    e.preventDefault();

    tasks.push({
        title: e.target.title.value,
        desc: e.target.desc.value,
        id: tasks.length + 1,
        completed: false,
    });

    useLSTasks(actionTypes.set, tasks); 
    writeToDoc();
    form.reset();
});

function sortTasks(tasksArr) {
    return tasksArr.sort((a, b) => b.id - a.id)
};

function completeTask(taskId) {
    tasks = tasks.map(task => {
        if (task.id == taskId) {
            task = {
                ...task,
                completed: true
            }
        };

        return task;
    });

    useLSTasks(actionTypes.set, tasks);
    writeToDoc();
};

function deleteTask(taskId) {
    if (confirm("Are you sure to delete this task?")) {
        tasks = tasks.filter(task => task.id !== taskId);

        writeToDoc();
        useLSTasks(actionTypes.set, tasks)
    }
}

