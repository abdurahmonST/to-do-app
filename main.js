const tasksList = document.getElementById("tasks-list");
const form = document.getElementById("form");
const searchInput = document.getElementById("search-input");
const reverseBtn = document.getElementById("reverse-btn");
const archiveToggleBtn = document.getElementById("archive-toggle-btn");
const taskStats = document.getElementById("task-stats");

const actionTypes = {
    set: "set",
    get: "get",
    clear: "clear"
}

let isReversed = false;
let showArchived = false;
let searchQuery = '';
let tasks = [];

const useLSTasks = (actionType, obj) => {
    if (actionType === actionTypes.get)
        return JSON.parse(localStorage.getItem("tasks"));
    if (actionType === actionTypes.set)
        localStorage.setItem("tasks", JSON.stringify(obj));
    if (actionType === actionTypes.clear)
        localStorage.clear();
}

const lsTasks = useLSTasks(actionTypes.get);
if (lsTasks) {
    tasks = lsTasks;
} else {
    tasks = [
        {
            title: "Example task title",
            desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi officia porro, quos mollitia iste maxime delectus, sint corporis quas quasi libero, natus ullam ad voluptatem placeat voluptatum sapiente praesentium ratione.",
            id: 1,
            completed: false,
            archived: false,
            createdAt: new Date().toISOString()
        }
    ];
    useLSTasks(actionTypes.set, tasks);
}

searchInput.addEventListener('input', function(e) {
    searchQuery = e.target.value.toLowerCase();
    writeToDoc();
});

reverseBtn.addEventListener('click', function() {
    isReversed = !isReversed;
    this.textContent = isReversed ? 'Normal Order' : 'Reverse Order';
    writeToDoc();
});

archiveToggleBtn.addEventListener('click', function() {
    showArchived = !showArchived;
    this.textContent = showArchived ? 'Show Active' : 'Show Archived';
    writeToDoc();
});

function getFilteredTasks() {
    let filtered = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery) || 
                            task.desc.toLowerCase().includes(searchQuery);
        const matchesArchiveFilter = showArchived ? task.archived : !task.archived;
        return matchesSearch && matchesArchiveFilter;
    });

    return filtered;
}

function writeToDoc() {
    tasksList.innerHTML = "";
    
    const filteredTasks = getFilteredTasks();
    
    if (!filteredTasks.length) {
        let emptyMessage = '';
        if (searchQuery) {
            emptyMessage = 'No tasks found matching your search.';
        } else if (showArchived) {
            emptyMessage = 'No archived tasks.';
        } else {
            emptyMessage = 'No active tasks. Add one above!';
        }
        
        tasksList.innerHTML = `<p class="text-center text-slate-500 text-lg border py-2 rounded border-slate-400">${emptyMessage}</p>`;
        updateStats();
        return;
    }

    const readyArray = sortTasks(filteredTasks);
    
    readyArray.forEach(task => {
        const taskDate = task.createdAt ? new Date(task.createdAt) : new Date();
        
        tasksList.innerHTML += `
            <div class="border p-4 rounded border-slate-400 ${task.archived ? 'opacity-75 bg-slate-800' : ''}">
                <p class="font-bold text-lg ${task.completed || task.archived ? 'line-through' : ''}">${task.title}</p>
                <p class="text-sm text-slate-400 mb-2 ${task.archived ? 'line-through' : ''}">${task.desc}</p>
                <div class="flex justify-between items-center mt-3">
                    <span class="text-xs text-slate-500">
                        ${taskDate.toLocaleDateString()} ${taskDate.toLocaleTimeString()}
                    </span>
                    <div class="flex gap-2">
                        <button 
                            onclick="completeTask(${task.id})"
                            ${task.completed || task.archived ? "disabled" : ""} 
                            class="bg-slate-600 text-white px-2 py-1 rounded text-sm ${task.completed || task.archived ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'}">
                                ${task.completed ? 'Completed' : 'Complete'}
                        </button>
                        <button
                            onclick="toggleArchive(${task.id})"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm">
                                ${task.archived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button
                            onclick="deleteTask(${task.id})"
                            class="bg-red-400 hover:bg-red-500 text-white px-2 py-1 rounded text-sm">
                                Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    updateStats();
}

function updateStats() {
    if (tasks.length > 0) {
        const activeTasks = tasks.filter(t => !t.archived && !t.completed).length;
        const completedTasks = tasks.filter(t => t.completed && !t.archived).length;
        const archivedTasks = tasks.filter(t => t.archived).length;
        
        taskStats.innerHTML = `
            Total: ${tasks.length} | Active: ${activeTasks} | Completed: ${completedTasks} | Archived: ${archivedTasks}
        `;
        taskStats.classList.remove('hidden');
    } else {
        taskStats.classList.add('hidden');
    }
}

writeToDoc();

form.addEventListener("submit", e => {
    e.preventDefault();
    
    const newTask = {
        title: e.target.title.value,
        desc: e.target.desc.value,
        id: Math.max(...tasks.map(t => t.id), 0) + 1,
        completed: false,
        archived: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    useLSTasks(actionTypes.set, tasks); 
    writeToDoc();
    form.reset();
});

function sortTasks(tasksArr) {
    let sorted = [...tasksArr].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
    });
    
    if (isReversed) {
        sorted = sorted.reverse();
    }
    
    return sorted;
}

function completeTask(taskId) {
    tasks = tasks.map(task => {
        if (task.id == taskId) {
            task = {
                ...task,
                completed: true
            }
        }
        return task;
    });

    useLSTasks(actionTypes.set, tasks);
    writeToDoc();
}

function toggleArchive(taskId) {
    tasks = tasks.map(task => {
        if (task.id == taskId) {
            task = {
                ...task,
                archived: !task.archived
            }
        }
        return task;
    });

    useLSTasks(actionTypes.set, tasks);
    writeToDoc();
}

function deleteTask(taskId) {
    if (confirm("Are you sure to delete this task?")) {
        tasks = tasks.filter(task => task.id !== taskId);
        useLSTasks(actionTypes.set, tasks);
        writeToDoc();
    }
}