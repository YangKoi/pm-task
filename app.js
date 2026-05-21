/**
 * ZenTask — Premium Task Management Application Logic
 * Implemented using Vanilla JS and LocalStorage
 */

// --- Default Mock Data ---
const DEFAULT_TASKS = [
    {
        id: "task-mock-1",
        title: "Thiết kế Landing Page ZenTask",
        desc: "Xây dựng bản vẽ Figma, chuẩn bị hệ thống màu sắc Glassmorphism và tối ưu hóa các hình ảnh minh họa cho trang chủ.",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days later
        category: "Work",
        priority: "high",
        status: "inprogress",
        subtasks: [
            { id: "sub-1-1", title: "Phác thảo wireframe sơ bộ", completed: true },
            { id: "sub-1-2", title: "Thiết kế giao diện Dark Mode", completed: true },
            { id: "sub-1-3", title: "Tối ưu hóa hình ảnh tài nguyên", completed: false }
        ],
        createdAt: Date.now() - 24 * 60 * 60 * 1000
    },
    {
        id: "task-mock-2",
        title: "Tập thể dục & Đi bộ 5km",
        desc: "Thực hiện vào buổi chiều tối, kết hợp tập các bài cardio nhẹ nhàng để duy trì sức khỏe.",
        dueDate: new Date().toISOString().split('T')[0], // Today
        category: "Health",
        priority: "medium",
        status: "todo",
        subtasks: [
            { id: "sub-2-1", title: "Khởi động nhẹ nhàng 10 phút", completed: false },
            { id: "sub-2-2", title: "Đi bộ nhanh kết hợp chạy bộ 5km", completed: false }
        ],
        createdAt: Date.now()
    },
    {
        id: "task-mock-3",
        title: "Mua sắm đồ dùng gia đình",
        desc: "Mua một số thực phẩm tươi sống, rau củ quả, sữa tắm và giấy ăn cho tuần mới.",
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago (Overdue)
        category: "Shopping",
        priority: "low",
        status: "todo",
        subtasks: [],
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
    },
    {
        id: "task-mock-4",
        title: "Học lập trình Javascript nâng cao",
        desc: "Xem khóa học về Asynchronous JS, Promises, Async/Await và viết thử một ứng dụng Canvas Confetti.",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days later
        category: "Learning",
        priority: "high",
        status: "completed",
        subtasks: [
            { id: "sub-4-1", title: "Học lý thuyết về Event Loop", completed: true },
            { id: "sub-4-2", title: "Viết demo pháo hoa Canvas hoàn chỉnh", completed: true }
        ],
        createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000
    }
];

const CATEGORIES = [
    { id: "all", name: "Tất cả danh mục", icon: "grid" },
    { id: "Work", name: "🏢 Công việc", icon: "briefcase" },
    { id: "Personal", name: "🏠 Cá nhân", icon: "home" },
    { id: "Shopping", name: "🛒 Mua sắm", icon: "shopping-bag" },
    { id: "Health", name: "💖 Sức khỏe", icon: "heart" },
    { id: "Learning", name: "📚 Học tập", icon: "book-open" }
];

// --- Application State ---
let tasks = [];
let tempSubtasks = []; // Temporary subtasks array for modal form
let currentView = "board"; // 'board' | 'list'
let currentCategoryFilter = "all";
let searchQuery = "";
let priorityFilter = "all";
let sortBy = "dueDateAsc";
let currentTheme = "dark";

// --- DOM Elements ---
const viewBoardBtn = document.getElementById("view-board-btn");
const viewListBtn = document.getElementById("view-list-btn");
const boardView = document.getElementById("board-view");
const listView = document.getElementById("list-view");

const categoryFilterList = document.getElementById("category-filter-list");
const searchInput = document.getElementById("search-input");
const priorityFilterSelect = document.getElementById("priority-filter");
const sortSelect = document.getElementById("sort-select");

const statTotalCount = document.getElementById("stat-total-count");
const statProgressCount = document.getElementById("stat-progress-count");
const statOverdueCount = document.getElementById("stat-overdue-count");
const statCompletedCount = document.getElementById("stat-completed-count");
const progressCircle = document.getElementById("progress-circle");
const progressPercentageText = document.getElementById("progress-percentage-text");
const progressRingDesc = document.getElementById("progress-ring-desc");

const themeToggleBtn = document.getElementById("theme-toggle-btn");
const sidebarToggleMobileBtn = document.getElementById("sidebar-toggle-mobile-btn");
const appSidebar = document.getElementById("app-sidebar");
const greetingText = document.getElementById("greeting-text");

// Modal Elements
const taskModal = document.getElementById("task-modal");
const openAddModalBtn = document.getElementById("open-add-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const taskForm = document.getElementById("task-form");
const modalTitle = document.getElementById("modal-title");

const taskIdInput = document.getElementById("task-id");
const taskTitleInput = document.getElementById("task-title-input");
const taskDescInput = document.getElementById("task-desc-input");
const taskDateInput = document.getElementById("task-date-input");
const taskCategoryInput = document.getElementById("task-category-input");

const subtaskNewTitle = document.getElementById("subtask-new-title");
const subtaskAddBtn = document.getElementById("subtask-add-btn");
const modalSubtaskList = document.getElementById("modal-subtask-list");

// Backup Elements
const exportBtn = document.getElementById("export-btn");
const importTriggerBtn = document.getElementById("import-trigger-btn");
const importFileInput = document.getElementById("import-file-input");

// Confetti Canvas
const confettiCanvas = document.getElementById("confetti-canvas");
const ctx = confettiCanvas.getContext("2d");

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    loadTasks();
    setGreeting();
    setupEventListeners();
    setupDragAndDrop();
    renderSidebarCategories();
    renderAll();
    resizeConfettiCanvas();
    window.addEventListener("resize", resizeConfettiCanvas);
});

// --- Theme Handling ---
function loadTheme() {
    const savedTheme = localStorage.getItem("zentask_theme");
    if (savedTheme) {
        currentTheme = savedTheme;
    } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        currentTheme = prefersDark ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", currentTheme);
    updateThemeToggleUI();
}

function updateThemeToggleUI() {
    const label = themeToggleBtn.querySelector(".theme-label");
    if (currentTheme === "dark") {
        label.textContent = "Chế độ tối";
    } else {
        label.textContent = "Chế độ sáng";
    }
}

function toggleTheme() {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("zentask_theme", currentTheme);
    updateThemeToggleUI();
}

// --- Greeting text based on time ---
function setGreeting() {
    const hour = new Date().getHours();
    let text = "Xin chào!";
    if (hour < 12) {
        text = "Chào buổi sáng! 🌅";
    } else if (hour < 18) {
        text = "Chào buổi chiều! ☀️";
    } else {
        text = "Chào buổi tối! 🌙";
    }
    greetingText.textContent = text;
}

// --- Tasks Local Storage ---
function loadTasks() {
    const stored = localStorage.getItem("zentask_tasks");
    if (stored) {
        try {
            tasks = JSON.parse(stored);
        } catch (e) {
            console.error("Lỗi phân tích dữ liệu công việc, sử dụng mặc định", e);
            tasks = DEFAULT_TASKS;
        }
    } else {
        tasks = DEFAULT_TASKS;
        saveTasks();
    }
}

function saveTasks() {
    localStorage.setItem("zentask_tasks", JSON.stringify(tasks));
}

// --- Setup Event Listeners ---
function setupEventListeners() {
    // View Switching
    viewBoardBtn.addEventListener("click", () => switchView("board"));
    viewListBtn.addEventListener("click", () => switchView("list"));

    // Toolbar filtering
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderAll();
    });
    priorityFilterSelect.addEventListener("change", (e) => {
        priorityFilter = e.target.value;
        renderAll();
    });
    sortSelect.addEventListener("change", (e) => {
        sortBy = e.target.value;
        renderAll();
    });

    // Theme toggle
    themeToggleBtn.addEventListener("click", toggleTheme);

    // Mobile Sidebar toggle
    sidebarToggleMobileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        appSidebar.classList.toggle("active");
    });
    document.addEventListener("click", (e) => {
        if (!appSidebar.contains(e.target) && e.target !== sidebarToggleMobileBtn) {
            appSidebar.classList.remove("active");
        }
    });

    // Add Modal Actions
    openAddModalBtn.addEventListener("click", () => openModal());
    closeModalBtn.addEventListener("click", closeModal);
    cancelModalBtn.addEventListener("click", closeModal);
    taskForm.addEventListener("submit", handleFormSubmit);

    // Subtask input enter key
    subtaskNewTitle.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddSubtask();
        }
    });
    subtaskAddBtn.addEventListener("click", handleAddSubtask);

    // Export / Import
    exportBtn.addEventListener("click", exportData);
    importTriggerBtn.addEventListener("click", () => importFileInput.click());
    importFileInput.addEventListener("change", importData);
}

// --- View Switcher ---
function switchView(view) {
    currentView = view;
    if (view === "board") {
        viewBoardBtn.classList.add("active");
        viewListBtn.classList.remove("active");
        boardView.classList.add("active");
        listView.classList.remove("active");
    } else {
        viewBoardBtn.classList.remove("active");
        viewListBtn.classList.add("active");
        boardView.classList.remove("active");
        listView.classList.add("active");
    }
    renderAll();
}

// --- Render Sidebar Categories ---
function renderSidebarCategories() {
    categoryFilterList.innerHTML = "";
    CATEGORIES.forEach(cat => {
        const count = cat.id === "all" 
            ? tasks.length 
            : tasks.filter(t => t.category === cat.id).length;
        
        const btn = document.createElement("button");
        btn.className = `category-btn ${currentCategoryFilter === cat.id ? "active" : ""}`;
        btn.innerHTML = `
            <span class="category-name">
                <i data-lucide="${cat.icon || 'tag'}"></i>
                <span>${cat.name}</span>
            </span>
            <span class="category-count">${count}</span>
        `;
        btn.addEventListener("click", () => {
            currentCategoryFilter = cat.id;
            renderSidebarCategories();
            renderAll();
            // Close mobile sidebar on select
            appSidebar.classList.remove("active");
        });
        categoryFilterList.appendChild(btn);
    });
    lucide.createIcons();
}

// --- Analytics Update ---
function updateAnalytics() {
    const total = tasks.length;
    const inProgress = tasks.filter(t => t.status === "inprogress").length;
    const completed = tasks.filter(t => t.status === "completed").length;
    
    // Calculate Overdue
    const todayStr = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter(t => t.status !== "completed" && t.dueDate < todayStr).length;

    statTotalCount.textContent = total;
    statProgressCount.textContent = inProgress;
    statOverdueCount.textContent = overdue;
    statCompletedCount.textContent = completed;

    // SVG Progress circle updating
    const radius = 42;
    const circumference = 2 * Math.PI * radius; // ~263.89
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;

    let percent = 0;
    if (total > 0) {
        percent = Math.round((completed / total) * 100);
    }
    
    progressPercentageText.textContent = `${percent}%`;
    
    // Stroke offset animation
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;

    // Motivational dynamic descriptions
    let desc = "Hãy lập kế hoạch và hoàn thành công việc đầu tiên!";
    if (percent > 0 && percent < 40) {
        desc = "Khởi đầu tốt! Hãy tiếp tục hoàn thành các việc nhỏ tiếp theo nhé. 💪";
    } else if (percent >= 40 && percent < 80) {
        desc = "Tuyệt vời! Bạn đang làm rất tốt, hiệu suất công việc rất ổn định. ✨";
    } else if (percent >= 80 && percent < 100) {
        desc = "Gần như hoàn hảo! Chỉ còn vài nhiệm vụ nữa là kết thúc ngày trọn vẹn rồi. 🚀";
    } else if (percent === 100 && total > 0) {
        desc = "Xuất sắc! Bạn đã hoàn thành 100% mục tiêu ngày hôm nay! Ăn mừng thôi! 🎉";
    }
    progressRingDesc.textContent = desc;
}

// --- Filtering & Sorting Core logic ---
function getFilteredAndSortedTasks() {
    let result = [...tasks];

    // 1. Category Filter
    if (currentCategoryFilter !== "all") {
        result = result.filter(t => t.category === currentCategoryFilter);
    }

    // 2. Priority Filter
    if (priorityFilter !== "all") {
        result = result.filter(t => t.priority === priorityFilter);
    }

    // 3. Search query filter
    if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        result = result.filter(t => 
            t.title.toLowerCase().includes(query) || 
            t.desc.toLowerCase().includes(query)
        );
    }

    // 4. Sorting
    result.sort((a, b) => {
        if (sortBy === "dueDateAsc") {
            return a.dueDate.localeCompare(b.dueDate);
        } else if (sortBy === "dueDateDesc") {
            return b.dueDate.localeCompare(a.dueDate);
        } else if (sortBy === "priorityDesc") {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            return priorityWeight[b.priority] - priorityWeight[a.priority];
        } else if (sortBy === "titleAsc") {
            return a.title.localeCompare(b.title);
        }
        return 0;
    });

    return result;
}

// --- Master Render Function ---
function renderAll() {
    updateAnalytics();
    
    const filteredTasks = getFilteredAndSortedTasks();

    if (currentView === "board") {
        renderBoardView(filteredTasks);
    } else {
        renderListView(filteredTasks);
    }
    
    // Update Lucide Icons
    lucide.createIcons();
}

// --- Render Board Kanban ---
function renderBoardView(filteredTasks) {
    const columns = {
        todo: document.getElementById("list-todo"),
        inprogress: document.getElementById("list-inprogress"),
        review: document.getElementById("list-review"),
        completed: document.getElementById("list-completed")
    };

    // Clean columns
    Object.values(columns).forEach(col => col.innerHTML = "");

    // Count columns tasks
    const colCounts = { todo: 0, inprogress: 0, review: 0, completed: 0 };

    filteredTasks.forEach(task => {
        if (columns[task.status]) {
            colCounts[task.status]++;
            const card = createTaskCard(task);
            columns[task.status].appendChild(card);
        }
    });

    // Update headers counts
    document.getElementById("count-todo").textContent = colCounts.todo;
    document.getElementById("count-inprogress").textContent = colCounts.inprogress;
    document.getElementById("count-review").textContent = colCounts.review;
    document.getElementById("count-completed").textContent = colCounts.completed;
}

// --- Create Task Card Element ---
function createTaskCard(task) {
    const card = document.createElement("div");
    card.className = "task-card";
    card.draggable = true;
    card.dataset.id = task.id;

    // Check overdue
    const todayStr = new Date().toISOString().split('T')[0];
    const isOverdue = task.status !== "completed" && task.dueDate < todayStr;

    // Subtasks calculations
    let subtaskHTML = "";
    if (task.subtasks && task.subtasks.length > 0) {
        const comp = task.subtasks.filter(s => s.completed).length;
        const total = task.subtasks.length;
        const pct = Math.round((comp / total) * 100);
        subtaskHTML = `
            <div class="task-card-subtasks">
                <div class="card-subtask-header">
                    <span>Việc phụ</span>
                    <span>${comp}/${total} (${pct}%)</span>
                </div>
                <div class="card-progress-bar-bg">
                    <div class="card-progress-bar-fill" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }

    // Category mappings
    const categoryClassMap = {
        Work: "cat-work",
        Personal: "cat-personal",
        Shopping: "cat-shopping",
        Health: "cat-health",
        Learning: "cat-learning"
    };
    const catClass = categoryClassMap[task.category] || "cat-default";

    // Priority display
    const priorityLabelMap = { high: "Cao", medium: "Trung bình", low: "Thấp" };
    const priorityLabel = priorityLabelMap[task.priority] || "Thấp";

    card.innerHTML = `
        <div class="task-card-header">
            <span class="task-tag ${catClass}">${task.category}</span>
            <div class="task-actions-menu">
                <button class="card-action-btn edit-btn" title="Chỉnh sửa công việc">
                    <i data-lucide="edit-3"></i>
                </button>
                <button class="card-action-btn delete delete-btn" title="Xóa công việc">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
        <div class="task-card-body">
            <h4>${escapeHTML(task.title)}</h4>
            ${task.desc ? `<p>${escapeHTML(task.desc)}</p>` : ""}
        </div>
        ${subtaskHTML}
        <div class="task-card-footer">
            <div class="task-due-date ${isOverdue ? "is-overdue" : ""}">
                <i data-lucide="calendar"></i>
                <span>${formatDate(task.dueDate)}</span>
            </div>
            <div class="task-priority-indicator priority-${task.priority}">
                <span>${priorityLabel}</span>
            </div>
        </div>
    `;

    // Add buttons click event inside cards
    card.querySelector(".edit-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(task.id);
    });
    card.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        handleDeleteTask(task.id);
    });

    return card;
}

// --- Render List View Panel ---
function renderListView(filteredTasks) {
    const tbody = document.getElementById("list-view-tbody");
    const emptyState = document.getElementById("list-empty-state");

    tbody.innerHTML = "";

    if (filteredTasks.length === 0) {
        emptyState.style.display = "flex";
        return;
    } else {
        emptyState.style.display = "none";
    }

    // Status map names in Vietnamese
    const statusVietnamese = {
        todo: "Cần làm",
        inprogress: "Đang làm",
        review: "Đang duyệt",
        completed: "Đã xong"
    };

    filteredTasks.forEach(task => {
        // Overdue check
        const todayStr = new Date().toISOString().split('T')[0];
        const isOverdue = task.status !== "completed" && task.dueDate < todayStr;

        // Subtask rendering
        let subtasksProgress = "-";
        if (task.subtasks && task.subtasks.length > 0) {
            const comp = task.subtasks.filter(s => s.completed).length;
            const total = task.subtasks.length;
            const pct = Math.round((comp / total) * 100);
            subtasksProgress = `
                <div class="list-progress-bar-container">
                    <span>${comp}/${total}</span>
                    <div class="list-progress-bar-bg">
                        <div class="card-progress-bar-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <span class="status-badge status-${task.status}">${statusVietnamese[task.status] || task.status}</span>
            </td>
            <td>
                <div class="list-task-title">${escapeHTML(task.title)}</div>
                ${task.desc ? `<div class="list-task-desc">${escapeHTML(task.desc)}</div>` : ""}
            </td>
            <td>
                <span class="task-tag cat-${task.category ? task.category.toLowerCase() : "default"}">${task.category}</span>
            </td>
            <td>
                <div class="task-due-date ${isOverdue ? "is-overdue" : ""}">
                    <span>${formatDate(task.dueDate)}</span>
                </div>
            </td>
            <td>
                <div class="task-priority-indicator priority-${task.priority}">
                    <span>${task.priority === "high" ? "Cao" : task.priority === "medium" ? "Trung bình" : "Thấp"}</span>
                </div>
            </td>
            <td>${subtasksProgress}</td>
            <td>
                <div class="list-actions">
                    <button class="card-action-btn edit-list-btn" title="Sửa">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="card-action-btn delete delete-list-btn" title="Xóa">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;

        tr.querySelector(".edit-list-btn").addEventListener("click", () => openModal(task.id));
        tr.querySelector(".delete-list-btn").addEventListener("click", () => handleDeleteTask(task.id));

        tbody.appendChild(tr);
    });
}

// --- Drag & Drop Kanban Implementation ---
function setupDragAndDrop() {
    const listContainers = document.querySelectorAll(".task-list-container");

    // Add events on grid column targets
    listContainers.forEach(container => {
        container.addEventListener("dragover", (e) => {
            e.preventDefault();
            container.classList.add("drag-over");
        });

        container.addEventListener("dragleave", () => {
            container.classList.remove("drag-over");
        });

        container.addEventListener("drop", (e) => {
            e.preventDefault();
            container.classList.remove("drag-over");
            const taskId = e.dataTransfer.getData("text/plain");
            const newStatus = container.dataset.status;

            if (taskId && newStatus) {
                handleMoveTask(taskId, newStatus);
            }
        });
    });

    // Delegate drag events inside board-view for cards
    boardView.addEventListener("dragstart", (e) => {
        const card = e.target.closest(".task-card");
        if (card) {
            card.classList.add("dragging");
            e.dataTransfer.setData("text/plain", card.dataset.id);
            e.dataTransfer.effectAllowed = "move";
        }
    });

    boardView.addEventListener("dragend", (e) => {
        const card = e.target.closest(".task-card");
        if (card) {
            card.classList.remove("dragging");
        }
    });
}

// --- Handle moving tasks (Drag-drop state) ---
function handleMoveTask(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const oldStatus = task.status;
    if (oldStatus === newStatus) return;

    task.status = newStatus;
    
    // Auto complete subtasks if moved to completed
    if (newStatus === "completed" && task.subtasks) {
        task.subtasks.forEach(sub => sub.completed = true);
    }

    saveTasks();
    renderSidebarCategories();
    renderAll();

    // Trigger celebration if newly completed!
    if (newStatus === "completed" && oldStatus !== "completed") {
        triggerConfettiCelebration();
    }
}

// --- Delete Task Logic ---
function handleDeleteTask(taskId) {
    if (confirm("Bạn có chắc chắn muốn xóa công việc này không?")) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderSidebarCategories();
        renderAll();
    }
}

// --- Modal Add / Edit Operations ---
function openModal(editingTaskId = null) {
    taskModal.classList.add("active");
    tempSubtasks = [];

    // Set today as minimum due date input by default
    const todayStr = new Date().toISOString().split('T')[0];
    taskDateInput.value = todayStr;

    if (editingTaskId) {
        const task = tasks.find(t => t.id === editingTaskId);
        if (task) {
            modalTitle.textContent = "Chỉnh Sửa Công Việc";
            taskIdInput.value = task.id;
            taskTitleInput.value = task.title;
            taskDescInput.value = task.desc || "";
            taskDateInput.value = task.dueDate;
            taskCategoryInput.value = task.category;
            
            // Radio priority check
            const radio = taskForm.querySelector(`input[name="priority"][value="${task.priority}"]`);
            if (radio) radio.checked = true;

            // Load subtasks
            if (task.subtasks) {
                tempSubtasks = [...task.subtasks];
            }
        }
    } else {
        modalTitle.textContent = "Tạo Công Việc Mới";
        taskIdInput.value = "";
        taskForm.reset();
        // default priority
        taskForm.querySelector('input[name="priority"][value="low"]').checked = true;
    }

    renderModalSubtasks();
}

function closeModal() {
    taskModal.classList.remove("active");
    taskForm.reset();
    tempSubtasks = [];
}

// --- Modal Subtasks Add/Remove list UI ---
function renderModalSubtasks() {
    modalSubtaskList.innerHTML = "";
    tempSubtasks.forEach((sub, index) => {
        const li = document.createElement("li");
        li.className = "modal-subtask-item";
        li.innerHTML = `
            <div class="subtask-item-left ${sub.completed ? "completed" : ""}">
                <div class="subtask-checkbox">
                    <i data-lucide="check"></i>
                </div>
                <span>${escapeHTML(sub.title)}</span>
            </div>
            <button type="button" class="subtask-delete-btn" title="Xóa việc phụ">
                <i data-lucide="trash-2"></i>
            </button>
        `;

        // Checkbox click event
        li.querySelector(".subtask-item-left").addEventListener("click", () => {
            tempSubtasks[index].completed = !tempSubtasks[index].completed;
            renderModalSubtasks();
        });

        // Delete button click event
        li.querySelector(".subtask-delete-btn").addEventListener("click", () => {
            tempSubtasks.splice(index, 1);
            renderModalSubtasks();
        });

        modalSubtaskList.appendChild(li);
    });
    lucide.createIcons();
}

function handleAddSubtask() {
    const title = subtaskNewTitle.value.trim();
    if (title === "") return;

    tempSubtasks.push({
        id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title,
        completed: false
    });

    subtaskNewTitle.value = "";
    renderModalSubtasks();
    subtaskNewTitle.focus();
}

// --- Form submission inside Modal ---
function handleFormSubmit(e) {
    e.preventDefault();

    const id = taskIdInput.value;
    const title = taskTitleInput.value.trim();
    const desc = taskDescInput.value.trim();
    const dueDate = taskDateInput.value;
    const category = taskCategoryInput.value;
    const priority = taskForm.querySelector('input[name="priority"]:checked').value;

    if (title === "") return;

    if (id) {
        // Editing existing task
        const task = tasks.find(t => t.id === id);
        if (task) {
            const wasCompleted = task.status === "completed";
            
            task.title = title;
            task.desc = desc;
            task.dueDate = dueDate;
            task.category = category;
            task.priority = priority;
            task.subtasks = [...tempSubtasks];

            // If subtasks are added, keep status sync logic if relevant
            // Let's check if all subtasks are finished, we DO NOT auto-set status completed,
            // but if task status is completed, all subtasks should be marked completed
            if (task.status === "completed" && task.subtasks.some(s => !s.completed)) {
                // If user marks a task completed in list but subtask isn't, or vice-versa, keep it flexible
            }

            saveTasks();
            
            // Trigger confetti if newly completed
            if (task.status === "completed" && !wasCompleted) {
                triggerConfettiCelebration();
            }
        }
    } else {
        // Add new task
        const newTask = {
            id: `task-${Date.now()}`,
            title: title,
            desc: desc,
            dueDate: dueDate,
            category: category,
            priority: priority,
            status: "todo",
            subtasks: [...tempSubtasks],
            createdAt: Date.now()
        };

        tasks.push(newTask);
        saveTasks();
    }

    closeModal();
    renderSidebarCategories();
    renderAll();
}

// --- Export JSON Backup ---
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `zentask_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// --- Import JSON Backup ---
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const imported = JSON.parse(evt.target.result);
            if (Array.isArray(imported)) {
                // Validate some basic structures
                const isValid = imported.every(t => t.id && t.title && t.status);
                if (isValid) {
                    if (confirm("Bạn có muốn ghi đè toàn bộ công việc hiện tại bằng dữ liệu nhập khẩu không?")) {
                        tasks = imported;
                        saveTasks();
                        renderSidebarCategories();
                        renderAll();
                        alert("Nhập dữ liệu sao lưu thành công!");
                    }
                } else {
                    alert("Định dạng file sao lưu không hợp lệ. Vui lòng kiểm tra lại.");
                }
            } else {
                alert("Nội dung file JSON phải là một mảng các công việc.");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi khi đọc file sao lưu JSON. Hãy chắc chắn tệp của bạn không bị hỏng.");
        }
    };
    reader.readAsText(file);
    // Reset file input value to allow uploading same file again
    importFileInput.value = "";
}

// --- Helper Functions ---
function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

// ==========================================================================
// Canvas Confetti Celebrations Engine
// ==========================================================================
let confettiActive = false;
let confettiParticles = [];
const confettiColors = ["#8b5cf6", "#a78bfa", "#3b82f6", "#10b981", "#ef4444", "#fbbf24", "#ec4899"];

function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

class ConfettiParticle {
    constructor() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = Math.random() * -100 - 20; // Start offscreen
        this.size = Math.random() * 6 + 4;
        this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 5 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
        this.opacity = 1;
        this.opacitySpeed = Math.random() * 0.005 + 0.002;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.opacity -= this.opacitySpeed;

        // Oscillate left/right slightly
        this.speedX += Math.sin(this.y / 30) * 0.05;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        
        // Render simple rectangular particles
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        
        ctx.restore();
    }
}

function triggerConfettiCelebration() {
    resizeConfettiCanvas();
    confettiParticles = [];
    
    // Spawn 150 confetti particles
    for (let i = 0; i < 150; i++) {
        confettiParticles.push(new ConfettiParticle());
    }

    if (!confettiActive) {
        confettiActive = true;
        animateConfetti();
    }
}

function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    // Update and draw each particle
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.update();
        p.draw();

        // Remove dead particles
        if (p.opacity <= 0 || p.y > confettiCanvas.height) {
            confettiParticles.splice(i, 1);
        }
    }

    if (confettiParticles.length > 0) {
        requestAnimationFrame(animateConfetti);
    } else {
        confettiActive = false;
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}
