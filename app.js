/**
 * TG-Task — Premium Task Management Application Logic
 * Implemented using Vanilla JS and LocalStorage
 */

// --- Default Mock Data ---
const DEFAULT_TASKS = [
    {
        id: "task-mock-1",
        title: "Thiết kế Landing Page TG-Task",
        desc: "Xây dựng bản vẽ Figma, chuẩn bị hệ thống màu sắc Glassmorphism và tối ưu hóa các hình ảnh minh họa cho trang chủ.",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days later
        category: "Work",
        priority: "high",
        status: "inprogress",
        assignee: "Trần Minh Quân",
        assigneeColor: "purple",
        progress: 66,
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
        assignee: "Nguyễn Hoàng Nam",
        assigneeColor: "blue",
        progress: 0,
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
        assignee: "Phạm Thùy Chi",
        assigneeColor: "orange",
        progress: 0,
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
        assignee: "Lê Quang Bách",
        assigneeColor: "green",
        progress: 100,
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

const VIETNAMESE_MONTHS = [
    "Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu",
    "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"
];

// --- Google Drive Client Credentials ---
const DEFAULT_GDRIVE_CLIENT_ID = "889420446489-vq1u1ua4bv2eo0umadm99p8qjbchi0t1.apps.googleusercontent.com"; // Dán Google Client ID của bạn vào đây. Khi dán vào, tất cả người dùng khác sẽ không cần cấu hình thủ công nữa.
let gdriveClientId = "";
let gdriveAccessToken = "";

// --- Application State ---
let tasks = [];
let tempSubtasks = []; // Temporary subtasks array for modal form
let currentView = "board"; // 'board' | 'list' | 'calendar'
let currentCalendarDate = new Date(); // Current date for calendar view navigation
let currentCategoryFilter = "all";
let searchQuery = "";
let priorityFilter = "all";
let sortBy = "dueDateAsc";
let currentTheme = "dark";
let currentPeriodFilter = "all"; // 'all' | 'week' | 'month'
let currentDateFilter = ""; // 'YYYY-MM-DD' | ''
let activeMobileKanbanColumn = "todo"; // Cột Kanban active hiện tại trên mobile
// --- Google Drive Sync State ---
let isGDriveConfigured = false;
let isSyncingGDrive = false;
let gdriveUserEmail = "";
let gdriveUserName = "";
let gdriveUserAvatar = "";

// --- DOM Elements ---
const viewBoardBtn = document.getElementById("view-board-btn");
const viewListBtn = document.getElementById("view-list-btn");
const viewCalendarBtn = document.getElementById("view-calendar-btn");
const boardView = document.getElementById("board-view");
const listView = document.getElementById("list-view");
const calendarView = document.getElementById("calendar-view");
const calendarDaysGrid = document.getElementById("calendar-days-grid");
const calMonthYearText = document.getElementById("cal-month-year");
const calPrevBtn = document.getElementById("cal-prev-btn");
const calNextBtn = document.getElementById("cal-next-btn");
const calTodayBtn = document.getElementById("cal-today-btn");
const calFilterOffice = document.getElementById("cal-filter-office");
const calFilterSite = document.getElementById("cal-filter-site");

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
const taskStartDateInput = document.getElementById("task-start-date-input");
const taskStartHourInput = document.getElementById("task-start-hour-input");
const taskStartMinuteInput = document.getElementById("task-start-minute-input");
const taskDateInput = document.getElementById("task-date-input");
const taskHourInput = document.getElementById("task-hour-input");
const taskMinuteInput = document.getElementById("task-minute-input");
const taskCategoryInput = document.getElementById("task-category-input");
const taskIncludeSaturdayInput = document.getElementById("task-include-saturday-input");
const taskIncludeSundayInput = document.getElementById("task-include-sunday-input");

const subtaskNewTitle = document.getElementById("subtask-new-title");
const subtaskAddBtn = document.getElementById("subtask-add-btn");
const modalSubtaskList = document.getElementById("modal-subtask-list");

const taskAssigneeInput = document.getElementById("task-assignee-input");
const taskStatusInput = document.getElementById("task-status-input");
const taskProgressInput = document.getElementById("task-progress-input");
const progressValLabel = document.getElementById("progress-val-label");

// Backup Elements
const exportBtn = document.getElementById("export-btn");
const importTriggerBtn = document.getElementById("import-trigger-btn");
const importFileInput = document.getElementById("import-file-input");

// Google Drive UI Elements
const userProfileSection = document.getElementById("user-profile-section");
const gdriveConfigBtn = document.getElementById("gdrive-config-btn");
const gdriveConfigModal = document.getElementById("gdrive-config-modal");
const closeGDriveModalBtn = document.getElementById("close-gdrive-modal-btn");
const cancelGDriveModalBtn = document.getElementById("cancel-gdrive-modal-btn");
const gdriveConfigForm = document.getElementById("gdrive-config-form");
const resetGDriveConfigBtn = document.getElementById("reset-gdrive-config-btn");
const gdriveStatusBanner = document.getElementById("gdrive-status-banner");
const gdriveStatusText = document.getElementById("gdrive-status-text");

const gdriveClientIdInput = document.getElementById("gdrive-client-id");
const gdriveSyncBtn = document.getElementById("gdrive-sync-btn");
const gdriveManualSyncActions = document.getElementById("gdrive-manual-sync-actions");
const gdriveUploadBtn = document.getElementById("gdrive-upload-btn");
const gdriveDownloadBtn = document.getElementById("gdrive-download-btn");

// Auth Modal Elements
const authModal = document.getElementById("auth-modal");
const closeAuthModalBtn = document.getElementById("close-auth-modal-btn");
const tabSigninBtn = document.getElementById("tab-signin-btn");
const tabSignupBtn = document.getElementById("tab-signup-btn");
const modalLoginGoogleBtn = document.getElementById("modal-login-google-btn");
const panelSignin = document.getElementById("panel-signin");
const panelSignup = document.getElementById("panel-signup");
const signinForm = document.getElementById("signin-form");
const signupForm = document.getElementById("signup-form");
const linkGoSignup = document.getElementById("link-go-signup");
const linkGoSignin = document.getElementById("link-go-signin");

// Confetti Canvas
const confettiCanvas = document.getElementById("confetti-canvas");
const ctx = confettiCanvas.getContext("2d");

// Period Selectors
const periodBtns = document.querySelectorAll(".period-btn");
const dateFilterInput = document.getElementById("date-filter");
const clearDateFilterBtn = document.getElementById("clear-date-filter");

// Assignee Manager Elements
const assigneeManagerModal = document.getElementById("assignee-manager-modal");
const closeAssigneeModalBtn = document.getElementById("close-assignee-modal-btn");
const cancelAssigneeModalBtn = document.getElementById("cancel-assignee-modal-btn");
const manageAssigneesBtn = document.getElementById("manage-assignees-btn");
const formManageAssigneesBtn = document.getElementById("form-manage-assignees-btn");
const assigneeSearchInput = document.getElementById("assignee-search-input");
const assigneeTableBody = document.getElementById("assignee-table-body");
const newAssigneeName = document.getElementById("new-assignee-name");
const newAssigneeColorSelector = document.getElementById("new-assignee-color-selector");
const addNewAssigneeBtn = document.getElementById("add-new-assignee-btn");
const assigneeDatalist = document.getElementById("assignee-list");

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    loadAssigneeColors();
    loadTasks();
    rebuildAssigneeColorsFromTasks(); // Đồng bộ màu sắc tự động từ công việc
    loadGDriveConfig();
    setGreeting();
    initTimeDropdowns(); // Khởi tạo giờ/phút dạng 24h
    setupEventListeners();
    setupDragAndDrop();
    renderSidebarCategories();
    renderAll();
    resizeConfettiCanvas();
    window.addEventListener("resize", resizeConfettiCanvas);
});

// Khởi tạo danh sách các ô chọn giờ và phút định dạng 24h
function initTimeDropdowns() {
    if (!taskHourInput || !taskMinuteInput || !taskStartHourInput || !taskStartMinuteInput) return;
    
    // Render 24 Giờ (00 -> 23)
    let hourHTML = "";
    for (let h = 0; h < 24; h++) {
        const hStr = String(h).padStart(2, '0');
        hourHTML += `<option value="${hStr}">${hStr}</option>`;
    }
    taskHourInput.innerHTML = hourHTML;
    taskStartHourInput.innerHTML = hourHTML;
    
    // Render 60 Phút (00 -> 59)
    let minuteHTML = "";
    for (let m = 0; m < 60; m++) {
        const mStr = String(m).padStart(2, '0');
        minuteHTML += `<option value="${mStr}">${mStr}</option>`;
    }
    taskMinuteInput.innerHTML = minuteHTML;
    taskStartMinuteInput.innerHTML = minuteHTML;
}

// --- Theme Handling ---
function loadTheme() {
    const savedTheme = localStorage.getItem("tgtask_theme") || localStorage.getItem("zentask_theme");
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
    localStorage.setItem("tgtask_theme", currentTheme);
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

// --- Assignee Colors Storage & Logic ---
let assigneeColors = {};
function loadAssigneeColors() {
    const stored = localStorage.getItem("tgtask_assignee_colors");
    if (stored) {
        try {
            assigneeColors = JSON.parse(stored);
        } catch (e) {
            console.error("Lỗi load màu nhân sự:", e);
            assigneeColors = {};
        }
    } else {
        // Khởi tạo màu mặc định ban đầu cho các mock task và nhân sự thông dụng
        assigneeColors = {
            "trần minh quân": "purple",
            "nguyễn hoàng nam": "blue",
            "phạm thùy chi": "orange",
            "lê quang bách": "green",
            "giang": "orange",
            "bình": "blue"
        };
        saveAssigneeColors();
    }
}
function saveAssigneeColors() {
    localStorage.setItem("tgtask_assignee_colors", JSON.stringify(assigneeColors));
}
function getAssigneeColor(name) {
    if (!name || name.trim() === "") return "purple";
    const key = name.trim().toLowerCase();
    if (assigneeColors[key]) {
        return assigneeColors[key];
    }
    // Fallback: Tạo mã băm ổn định từ tên để chọn 1 màu tương ứng
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["purple", "blue", "orange", "green", "red", "pink"];
    const index = Math.abs(hash) % colors.length;
    const autoColor = colors[index];
    assigneeColors[key] = autoColor;
    saveAssigneeColors();
    return autoColor;
}

// --- Assignee Manager Modal Controls & Functions ---
function populateAssigneeDatalist() {
    if (!assigneeDatalist) return;
    assigneeDatalist.innerHTML = "";
    Object.keys(assigneeColors).forEach(key => {
        let displayName = key;
        const matchingTask = tasks.find(t => t.assignee && t.assignee.trim().toLowerCase() === key);
        if (matchingTask) {
            displayName = matchingTask.assignee.trim();
        } else {
            displayName = key.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        }
        const option = document.createElement("option");
        option.value = displayName;
        assigneeDatalist.appendChild(option);
    });
}

function openAssigneeModal() {
    if (assigneeManagerModal) {
        assigneeManagerModal.classList.add("active");
        if (newAssigneeName) newAssigneeName.value = "";
        if (assigneeSearchInput) assigneeSearchInput.value = "";
        renderAssigneeTable();
    }
}

function closeAssigneeModal() {
    if (assigneeManagerModal) {
        assigneeManagerModal.classList.remove("active");
    }
}

function renderAssigneeTable(filterText = "") {
    if (!assigneeTableBody) return;
    assigneeTableBody.innerHTML = "";
    
    const term = filterText.trim().toLowerCase();
    const keys = Object.keys(assigneeColors);
    const filteredKeys = keys.filter(k => k.includes(term));
    
    if (filteredKeys.length === 0) {
        assigneeTableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: var(--color-text-muted); padding: 1.5rem;">
                    Không tìm thấy nhân sự nào.
                </td>
            </tr>
        `;
        return;
    }
    
    filteredKeys.forEach(key => {
        let originalName = key;
        const matchingTask = tasks.find(t => t.assignee && t.assignee.trim().toLowerCase() === key);
        if (matchingTask) {
            originalName = matchingTask.assignee.trim();
        } else {
            originalName = key.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        }
        
        const currentColor = assigneeColors[key] || "purple";
        
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid var(--bg-card-border)";
        
        let colorRadioHTML = "";
        const colors = ["purple", "blue", "orange", "green", "red", "pink"];
        colors.forEach(c => {
            const checked = currentColor === c ? "checked" : "";
            colorRadioHTML += `
                <label class="color-dot-wrapper" style="cursor: pointer; position: relative;">
                    <input type="radio" name="rowColor_${key.replace(/\s+/g, '_')}" value="${c}" ${checked} style="display:none;">
                    <span class="color-dot color-${c}" title="${c}" style="width: 18px; height: 18px; border-radius: 50%; border: 2px solid transparent; transition: all 0.2s; display: inline-block; ${currentColor === c ? 'border-color: var(--color-text); transform: scale(1.25);' : ''}"></span>
                </label>
            `;
        });
        
        tr.innerHTML = `
            <td style="padding: 0.5rem 1rem;">
                <input type="text" class="assignee-row-name-input" data-original-name="${escapeHTML(originalName)}" value="${escapeHTML(originalName)}">
            </td>
            <td style="padding: 0.5rem 1rem; text-align: center;">
                <div class="assignee-color-selector" style="height: 30px; justify-content: center; gap: 0.35rem; display: flex; align-items: center;">
                    ${colorRadioHTML}
                </div>
            </td>
            <td style="padding: 0.5rem 1rem; text-align: center;">
                <button class="delete-assignee-row-btn" data-name="${escapeHTML(originalName)}">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            </td>
        `;
        
        assigneeTableBody.appendChild(tr);
        
        const nameInput = tr.querySelector(".assignee-row-name-input");
        if (nameInput) {
            const handleRename = () => {
                const newNameVal = nameInput.value.trim();
                const originalNameVal = nameInput.dataset.originalName.trim();
                
                if (newNameVal === "") {
                    nameInput.value = originalNameVal;
                    showToast("Tên nhân viên không được để trống!", "warning");
                    return;
                }
                
                if (newNameVal.toLowerCase() === originalNameVal.toLowerCase()) {
                    if (newNameVal !== originalNameVal) {
                        tasks.forEach(t => {
                            if (t.assignee && t.assignee.trim().toLowerCase() === originalNameVal.toLowerCase()) {
                                t.assignee = newNameVal;
                            }
                        });
                        saveTasks();
                        renderAll();
                        renderAssigneeTable(assigneeSearchInput ? assigneeSearchInput.value : "");
                        populateAssigneeDatalist();
                        showToast(`Đã đổi viết hoa tên: ${newNameVal}`, "success");
                    }
                    return;
                }
                
                if (assigneeColors[newNameVal.toLowerCase()]) {
                    nameInput.value = originalNameVal;
                    showToast(`Nhân sự "${newNameVal}" đã tồn tại trong hệ thống!`, "warning");
                    return;
                }
                
                const oldKey = originalNameVal.toLowerCase();
                const newKey = newNameVal.toLowerCase();
                const color = assigneeColors[oldKey] || "purple";
                
                delete assigneeColors[oldKey];
                assigneeColors[newKey] = color;
                saveAssigneeColors();
                
                tasks.forEach(t => {
                    if (t.assignee && t.assignee.trim().toLowerCase() === oldKey) {
                        t.assignee = newNameVal;
                        t.assigneeColor = color;
                    }
                });
                
                saveTasks();
                renderAll();
                renderAssigneeTable(assigneeSearchInput ? assigneeSearchInput.value : "");
                populateAssigneeDatalist();
                showToast(`Đã đổi tên từ "${originalNameVal}" thành "${newNameVal}" thành công!`, "success");
            };
            
            nameInput.addEventListener("keydown", (evt) => {
                if (evt.key === "Enter") nameInput.blur();
            });
            nameInput.addEventListener("change", handleRename);
        }
        
        const dots = tr.querySelectorAll(".color-dot-wrapper");
        dots.forEach(dot => {
            const radio = dot.querySelector("input[type='radio']");
            const span = dot.querySelector(".color-dot");
            span.addEventListener("click", () => {
                const newCol = radio.value;
                const targetNameKey = key;
                
                assigneeColors[targetNameKey] = newCol;
                saveAssigneeColors();
                
                tasks.forEach(t => {
                    if (t.assignee && t.assignee.trim().toLowerCase() === targetNameKey) {
                        t.assigneeColor = newCol;
                    }
                });
                
                saveTasks();
                renderAll();
                renderAssigneeTable(assigneeSearchInput ? assigneeSearchInput.value : "");
                populateAssigneeDatalist();
                showToast(`Đã đổi màu của "${originalName}" sang ${newCol}`, "success");
            });
        });
        
        const deleteBtn = tr.querySelector(".delete-assignee-row-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", () => {
                const nameToDelete = deleteBtn.dataset.name;
                const keyToDelete = nameToDelete.trim().toLowerCase();
                
                if (confirm(`Bạn có chắc chắn muốn xóa nhân viên "${nameToDelete}" khỏi hệ thống? Tất cả công việc của người này sẽ chuyển về "Chưa phân công".`)) {
                    delete assigneeColors[keyToDelete];
                    saveAssigneeColors();
                    
                    tasks.forEach(t => {
                        if (t.assignee && t.assignee.trim().toLowerCase() === keyToDelete) {
                            t.assignee = "";
                            t.assigneeColor = "purple";
                        }
                    });
                    
                    saveTasks();
                    renderAll();
                    renderAssigneeTable(assigneeSearchInput ? assigneeSearchInput.value : "");
                    populateAssigneeDatalist();
                    showToast(`Đã xóa nhân sự "${nameToDelete}"`, "success");
                }
            });
        }
    });
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

function handleAddNewAssignee() {
    if (!newAssigneeName) return;
    const nameVal = newAssigneeName.value.trim();
    if (nameVal === "") {
        showToast("Tên nhân viên không được để trống!", "warning");
        return;
    }
    
    const key = nameVal.toLowerCase();
    if (assigneeColors[key]) {
        showToast(`Nhân sự "${nameVal}" đã tồn tại trong hệ thống!`, "warning");
        return;
    }
    
    const checkedRadio = newAssigneeColorSelector.querySelector("input[name='newAssigneeColor']:checked");
    const colorVal = checkedRadio ? checkedRadio.value : "purple";
    
    assigneeColors[key] = colorVal;
    saveAssigneeColors();
    
    newAssigneeName.value = "";
    const purpleRadio = newAssigneeColorSelector.querySelector("input[name='newAssigneeColor'][value='purple']");
    if (purpleRadio) purpleRadio.checked = true;
    
    renderAssigneeTable(assigneeSearchInput ? assigneeSearchInput.value : "");
    populateAssigneeDatalist();
    showToast(`Đã thêm nhân sự "${nameVal}" thành công!`, "success");
}

function rebuildAssigneeColorsFromTasks() {
    tasks.forEach(t => {
        if (t.assignee && t.assignee.trim() !== "") {
            const key = t.assignee.trim().toLowerCase();
            const color = t.assigneeColor || "purple";
            if (!assigneeColors[key]) {
                assigneeColors[key] = color;
            }
        }
    });
    saveAssigneeColors();
    populateAssigneeDatalist();
}

// --- Tasks Local Storage ---
function loadTasks() {
    let stored = localStorage.getItem("tgtask_tasks");
    if (!stored) {
        // Fallback sang khóa dữ liệu cũ zentask_tasks của ZenTask
        stored = localStorage.getItem("zentask_tasks");
        if (stored) {
            // Di trú dữ liệu sang khóa mới
            localStorage.setItem("tgtask_tasks", stored);
            localStorage.removeItem("zentask_tasks");
        }
    }

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

async function saveTasks() {
    // 1. Lưu LocalStorage trước (luôn luôn an toàn offline)
    localStorage.setItem("tgtask_tasks", JSON.stringify(tasks));
    
    // 2. Nếu đã đăng nhập và đồng bộ Google Drive hoạt động, đẩy lên Cloud
    if (gdriveAccessToken) {
        try {
            // Đẩy không đồng bộ lên Google Drive trong nền
            uploadTasksToGDrive().catch(err => console.error("Lỗi upload nền:", err));
        } catch (e) {
            console.error("Lỗi tự động lưu lên Google Drive:", e);
        }
    }
}

// --- Google Drive Sync Methods ---
function loadGDriveConfig() {
    gdriveClientId = localStorage.getItem("tgtask_gdrive_client_id") || DEFAULT_GDRIVE_CLIENT_ID || "";
    gdriveAccessToken = localStorage.getItem("tgtask_gdrive_access_token") || "";
    const expiresAt = parseInt(localStorage.getItem("tgtask_gdrive_token_expires") || "0");
    const savedScope = localStorage.getItem("tgtask_gdrive_token_scope") || "";
    const requiredScope = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
    
    if (gdriveClientId) {
        isGDriveConfigured = true;
        // Kiểm tra xem token cũ còn hạn và đúng scope không
        if (gdriveAccessToken && Date.now() < expiresAt && savedScope === requiredScope) {
            gdriveUserEmail = localStorage.getItem("tgtask_gdrive_user_email") || "";
            gdriveUserName = localStorage.getItem("tgtask_gdrive_user_name") || "";
            gdriveUserAvatar = localStorage.getItem("tgtask_gdrive_user_avatar") || "";
            // Tự động đồng bộ ngay khi load trang
            syncWithGDrive();
        } else {
            // Token đã hết hạn hoặc sai scope, cần xoá để đăng nhập lại với quyền mới
            gdriveAccessToken = "";
            localStorage.removeItem("tgtask_gdrive_access_token");
            localStorage.removeItem("tgtask_gdrive_token_expires");
            localStorage.removeItem("tgtask_gdrive_token_scope");
        }
    }
    updateGDriveConfigBadge(isGDriveConfigured);
    renderUserProfile();
}

function updateGDriveConfigBadge(configured) {
    if (!gdriveConfigBtn) return;
    const oldBadge = gdriveConfigBtn.querySelector(".gdrive-configured-badge");
    if (oldBadge) oldBadge.remove();

    if (configured) {
        const badge = document.createElement("span");
        badge.className = "gdrive-configured-badge";
        badge.style.cssText = "display: inline-block; width: 6px; height: 6px; background-color: var(--color-primary); border-radius: 50%; margin-left: 8px;";
        gdriveConfigBtn.appendChild(badge);
    }
}

function renderUserProfile() {
    if (!userProfileSection) return;

    if (!isGDriveConfigured) {
        // 1. Render premium offline status in top profile section
        userProfileSection.innerHTML = `
            <div class="user-profile-card unauthenticated" style="background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.03);">
                <div class="sync-status" style="justify-content: center; width: 100%; gap: 0.4rem; padding: 0.15rem 0;">
                    <span class="sync-badge" style="background-color: var(--color-text-muted); box-shadow: none; animation: none; width: 6px; height: 6px;"></span>
                    <span style="font-size: 0.725rem; font-weight: 600; opacity: 0.75; cursor: pointer; text-decoration: underline;" id="gdrive-setup-tip">Chế độ: Cục bộ (Offline)</span>
                </div>
            </div>
        `;
        
        const setupTip = document.getElementById("gdrive-setup-tip");
        if (setupTip) {
            setupTip.addEventListener("click", () => {
                openGDriveConfigModal();
                const modalCard = gdriveConfigModal ? gdriveConfigModal.querySelector(".modal-card") : null;
                if (modalCard) {
                    modalCard.classList.remove("shake-animation");
                    void modalCard.offsetWidth; // Trigger reflow to restart animation
                    modalCard.classList.add("shake-animation");
                    setTimeout(() => {
                        modalCard.classList.remove("shake-animation");
                    }, 500);
                }
            });
        }
    } else if (isSyncingGDrive) {
        userProfileSection.innerHTML = `
            <div class="user-profile-card">
                <div class="user-profile-loading" style="display: flex; align-items: center; gap: 0.5rem; justify-content: center; width: 100%; font-size: 0.8rem; color: var(--color-text-muted);">
                    <i data-lucide="loader" class="spin" style="width: 14px; height: 14px; animation: spin 1s linear infinite;"></i>
                    <span>Đang đồng bộ Drive...</span>
                </div>
            </div>
        `;
    } else if (!gdriveAccessToken) {
        // 1. Render premium cloud ready status in top profile section
        userProfileSection.innerHTML = `
            <div class="user-profile-card unauthenticated" style="background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.03);">
                <div class="sync-status" style="justify-content: center; width: 100%; gap: 0.4rem; padding: 0.15rem 0;">
                    <span class="sync-badge" style="background-color: var(--color-primary-light); box-shadow: 0 0 6px var(--color-primary); animation: sync-pulse 1.8s infinite ease-in-out; width: 6px; height: 6px;"></span>
                    <span style="font-size: 0.725rem; font-weight: 600; opacity: 0.85; cursor: pointer;" id="gdrive-quick-login-tip">Sẵn sàng đồng bộ hóa</span>
                </div>
            </div>
        `;
        const quickLoginTip = document.getElementById("gdrive-quick-login-tip");
        if (quickLoginTip) {
            quickLoginTip.addEventListener("click", loginAndSyncGDrive);
        }
    } else {
        const displayName = gdriveUserName || gdriveUserEmail || "Người dùng Google";
        const syncText = "Đã đồng bộ Drive";
        
        let avatarHTML = "";
        if (gdriveUserAvatar) {
            avatarHTML = `<img class="user-avatar" src="${gdriveUserAvatar}" referrerpolicy="no-referrer" alt="${displayName}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid var(--color-primary-light);">`;
        } else {
            const firstLetter = displayName.charAt(0).toUpperCase();
            const colors = [
                "linear-gradient(135deg, #a78bfa 0%, #3b82f6 100%)",
                "linear-gradient(135deg, #f472b6 0%, #db2777 100%)",
                "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                "linear-gradient(135deg, #34d399 0%, #059669 100%)",
                "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
                "linear-gradient(135deg, #f87171 0%, #dc2626 100%)"
            ];
            let hash = 0;
            for (let i = 0; i < displayName.length; i++) {
                hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
            }
            const gradientIndex = Math.abs(hash) % colors.length;
            const gradient = colors[gradientIndex];
            avatarHTML = `<div class="user-avatar letter-avatar" style="background: ${gradient}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 1rem;">${firstLetter}</div>`;
        }
        
        userProfileSection.innerHTML = `
            <div class="user-profile-card authenticated" style="display: flex; align-items: center; gap: 0.65rem; width: 100%; background: rgba(255,255,255,0.02); border: 1px solid var(--bg-card-border); padding: 0.65rem; border-radius: var(--border-radius-md);">
                <div class="user-avatar-wrapper" style="flex-shrink: 0;">
                    ${avatarHTML}
                </div>
                <div class="user-details" style="flex-grow: 1; overflow: hidden; display: flex; flex-direction: column; gap: 0.15rem; text-align: left;">
                    <h4 class="user-name" title="${displayName}" style="margin: 0; font-size: 0.8rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-text);">${displayName}</h4>
                    <div class="sync-status" style="display: flex; align-items: center; gap: 0.3rem;">
                        <span class="sync-badge" style="display: inline-block; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981;"></span>
                        <span class="sync-text-status" style="font-size: 0.65rem; font-weight: 500; opacity: 0.85; color: var(--color-text-muted);">${syncText}</span>
                    </div>
                </div>
                <button class="btn-logout" id="gdrive-logout-btn" title="Đăng xuất" style="background: transparent; border: none; color: var(--color-text-muted); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: var(--border-radius-sm); transition: all 0.2s ease;">
                    <i data-lucide="log-out" style="width: 14px; height: 14px;"></i>
                </button>
            </div>
        `;
        const logoutBtn = document.getElementById("gdrive-logout-btn");
        if (logoutBtn) logoutBtn.addEventListener("click", logoutGDrive);
    }
    
    // Toggle manual sync actions visibility based on access token state
    if (gdriveManualSyncActions && gdriveSyncBtn) {
        if (gdriveAccessToken && isGDriveConfigured && !isSyncingGDrive) {
            gdriveManualSyncActions.style.display = "flex";
            gdriveSyncBtn.style.display = "none";
        } else {
            gdriveManualSyncActions.style.display = "none";
            gdriveSyncBtn.style.display = isGDriveConfigured && !isSyncingGDrive ? "flex" : "none";
        }
    }
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

async function fetchUserInfo() {
    if (!gdriveAccessToken) return;
    try {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                "Authorization": `Bearer ${gdriveAccessToken}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            gdriveUserEmail = data.email || "";
            gdriveUserName = data.name || data.email || "";
            gdriveUserAvatar = data.picture || "";
            
            localStorage.setItem("tgtask_gdrive_user_email", gdriveUserEmail);
            localStorage.setItem("tgtask_gdrive_user_name", gdriveUserName);
            localStorage.setItem("tgtask_gdrive_user_avatar", gdriveUserAvatar);
        } else {
            console.error("Lỗi fetch user info status:", response.status);
        }
    } catch (e) {
        console.error("Lỗi lấy thông tin người dùng Google:", e);
    }
}

function loginAndSyncGDrive() {
    if (!gdriveClientId) {
        showToast("Vui lòng thiết lập Google Client ID trong mục 'Cấu hình Google Drive' trước!", "warning");
        openGDriveConfigModal();
        return;
    }
    
    try {
        isSyncingGDrive = true;
        renderUserProfile();
        
        const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: gdriveClientId,
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
            callback: async (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    gdriveAccessToken = tokenResponse.access_token;
                    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;
                    const requiredScope = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
                    
                    localStorage.setItem("tgtask_gdrive_access_token", gdriveAccessToken);
                    localStorage.setItem("tgtask_gdrive_token_expires", expiresAt);
                    localStorage.setItem("tgtask_gdrive_token_scope", requiredScope);
                    
                    // Lấy thông tin email người dùng để hiển thị trên Sidebar
                    await fetchUserInfo();
                    
                    // Bắt đầu đồng bộ
                    await syncWithGDrive();
                    showToast("Đã kết nối và đồng bộ hóa thành công với Google Drive!", "success");
                } else {
                    isSyncingGDrive = false;
                    renderUserProfile();
                }
            },
            error_callback: (err) => {
                console.error("Lỗi xác thực Google:", err);
                showToast("Đăng nhập thất bại: " + (err.message || err.error || "Lỗi chưa xác định"), "error");
                isSyncingGDrive = false;
                renderUserProfile();
            }
        });
        
        // Yêu cầu token qua Popup của Google
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (e) {
        console.error("Lỗi khởi tạo đăng nhập Google:", e);
        showToast("Không thể khởi động đăng nhập Google. Hãy kiểm tra lại Client ID hoặc kết nối mạng.", "error");
        isSyncingGDrive = false;
        renderUserProfile();
    }
}

function logoutGDrive() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất tài khoản Google? Ứng dụng sẽ dừng đồng bộ và quay về chế độ ngoại tuyến.")) {
        gdriveAccessToken = "";
        gdriveUserEmail = "";
        gdriveUserName = "";
        gdriveUserAvatar = "";
        
        localStorage.removeItem("tgtask_gdrive_access_token");
        localStorage.removeItem("tgtask_gdrive_token_expires");
        localStorage.removeItem("tgtask_gdrive_token_scope");
        localStorage.removeItem("tgtask_gdrive_user_email");
        localStorage.removeItem("tgtask_gdrive_user_name");
        localStorage.removeItem("tgtask_gdrive_user_avatar");
        
        showToast("Đã đăng xuất tài khoản Google thành công!", "success");
        renderUserProfile();
    }
}

async function findGDriveFile() {
    if (!gdriveAccessToken) return null;
    try {
        const query = encodeURIComponent("name = 'tgtask_backup.json' and trashed = false");
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive&fields=files(id,name)`, {
            headers: {
                "Authorization": `Bearer ${gdriveAccessToken}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            if (data.files && data.files.length > 0) {
                return data.files[0].id;
            }
        } else {
            const errText = await response.text();
            console.error("Lỗi tìm kiếm file trên Drive:", response.status, errText);
            throw new Error(`Google Drive API error: ${response.status} - ${errText}`);
        }
    } catch (e) {
        console.error("Lỗi findGDriveFile:", e);
        throw e;
    }
    return null;
}

async function downloadGDriveFile(fileId) {
    if (!gdriveAccessToken || !fileId) return null;
    try {
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: {
                "Authorization": `Bearer ${gdriveAccessToken}`
            }
        });
        if (response.ok) {
            return await response.json();
        } else {
            const errText = await response.text();
            console.error("Lỗi tải file từ Drive:", response.status, errText);
            throw new Error(`Google Drive API error: ${response.status} - ${errText}`);
        }
    } catch (e) {
        console.error("Lỗi downloadGDriveFile:", e);
        throw e;
    }
}

async function uploadTasksToGDrive() {
    if (!gdriveAccessToken) return;
    
    try {
        const fileId = await findGDriveFile();
        const fileContent = JSON.stringify({
            tasks: tasks,
            updatedAt: Date.now()
        });
        
        let url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
        let method = "POST";
        
        if (fileId) {
            url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
            method = "PATCH";
        }
        
        const boundary = "314159265358979323846";
        const metadata = {
            name: "tgtask_backup.json",
            mimeType: "application/json"
        };
        
        const multipartBody = 
            `--${boundary}\r\n` +
            "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
            JSON.stringify(metadata) +
            `\r\n--${boundary}\r\n` +
            "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
            fileContent +
            `\r\n--${boundary}--\r\n`;
            
        const response = await fetch(url, {
            method: method,
            headers: {
                "Authorization": `Bearer ${gdriveAccessToken}`,
                "Content-Type": `multipart/related; boundary=${boundary}`
            },
            body: multipartBody
        });
        
        if (response.ok) {
            console.log("Đã đẩy dữ liệu thành công lên Google Drive!");
        } else {
            const errText = await response.text();
            console.error("Lỗi upload dữ liệu lên Drive:", response.status, errText);
            throw new Error(`Google Drive API error: ${response.status} - ${errText}`);
        }
    } catch (e) {
        console.error("Lỗi uploadTasksToGDrive:", e);
        throw e;
    }
}

async function syncWithGDrive() {
    if (!gdriveAccessToken) return;
    
    isSyncingGDrive = true;
    renderUserProfile();
    
    try {
        const fileId = await findGDriveFile();
        let cloudData = null;
        if (fileId) {
            cloudData = await downloadGDriveFile(fileId);
        }
        
        let localTasks = [];
        const storedLocal = localStorage.getItem("tgtask_tasks");
        if (storedLocal) {
            try {
                localTasks = JSON.parse(storedLocal);
            } catch (e) {
                console.error("Lỗi parse local tasks", e);
            }
        }
        
        let cloudTasks = (cloudData && cloudData.tasks) ? cloudData.tasks : [];
        
        // Hợp nhất dữ liệu thông minh
        const mergedMap = new Map();
        
        // Nạp cloud tasks trước
        cloudTasks.forEach(task => {
            mergedMap.set(task.id, task);
        });
        
        // Hợp nhất local tasks dựa trên updatedAt / createdAt
        localTasks.forEach(localTask => {
            if (!mergedMap.has(localTask.id)) {
                mergedMap.set(localTask.id, localTask);
            } else {
                const cloudTask = mergedMap.get(localTask.id);
                const localTime = localTask.updatedAt || localTask.createdAt || 0;
                const cloudTime = cloudTask.updatedAt || cloudTask.createdAt || 0;
                if (localTime > cloudTime) {
                    mergedMap.set(localTask.id, localTask);
                }
            }
        });
        
        tasks = Array.from(mergedMap.values());
        
        // Lưu lại máy
        localStorage.setItem("tgtask_tasks", JSON.stringify(tasks));
        
        // Đẩy lên cloud
        await uploadTasksToGDrive();
        
        // Đồng bộ hoàn tất
        showToast("Đồng bộ dữ liệu với Google Drive hoàn tất!", "success");
    } catch (e) {
        console.error("Lỗi trong quá trình đồng bộ Drive:", e);
        showToast("Lỗi đồng bộ hóa dữ liệu Google Drive!", "error");
    } finally {
        isSyncingGDrive = false;
        renderUserProfile();
        renderAll();
        renderSidebarCategories();
    }
}

async function handleGDriveManualUpload() {
    if (!gdriveAccessToken) {
        showToast("Bạn chưa đăng nhập Google Drive!", "warning");
        return;
    }
    
    const oldHTML = gdriveUploadBtn.innerHTML;
    gdriveUploadBtn.disabled = true;
    gdriveUploadBtn.innerHTML = `<i data-lucide="loader" class="spin" style="width: 14px; height: 14px; animation: spin 1s linear infinite;"></i> <span>Đang tải lên...</span>`;
    if (window.lucide) lucide.createIcons();
    
    showToast("Đang tải dữ liệu lên Google Drive...", "info");
    try {
        await uploadTasksToGDrive();
        showToast("Đã tải dữ liệu máy lên Google Drive thành công!", "success");
    } catch (e) {
        console.error("Lỗi upload thủ công:", e);
        showToast("Lỗi khi tải dữ liệu lên Google Drive!", "error");
    } finally {
        gdriveUploadBtn.disabled = false;
        gdriveUploadBtn.innerHTML = oldHTML;
        if (window.lucide) lucide.createIcons();
    }
}

async function handleGDriveManualDownload() {
    if (!gdriveAccessToken) {
        showToast("Bạn chưa đăng nhập Google Drive!", "warning");
        return;
    }
    
    const oldHTML = gdriveDownloadBtn.innerHTML;
    gdriveDownloadBtn.disabled = true;
    gdriveDownloadBtn.innerHTML = `<i data-lucide="loader" class="spin" style="width: 14px; height: 14px; animation: spin 1s linear infinite;"></i> <span>Đang tải về...</span>`;
    if (window.lucide) lucide.createIcons();

    try {
        const fileId = await findGDriveFile();
        if (!fileId) {
            showToast("Không tìm thấy tệp sao lưu nào trên Google Drive!", "warning");
            return;
        }
        
        const cloudData = await downloadGDriveFile(fileId);
        if (!cloudData || !cloudData.tasks) {
            showToast("Tệp sao lưu trên Google Drive trống hoặc không hợp lệ!", "warning");
            return;
        }
        
        const cloudTasks = cloudData.tasks;
        
        // Hỏi người dùng muốn ghi đè hay hợp nhất
        const choice = confirm("Bạn có muốn HỢP NHẤT dữ liệu từ Google Drive với dữ liệu máy hiện tại không?\n\n- Chọn 'OK' để Hợp nhất dữ liệu (giữ lại công việc mới nhất ở cả hai nơi).\n- Chọn 'Cancel' để GHI ĐÈ hoàn toàn dữ liệu hiện tại bằng dữ liệu trên Google Drive.");
        
        if (choice) {
            // Hợp nhất thông minh
            let localTasks = [...tasks];
            const mergedMap = new Map();
            cloudTasks.forEach(task => mergedMap.set(task.id, task));
            localTasks.forEach(localTask => {
                if (!mergedMap.has(localTask.id)) {
                    mergedMap.set(localTask.id, localTask);
                } else {
                    const cloudTask = mergedMap.get(localTask.id);
                    const localTime = localTask.updatedAt || localTask.createdAt || 0;
                    const cloudTime = cloudTask.updatedAt || cloudTask.createdAt || 0;
                    if (localTime > cloudTime) {
                        mergedMap.set(localTask.id, localTask);
                    }
                }
            });
            tasks = Array.from(mergedMap.values());
        } else {
            // Ghi đè hoàn toàn
            if (confirm("Xác nhận: Ghi đè hoàn toàn dữ liệu cục bộ bằng dữ liệu từ Google Drive? Thao tác này không thể hoàn tác.")) {
                tasks = cloudTasks;
            } else {
                return; // Hủy thao tác
            }
        }
        
        saveTasks();
        rebuildAssigneeColorsFromTasks();
        renderSidebarCategories();
        renderAll();
        showToast("Đã tải dữ liệu từ Google Drive về máy thành công!", "success");
    } catch (e) {
        console.error("Lỗi download thủ công:", e);
        showToast("Lỗi khi tải dữ liệu từ Google Drive!", "error");
    } finally {
        gdriveDownloadBtn.disabled = false;
        gdriveDownloadBtn.innerHTML = oldHTML;
        if (window.lucide) lucide.createIcons();
    }
}

// --- Period Filtering Logic ---
function getTasksFilteredByPeriod(taskList) {
    if (currentPeriodFilter === "all") return taskList;
    
    const today = new Date();
    
    if (currentPeriodFilter === "week") {
        // Tuần này: Hạn chót từ Thứ Hai đầu tuần đến Chủ Nhật cuối tuần
        const dayOfWeek = today.getDay(); // 0: Chủ nhật, 1: Thứ hai, ..., 6: Thứ bảy
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        
        const monday = new Date(today);
        monday.setDate(today.getDate() + diffToMonday);
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        // Định dạng chuỗi YYYY-MM-DD theo giờ địa phương để tránh lệch múi giờ UTC khi dùng toISOString()
        const startStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
        const endStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
        
        return taskList.filter(t => {
            const taskDateStr = t.dueDate ? t.dueDate.split('T')[0] : "";
            return taskDateStr >= startStr && taskDateStr <= endStr;
        });
    } else if (currentPeriodFilter === "month") {
        // Tháng này: Hạn chót từ ngày 1 đầu tháng hiện tại đến ngày cuối cùng của tháng đó
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        // Định dạng chuỗi YYYY-MM-DD theo giờ địa phương để tránh lệch múi giờ UTC khi dùng toISOString()
        const startStr = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`;
        const endStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
        
        return taskList.filter(t => {
            const taskDateStr = t.dueDate ? t.dueDate.split('T')[0] : "";
            return taskDateStr >= startStr && taskDateStr <= endStr;
        });
    }
    
    return taskList;
}

function getTasksFilteredByPeriodAndDate(taskList) {
    let filtered = getTasksFilteredByPeriod(taskList);
    if (currentDateFilter) {
        filtered = filtered.filter(t => {
            const taskDateStr = t.dueDate ? t.dueDate.split('T')[0] : "";
            return taskDateStr === currentDateFilter;
        });
    }
    return filtered;
}

// --- Setup Event Listeners ---
function setupEventListeners() {
    // View Switching
    viewBoardBtn.addEventListener("click", () => switchView("board"));
    viewListBtn.addEventListener("click", () => switchView("list"));
    viewCalendarBtn.addEventListener("click", () => switchView("calendar"));

    // Calendar Navigation
    calPrevBtn.addEventListener("click", () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    calNextBtn.addEventListener("click", () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });
    calTodayBtn.addEventListener("click", () => {
        currentCalendarDate = new Date();
        renderCalendar();
    });

    // Calendar Location Filters
    if (calFilterOffice) {
        calFilterOffice.addEventListener("change", () => {
            const label = calFilterOffice.closest('.cal-filter-checkbox');
            if (label) {
                if (calFilterOffice.checked) {
                    label.classList.add('checked');
                } else {
                    label.classList.remove('checked');
                }
            }
            renderCalendar();
        });
    }
    if (calFilterSite) {
        calFilterSite.addEventListener("change", () => {
            const label = calFilterSite.closest('.cal-filter-checkbox');
            if (label) {
                if (calFilterSite.checked) {
                    label.classList.add('checked');
                } else {
                    label.classList.remove('checked');
                }
            }
            renderCalendar();
        });
    }

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

    // Period selectors click
    periodBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            periodBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentPeriodFilter = btn.dataset.period;
            // Khi người dùng chọn lọc tuần/tháng, ta xoá lọc ngày cụ thể để tránh xung đột
            dateFilterInput.value = "";
            currentDateFilter = "";
            clearDateFilterBtn.style.display = "none";
            renderSidebarCategories();
            renderAll();
        });
    });

    // Date filter change
    dateFilterInput.addEventListener("change", (e) => {
        currentDateFilter = e.target.value;
        if (currentDateFilter) {
            clearDateFilterBtn.style.display = "inline-flex";
            
            // Giải quyết xung đột bộ lọc: đưa bộ chọn Tuần/Tháng về "Tất cả"
            currentPeriodFilter = "all";
            periodBtns.forEach(btn => {
                if (btn.dataset.period === "all") {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });
        } else {
            clearDateFilterBtn.style.display = "none";
        }
        renderSidebarCategories();
        renderAll();
    });

    // Clear date filter click
    clearDateFilterBtn.addEventListener("click", () => {
        dateFilterInput.value = "";
        currentDateFilter = "";
        clearDateFilterBtn.style.display = "none";
        renderSidebarCategories();
        renderAll();
    });

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

    // Specific progress & status live sync inside modal
    taskStatusInput.addEventListener("change", (e) => {
        if (e.target.value === "completed") {
            taskProgressInput.value = 100;
            progressValLabel.textContent = "100%";
        } else if (taskProgressInput.value == 100) {
            taskProgressInput.value = 80;
            progressValLabel.textContent = "80%";
        }
    });
    taskProgressInput.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        progressValLabel.textContent = `${val}%`;
        if (val === 100) {
            taskStatusInput.value = "completed";
        } else if (taskStatusInput.value === "completed" && val < 100) {
            taskStatusInput.value = "inprogress";
        }
    });

    // Auto-select assignee color when typing name
    taskAssigneeInput.addEventListener("input", (e) => {
        const name = e.target.value.trim();
        if (name !== "") {
            const color = getAssigneeColor(name);
            const colorRadio = taskForm.querySelector(`input[name="assigneeColor"][value="${color}"]`);
            if (colorRadio) {
                colorRadio.checked = true;
            }
        } else {
            const colorRadio = taskForm.querySelector(`input[name="assigneeColor"][value="purple"]`);
            if (colorRadio) {
                colorRadio.checked = true;
            }
        }
    });

    // Assignee Manager Events
    if (manageAssigneesBtn) {
        manageAssigneesBtn.addEventListener("click", openAssigneeModal);
    }
    if (formManageAssigneesBtn) {
        formManageAssigneesBtn.addEventListener("click", openAssigneeModal);
    }
    if (closeAssigneeModalBtn) {
        closeAssigneeModalBtn.addEventListener("click", closeAssigneeModal);
    }
    if (cancelAssigneeModalBtn) {
        cancelAssigneeModalBtn.addEventListener("click", closeAssigneeModal);
    }
    if (assigneeSearchInput) {
        assigneeSearchInput.addEventListener("input", (e) => {
            renderAssigneeTable(e.target.value);
        });
    }
    if (addNewAssigneeBtn) {
        addNewAssigneeBtn.addEventListener("click", handleAddNewAssignee);
    }
    if (newAssigneeName) {
        newAssigneeName.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleAddNewAssignee();
            }
        });
    }

    // Export / Import
    exportBtn.addEventListener("click", exportData);
    importTriggerBtn.addEventListener("click", () => importFileInput.click());
    importFileInput.addEventListener("change", importData);

    // Google Drive configuration events
    if (gdriveConfigBtn) {
        gdriveConfigBtn.addEventListener("click", openGDriveConfigModal);
    }
    if (closeGDriveModalBtn) {
        closeGDriveModalBtn.addEventListener("click", closeGDriveConfigModal);
    }
    if (cancelGDriveModalBtn) {
        cancelGDriveModalBtn.addEventListener("click", closeGDriveConfigModal);
    }
    if (gdriveConfigForm) {
        gdriveConfigForm.addEventListener("submit", handleGDriveConfigSubmit);
    }
    if (resetGDriveConfigBtn) {
        resetGDriveConfigBtn.addEventListener("click", handleResetGDriveConfig);
    }

    // Google Drive Login & Sync
    if (gdriveSyncBtn) {
        gdriveSyncBtn.addEventListener("click", () => {
            if (!isGDriveConfigured) {
                showToast("Vui lòng nhập Google Client ID trong mục 'Cấu hình Google Drive' trước!", "warning");
                openGDriveConfigModal();
                setTimeout(() => {
                    const modalCard = gdriveConfigModal ? gdriveConfigModal.querySelector(".modal-card") : null;
                    if (modalCard) {
                        modalCard.classList.remove("shake-animation");
                        void modalCard.offsetWidth;
                        modalCard.classList.add("shake-animation");
                    }
                }, 300);
            } else {
                loginAndSyncGDrive();
            }
        });
    }

    // Google Drive Manual Sync Actions
    if (gdriveUploadBtn) {
        gdriveUploadBtn.addEventListener("click", handleGDriveManualUpload);
    }
    if (gdriveDownloadBtn) {
        gdriveDownloadBtn.addEventListener("click", handleGDriveManualDownload);
    }

    // Toggle password visibility
    document.querySelectorAll(".btn-toggle-password").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.target;
            const targetInput = document.getElementById(targetId);
            if (!targetInput) return;
            
            const type = targetInput.getAttribute("type") === "password" ? "text" : "password";
            targetInput.setAttribute("type", type);
            
            const icon = btn.querySelector("i");
            if (icon) {
                if (type === "password") {
                    icon.setAttribute("data-lucide", "eye");
                } else {
                    icon.setAttribute("data-lucide", "eye-off");
                }
                if (window.lucide) {
                    lucide.createIcons();
                }
            }
        });
    });

    // Mobile Kanban column tab events
    const tabBtns = document.querySelectorAll(".kanban-tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const columnId = btn.dataset.column;
            switchMobileKanbanColumn(columnId);
        });
    });
}

// --- Switch Mobile Kanban Column ---
function switchMobileKanbanColumn(columnId) {
    activeMobileKanbanColumn = columnId;
    
    // Tìm các element cột Kanban
    const columns = {
        todo: document.getElementById("col-todo"),
        inprogress: document.getElementById("col-inprogress"),
        review: document.getElementById("col-review"),
        completed: document.getElementById("col-completed")
    };
    
    // Cập nhật class mobile-active
    Object.keys(columns).forEach(key => {
        const col = columns[key];
        if (col) {
            if (key === columnId) {
                col.classList.add("mobile-active");
            } else {
                col.classList.remove("mobile-active");
            }
        }
    });
}

// --- View Switcher ---
function switchView(view) {
    currentView = view;
    
    // Reset active buttons
    viewBoardBtn.classList.remove("active");
    viewListBtn.classList.remove("active");
    viewCalendarBtn.classList.remove("active");
    
    // Reset active panels
    boardView.classList.remove("active");
    listView.classList.remove("active");
    calendarView.classList.remove("active");
    
    if (view === "board") {
        viewBoardBtn.classList.add("active");
        boardView.classList.add("active");
    } else if (view === "list") {
        viewListBtn.classList.add("active");
        listView.classList.add("active");
    } else if (view === "calendar") {
        viewCalendarBtn.classList.add("active");
        calendarView.classList.add("active");
    }
    renderAll();
}

// --- Render Sidebar Categories ---
function renderSidebarCategories() {
    categoryFilterList.innerHTML = "";
    CATEGORIES.forEach(cat => {
        const periodFilteredTasks = getTasksFilteredByPeriodAndDate(tasks);
        const count = cat.id === "all" 
            ? periodFilteredTasks.length 
            : periodFilteredTasks.filter(t => t.category === cat.id).length;
        
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
    const periodTasks = getTasksFilteredByPeriodAndDate(tasks);
    const total = periodTasks.length;
    const inProgress = periodTasks.filter(t => t.status === "inprogress").length;
    const completed = periodTasks.filter(t => t.status === "completed").length;
    
    // Calculate Overdue
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const overdue = periodTasks.filter(t => {
        if (t.status === "completed" || !t.dueDate) return false;
        if (t.dueDate.includes('T')) {
            return new Date(t.dueDate) < new Date();
        }
        return t.dueDate < todayStr;
    }).length;

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
    let result = getTasksFilteredByPeriodAndDate(tasks);

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
        } else if (sortBy === "createdAtDesc") {
            return (b.createdAt || 0) - (a.createdAt || 0);
        } else if (sortBy === "createdAtAsc") {
            return (a.createdAt || 0) - (b.createdAt || 0);
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
    } else if (currentView === "list") {
        renderListView(filteredTasks);
    } else if (currentView === "calendar") {
        renderCalendar();
    }
    
    // Update Lucide Icons
    lucide.createIcons();
}

// --- Render Month Calendar ---
function renderCalendar() {
    if (!calendarDaysGrid) return;
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth(); // 0-indexed
    
    // Update Header Text: "Tháng Năm 2026"
    calMonthYearText.textContent = `${VIETNAMESE_MONTHS[month]} ${year}`;
    
    // Sync location filter checkbox visuals (fallback for older browsers)
    if (calFilterOffice) {
        const label = calFilterOffice.closest('.cal-filter-checkbox');
        if (label) {
            if (calFilterOffice.checked) label.classList.add('checked');
            else label.classList.remove('checked');
        }
    }
    if (calFilterSite) {
        const label = calFilterSite.closest('.cal-filter-checkbox');
        if (label) {
            if (calFilterSite.checked) label.classList.add('checked');
            else label.classList.remove('checked');
        }
    }
    
    calendarDaysGrid.innerHTML = "";
    
    // First day of current month (starts on Sunday = 0, Monday = 1...)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Adjust Sunday to be index 6 (to start week with Monday: Monday = 0, ..., Sunday = 6)
    const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    // Number of days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();
    // Number of days in previous month
    const prevTotalDays = new Date(year, month, 0).getDate();
    
    // We render a grid of 42 cells (6 weeks)
    const cellsToRender = 42;
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Get filter states
    const showOffice = calFilterOffice ? calFilterOffice.checked : true;
    const showSite = calFilterSite ? calFilterSite.checked : true;
    
    // Calendar filtered tasks (excludes date-specific filters to see the full month)
    const calendarFilteredTasks = tasks.filter(t => {
        // Location Filter
        const loc = t.workLocation || "office";
        if (loc === "office" && !showOffice) return false;
        if (loc === "site" && !showSite) return false;

        // Category Filter
        if (currentCategoryFilter !== "all" && t.category !== currentCategoryFilter) return false;
        // Priority Filter
        if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
        // Search query
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            if (!t.title.toLowerCase().includes(query) && !t.desc.toLowerCase().includes(query)) return false;
        }
        return true;
    });

    for (let i = 0; i < cellsToRender; i++) {
        const cell = document.createElement("div");
        
        let dayNum;
        let cellDateStr;
        let isOutsideMonth = false;
        let labelText = "";
        
        if (i < adjustedFirstDayIndex) {
            // Day of previous month
            dayNum = prevTotalDays - (adjustedFirstDayIndex - i) + 1;
            isOutsideMonth = true;
            
            const prevMonthDate = new Date(year, month - 1, dayNum);
            const prevMonthName = prevMonthDate.getMonth() + 1;
            const prevMonthYear = prevMonthDate.getFullYear();
            cellDateStr = `${prevMonthYear}-${String(prevMonthName).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            
            labelText = `${dayNum}`;
            if (i === 0 || dayNum === 1) {
                labelText = `${dayNum}/${prevMonthName}`;
            }
        } else if (i < adjustedFirstDayIndex + totalDays) {
            // Day of current month
            dayNum = i - adjustedFirstDayIndex + 1;
            cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            
            labelText = `${dayNum}`;
            if (dayNum === 1) {
                labelText = `${dayNum}/${month + 1}`;
            }
        } else {
            // Day of next month
            dayNum = i - adjustedFirstDayIndex - totalDays + 1;
            isOutsideMonth = true;
            
            const nextMonthDate = new Date(year, month + 1, dayNum);
            const nextMonthName = nextMonthDate.getMonth() + 1;
            const nextMonthYear = nextMonthDate.getFullYear();
            cellDateStr = `${nextMonthYear}-${String(nextMonthName).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            
            labelText = `${dayNum}`;
            if (dayNum === 1) {
                labelText = `${dayNum}/${nextMonthName}`;
            }
        }
        
        cell.className = "calendar-day-cell";
        cell.dataset.date = cellDateStr;
        
        if (isOutsideMonth) {
            cell.classList.add("outside-month");
        }
        
        if (cellDateStr === todayStr) {
            cell.classList.add("today");
        }
        
        // Day number element
        const numElem = document.createElement("span");
        numElem.className = "calendar-day-number";
        numElem.textContent = labelText;
        cell.appendChild(numElem);
        
        // Tasks container
        const tasksContainer = document.createElement("div");
        tasksContainer.className = "calendar-day-tasks";
        
        // Find tasks active on this date (multi-day event support)
        const dayTasks = calendarFilteredTasks.filter(t => {
            const taskStartStr = t.startDate ? t.startDate.split('T')[0] : (t.dueDate ? t.dueDate.split('T')[0] : "");
            const taskEndStr = t.dueDate ? t.dueDate.split('T')[0] : "";
            if (!taskEndStr) return false;
            
            const inRange = cellDateStr >= taskStartStr && cellDateStr <= taskEndStr;
            if (!inRange) return false;
            
            // Check Saturday / Sunday exclusions independently
            const dayOfWeek = new Date(cellDateStr + 'T12:00:00').getDay(); // 0 is Sunday, 6 is Saturday
            if (dayOfWeek === 6) {
                const includeSat = t.includeSaturday !== undefined ? t.includeSaturday : (t.includeWeekends !== false);
                if (!includeSat) return false;
            }
            if (dayOfWeek === 0) {
                const includeSun = t.includeSunday !== undefined ? t.includeSunday : (t.includeWeekends !== false);
                if (!includeSun) return false;
            }
            return true;
        });
        
        // Sắp xếp dayTasks cố định theo startDate và id để thẳng hàng dải màu nối liền
        dayTasks.sort((a, b) => {
            const startA = a.startDate || a.dueDate;
            const startB = b.startDate || b.dueDate;
            if (startA !== startB) {
                return startA.localeCompare(startB);
            }
            return a.id.localeCompare(b.id);
        });
        
        dayTasks.forEach(task => {
            const badge = document.createElement("div");
            const isCompleted = task.status === "completed";
            const locationClass = task.workLocation === "site" ? "loc-site" : "loc-office";
            const completedClass = isCompleted ? "completed" : "";
            
            // Xác định class dải màu nối liền bằng cách kiểm tra hiển thị của các ngày kề bên
            let spanClass = "";
            const taskStartStr = task.startDate ? task.startDate.split('T')[0] : (task.dueDate ? task.dueDate.split('T')[0] : "");
            const taskEndStr = task.dueDate ? task.dueDate.split('T')[0] : "";
            
            if (taskStartStr && taskEndStr && taskStartStr < taskEndStr) {
                const rendersOnDate = (dateStr) => {
                    if (dateStr < taskStartStr || dateStr > taskEndStr) return false;
                    const dayOfWeek = new Date(dateStr + 'T12:00:00').getDay();
                    if (dayOfWeek === 6) {
                        const includeSat = task.includeSaturday !== undefined ? task.includeSaturday : (task.includeWeekends !== false);
                        if (!includeSat) return false;
                    }
                    if (dayOfWeek === 0) {
                        const includeSun = task.includeSunday !== undefined ? task.includeSunday : (task.includeWeekends !== false);
                        if (!includeSun) return false;
                    }
                    return true;
                };

                const getOffsetDateStr = (dateStr, offset) => {
                    const d = new Date(dateStr + 'T12:00:00');
                    d.setDate(d.getDate() + offset);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                };

                const hasPrev = rendersOnDate(getOffsetDateStr(cellDateStr, -1));
                const hasNext = rendersOnDate(getOffsetDateStr(cellDateStr, 1));

                if (hasPrev && hasNext) {
                    spanClass = "event-span-middle";
                } else if (hasPrev && !hasNext) {
                    spanClass = "event-span-end";
                } else if (!hasPrev && hasNext) {
                    spanClass = "event-span-start";
                } else {
                    spanClass = ""; // Single day segment (no connection)
                }
            }
            
            badge.className = `calendar-task-badge ${locationClass} ${completedClass} ${spanClass}`;
            badge.dataset.taskId = task.id;
            
            // Thiết lập title hiển thị khoảng thời gian chi tiết
            const startTimeStr = task.startDate ? formatDate(task.startDate) : "";
            const endTimeStr = formatDate(task.dueDate);
            badge.title = `${task.title}\n📍 Địa điểm: ${task.workLocation === 'site' ? 'Tại site' : 'Văn phòng'}\n📅 ${startTimeStr ? 'Bắt đầu: ' + startTimeStr + '\n' : ''}⌛ Hạn kết thúc: ${endTimeStr}`;
            
            const icon = task.workLocation === "site" ? "🚧" : "🏢";
            
            let assigneeHTML = "";
            if (task.assignee && task.assignee.trim() !== "") {
                const colorClass = task.assigneeColor ? `assignee-${task.assigneeColor}` : "assignee-purple";
                assigneeHTML = `
                    <div class="task-assignee-badge ${colorClass}" style="font-size: 0.65rem; padding: 2px 6px; border-radius: var(--border-radius-sm); margin-top: 4px; width: fit-content; display: inline-flex; align-items: center; gap: 0.25rem;">
                        <i data-lucide="user" style="width: 10px; height: 10px; stroke-width: 2.5;"></i>
                        <span>${escapeHTML(task.assignee)}</span>
                    </div>
                `;
            }
            
            badge.innerHTML = `
                <div style="display: flex; flex-direction: column; width: 100%;">
                    <div style="display: flex; align-items: flex-start; gap: 0.35rem; flex-wrap: wrap;">
                        <span>${icon}</span>
                        <span style="font-weight: 600; word-break: break-word; white-space: normal;">${escapeHTML(task.title)}</span>
                    </div>
                    ${assigneeHTML}
                </div>
            `;
            
            // Hover đồng bộ mượt mà cho các phần của cùng một task trải dài
            badge.addEventListener("mouseenter", () => {
                document.querySelectorAll(`.calendar-task-badge[data-task-id="${task.id}"]`).forEach(b => {
                    b.classList.add("hovered");
                });
            });
            badge.addEventListener("mouseleave", () => {
                document.querySelectorAll(`.calendar-task-badge[data-task-id="${task.id}"]`).forEach(b => {
                    b.classList.remove("hovered");
                });
            });
            
            badge.addEventListener("click", (e) => {
                e.stopPropagation();
                openModal(task.id);
            });
            
            tasksContainer.appendChild(badge);
        });
        
        cell.appendChild(tasksContainer);
        
        // Double-click to create task pre-filled with date
        cell.addEventListener("dblclick", () => {
            openModal();
            // Đặt ngày bắt đầu mặc định là ngày double-click
            taskStartDateInput.value = cellDateStr;
            taskDateInput.value = cellDateStr;
        });
        
        calendarDaysGrid.appendChild(cell);
    }
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

    // Đồng bộ hiển thị cột mobile
    switchMobileKanbanColumn(activeMobileKanbanColumn);
}

// --- Create Task Card Element ---
function createTaskCard(task) {
    const card = document.createElement("div");
    card.className = "task-card";
    card.draggable = true;
    card.dataset.id = task.id;

    // Check overdue
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    let isOverdue = false;
    if (task.dueDate && task.status !== "completed") {
        if (task.dueDate.includes('T')) {
            isOverdue = new Date(task.dueDate) < new Date();
        } else {
            isOverdue = task.dueDate < todayStr;
        }
    }
    const isCompleted = task.status === "completed";
    const completedClass = isCompleted ? "completed-text" : "";

    // Subtasks calculations
    let subtaskHTML = "";
    if (task.subtasks && task.subtasks.length > 0) {
        const comp = task.subtasks.filter(s => s.completed).length;
        const total = task.subtasks.length;
        const pct = Math.round((comp / total) * 100);
        
        let itemsHTML = "";
        task.subtasks.forEach((sub, idx) => {
            const checkedClass = sub.completed ? "checked" : "";
            const textCompletedClass = sub.completed ? "completed-text" : "";
            itemsHTML += `
                <li class="card-subtask-item" data-index="${idx}" style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.75rem; color: var(--color-text-muted); cursor: pointer; padding: 2px 0;">
                    <div class="card-subtask-checkbox ${checkedClass}">
                        <i data-lucide="check" style="width: 8px; height: 8px; stroke-width: 3;"></i>
                    </div>
                    <span class="${textCompletedClass}" style="transition: all 0.2s; word-break: break-word;">${escapeHTML(sub.title)}</span>
                </li>
            `;
        });
        
        subtaskHTML = `
            <div class="task-card-subtasks" style="border-top: 1px solid var(--bg-card-border); padding-top: 0.65rem; display: flex; flex-direction: column; gap: 0.5rem;">
                <div class="card-subtask-header" style="display: flex; justify-content: space-between; font-size: 0.725rem; color: var(--color-text-muted); font-weight: 600;">
                    <span>Việc phụ</span>
                    <span>${comp}/${total} (${pct}%)</span>
                </div>
                <div class="card-progress-bar-bg" style="width: 100%; height: 4px; background-color: var(--bg-card-border); border-radius: var(--border-radius-full); overflow: hidden;">
                    <div class="card-progress-bar-fill" style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%); border-radius: var(--border-radius-full); transition: width 0.3s;"></div>
                </div>
                <ul class="card-subtasks-list" style="list-style: none; display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.25rem; max-height: 100px; overflow-y: auto; padding-right: 2px;">
                    ${itemsHTML}
                </ul>
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

    const locClass = task.workLocation === "site" ? "loc-site" : "loc-office";
    const locLabel = task.workLocation === "site" ? "🚧 Tại site" : "🏢 Văn phòng";

    card.innerHTML = `
        <div class="task-card-header">
            <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
                <span class="task-tag ${catClass}">${task.category}</span>
                <span class="task-loc-tag ${locClass}">${locLabel}</span>
            </div>
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
            <div class="card-title-container">
                <div class="card-complete-checkbox ${isCompleted ? "checked" : ""}" title="${isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}">
                    <i data-lucide="check"></i>
                </div>
                <h4 class="${completedClass}">${escapeHTML(task.title)}</h4>
            </div>
            ${task.desc ? `<p>${escapeHTML(task.desc)}</p>` : ""}
            ${task.assignee ? `
            <div class="task-assignee-badge assignee-${task.assigneeColor || 'purple'}">
                <i data-lucide="user"></i>
                <span>${escapeHTML(task.assignee)}</span>
            </div>
            ` : ""}
        </div>
        ${subtaskHTML}
        <!-- Specific Progress Bar -->
        <div class="task-card-progress">
            <div class="card-progress-header">
                <span>Tiến độ</span>
                <span>${task.progress || 0}%</span>
            </div>
            <div class="card-progress-bar-bg">
                <div class="card-progress-bar-fill" style="width: ${task.progress || 0}%"></div>
            </div>
        </div>
        <div class="task-card-footer">
            <div class="task-card-dates">
                ${task.startDate ? `
                <div class="task-start-date" title="Thời gian bắt đầu" style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.725rem; color: var(--color-text-muted); opacity: 0.85; margin-bottom: 2px;">
                    <i data-lucide="play-circle" style="width: 12px; height: 12px;"></i>
                    <span>Bắt đầu: ${formatDate(task.startDate)}</span>
                </div>
                ` : `
                <div class="task-created-date" title="Ngày tạo công việc">
                    <i data-lucide="plus-circle"></i>
                    <span>Tạo: ${formatTimestamp(task.createdAt)}</span>
                </div>
                `}
                <div class="task-due-date ${isOverdue ? "is-overdue" : ""}" title="Thời gian kết thúc (Hạn chót)">
                    <i data-lucide="calendar"></i>
                    <span>Hạn: ${formatDate(task.dueDate)}</span>
                </div>
            </div>
            <div class="task-priority-indicator priority-${task.priority}">
                <span>${priorityLabel}</span>
            </div>
        </div>
    `;

    // Add buttons click event inside cards
    card.querySelector(".card-complete-checkbox").addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTaskCompletion(task.id);
    });
    card.querySelector(".edit-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(task.id);
    });
    card.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        handleDeleteTask(task.id);
    });

    // Add click events on card subtask items
    const subtaskItems = card.querySelectorAll(".card-subtask-item");
    subtaskItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(item.dataset.index);
            toggleCardSubtask(task.id, idx);
        });
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

    filteredTasks.forEach(task => {
        // Overdue check
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        let isOverdue = false;
        if (task.dueDate && task.status !== "completed") {
            if (task.dueDate.includes('T')) {
                isOverdue = new Date(task.dueDate) < new Date();
            } else {
                isOverdue = task.dueDate < todayStr;
            }
        }
        const isCompleted = task.status === "completed";
        const completedClass = isCompleted ? "completed-text" : "";

        // Subtask rendering
        let subtasksProgress = "-";
        if (task.subtasks && task.subtasks.length > 0) {
            const comp = task.subtasks.filter(s => s.completed).length;
            const total = task.subtasks.length;
            const pct = Math.round((comp / total) * 100);
            subtasksProgress = `
                <div class="list-progress-bar-container">
                    <span>${comp}/${total} (${pct}%)</span>
                    <div class="list-progress-bar-bg">
                        <div class="card-progress-bar-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }

        // Specific task progress rendering
        const taskProgressHTML = `
            <div class="list-progress-bar-container">
                <span>${task.progress || 0}%</span>
                <div class="list-progress-bar-bg">
                    <div class="card-progress-bar-fill" style="width: ${task.progress || 0}%"></div>
                </div>
            </div>
        `;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div class="card-complete-checkbox ${isCompleted ? "checked" : ""}" title="${isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}">
                    <i data-lucide="check"></i>
                </div>
            </td>
            <td>
                <div class="list-task-title ${completedClass}">${escapeHTML(task.title)}</div>
                ${task.desc ? `<div class="list-task-desc">${escapeHTML(task.desc)}</div>` : ""}
            </td>
            <td>
                ${task.assignee ? `
                <span class="task-assignee-badge assignee-${task.assigneeColor || 'purple'}">
                    <i data-lucide="user"></i>
                    <span>${escapeHTML(task.assignee)}</span>
                </span>
                ` : "-"}
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 0.35rem; align-items: flex-start;">
                    <span class="task-tag cat-${task.category ? task.category.toLowerCase() : "default"}">${task.category}</span>
                    <span class="task-loc-tag ${task.workLocation === 'site' ? 'loc-site' : 'loc-office'}">${task.workLocation === 'site' ? '🚧 Tại site' : '🏢 Văn phòng'}</span>
                </div>
            </td>
            <td>
                <div class="task-created-date">
                    <span>${formatTimestamp(task.createdAt)}</span>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    ${task.startDate ? `
                    <div class="task-start-date" style="font-size: 0.725rem; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px; opacity: 0.85;">
                        <i data-lucide="play-circle" style="width: 10px; height: 10px;"></i>
                        <span>${formatDate(task.startDate)}</span>
                    </div>
                    ` : ""}
                    <div class="task-due-date ${isOverdue ? "is-overdue" : ""}" style="display: flex; align-items: center; gap: 4px;">
                        <i data-lucide="calendar" style="width: 10px; height: 10px;"></i>
                        <span>${formatDate(task.dueDate)}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="task-priority-indicator priority-${task.priority}">
                    <span>${task.priority === "high" ? "Cao" : task.priority === "medium" ? "Trung bình" : "Thấp"}</span>
                </div>
            </td>
            <td>${taskProgressHTML}</td>
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

        tr.querySelector(".card-complete-checkbox").addEventListener("click", (e) => {
            e.stopPropagation();
            toggleTaskCompletion(task.id);
        });
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
    
    // Drag drop sync logic
    if (newStatus === "completed") {
        task.progress = 100;
        if (task.subtasks) {
            task.subtasks.forEach(sub => sub.completed = true);
        }
    } else {
        // Dragged out of completed
        if (oldStatus === "completed") {
            if (task.subtasks && task.subtasks.length > 0) {
                // Nếu có subtasks, uncheck subtask cuối cùng để tiến độ dưới 100%
                task.subtasks[task.subtasks.length - 1].completed = false;
                const comp = task.subtasks.filter(s => s.completed).length;
                const total = task.subtasks.length;
                task.progress = Math.round((comp / total) * 100);
            } else {
                task.progress = 80;
            }
        }
    }

    saveTasks();
    renderSidebarCategories();
    renderAll();

    // Trigger celebration if newly completed!
    if (newStatus === "completed" && oldStatus !== "completed") {
        triggerConfettiCelebration();
    }
}

function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const wasCompleted = task.status === "completed";
    if (wasCompleted) {
        task.status = "todo";
        task.progress = 0;
        if (task.subtasks) {
            task.subtasks.forEach(s => s.completed = false);
        }
    } else {
        task.status = "completed";
        task.progress = 100;
        if (task.subtasks) {
            task.subtasks.forEach(s => s.completed = true);
        }
        triggerConfettiCelebration();
    }
    saveTasks();
    renderSidebarCategories();
    renderAll();
}

function toggleCardSubtask(taskId, subtaskIndex) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) return;

    const wasCompleted = task.status === "completed";
    
    // Toggle completed state of subtask
    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;

    // Recalculate progress
    const comp = task.subtasks.filter(s => s.completed).length;
    const total = task.subtasks.length;
    task.progress = Math.round((comp / total) * 100);

    // Auto-update status based on progress
    if (task.progress === 100) {
        task.status = "completed";
        if (!wasCompleted) {
            triggerConfettiCelebration();
        }
    } else if (wasCompleted && task.progress < 100) {
        task.status = "inprogress";
    }

    task.updatedAt = Date.now();
    saveTasks();
    renderSidebarCategories();
    renderAll();
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

    // Set today and 08:00 as default start date-time, 17:00 as default due date-time
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    taskStartDateInput.value = todayStr;
    taskStartHourInput.value = "08";
    taskStartMinuteInput.value = "00";
    taskDateInput.value = todayStr;
    taskHourInput.value = "17";
    taskMinuteInput.value = "00";

    if (editingTaskId) {
        const task = tasks.find(t => t.id === editingTaskId);
        if (task) {
            modalTitle.textContent = "Chỉnh Sửa Công Việc";
            taskIdInput.value = task.id;
            taskTitleInput.value = task.title;
            taskDescInput.value = task.desc || "";
            
            // Tách ngày và giờ bắt đầu (tương thích ngược)
            let formStartDate = task.startDate;
            if (!formStartDate) {
                if (task.dueDate) {
                    const datePart = task.dueDate.split('T')[0];
                    formStartDate = `${datePart}T08:00`;
                } else {
                    formStartDate = `${todayStr}T08:00`;
                }
            }
            if (formStartDate) {
                if (formStartDate.includes('T')) {
                    const [datePart, timePart] = formStartDate.split('T');
                    taskStartDateInput.value = datePart;
                    const [hour, minute] = timePart.split(':');
                    taskStartHourInput.value = hour;
                    taskStartMinuteInput.value = minute.substring(0, 2);
                } else {
                    taskStartDateInput.value = formStartDate;
                    taskStartHourInput.value = "08";
                    taskStartMinuteInput.value = "00";
                }
            }

            // Tương thích ngược: tách ngày và giờ hạn chót
            let formDueDate = task.dueDate;
            if (formDueDate) {
                if (formDueDate.includes('T')) {
                    const [datePart, timePart] = formDueDate.split('T');
                    taskDateInput.value = datePart;
                    const [hour, minute] = timePart.split(':');
                    taskHourInput.value = hour;
                    taskMinuteInput.value = minute.substring(0, 2);
                } else {
                    taskDateInput.value = formDueDate;
                    taskHourInput.value = "17";
                    taskMinuteInput.value = "00";
                }
            }
            
            taskCategoryInput.value = task.category;
            taskAssigneeInput.value = task.assignee || "";
            taskStatusInput.value = task.status || "todo";
            
            // Set assignee color radio button
            const assigneeColorVal = task.assigneeColor || "purple";
            const colorRadio = taskForm.querySelector(`input[name="assigneeColor"][value="${assigneeColorVal}"]`);
            if (colorRadio) colorRadio.checked = true;
            
            const progressVal = task.progress !== undefined ? task.progress : 0;
            taskProgressInput.value = progressVal;
            progressValLabel.textContent = `${progressVal}%`;
            
            // Radio priority check
            const radio = taskForm.querySelector(`input[name="priority"][value="${task.priority}"]`);
            if (radio) radio.checked = true;

            // Location radio check
            const locVal = task.workLocation || "office";
            const locRadio = taskForm.querySelector(`input[name="workLocation"][value="${locVal}"]`);
            if (locRadio) locRadio.checked = true;

            // Load includeSaturday and includeSunday checkboxes
            let includeSat = true;
            let includeSun = true;
            if (task.includeSaturday !== undefined) {
                includeSat = task.includeSaturday;
            } else if (task.includeWeekends === false) {
                includeSat = false;
            }
            if (task.includeSunday !== undefined) {
                includeSun = task.includeSunday;
            } else if (task.includeWeekends === false) {
                includeSun = false;
            }

            if (taskIncludeSaturdayInput) taskIncludeSaturdayInput.checked = includeSat;
            if (taskIncludeSundayInput) taskIncludeSundayInput.checked = includeSun;

            // Load subtasks
            if (task.subtasks) {
                tempSubtasks = [...task.subtasks];
            }
        }
    } else {
        modalTitle.textContent = "Tạo Công Việc Mới";
        taskIdInput.value = "";
        taskForm.reset();
        taskAssigneeInput.value = "";
        taskStatusInput.value = "todo";
        taskProgressInput.value = 0;
        progressValLabel.textContent = "0%";
        // default priority
        taskForm.querySelector('input[name="priority"][value="low"]').checked = true;
        // default location
        const defaultLocRadio = taskForm.querySelector('input[name="workLocation"][value="office"]');
        if (defaultLocRadio) defaultLocRadio.checked = true;
        // default assigneeColor
        const defaultColorRadio = taskForm.querySelector('input[name="assigneeColor"][value="purple"]');
        if (defaultColorRadio) defaultColorRadio.checked = true;
        // default includeWeekends
        if (taskIncludeSaturdayInput) taskIncludeSaturdayInput.checked = true;
        if (taskIncludeSundayInput) taskIncludeSundayInput.checked = true;
    }

    renderModalSubtasks();
}

function closeModal() {
    taskModal.classList.remove("active");
    taskForm.reset();
    tempSubtasks = [];
}

function syncModalProgressWithSubtasks() {
    if (!taskProgressInput || !progressValLabel || !taskStatusInput) return;

    if (tempSubtasks && tempSubtasks.length > 0) {
        const comp = tempSubtasks.filter(s => s.completed).length;
        const total = tempSubtasks.length;
        const pct = Math.round((comp / total) * 100);
        
        taskProgressInput.value = pct;
        progressValLabel.textContent = `${pct}%`;
        taskProgressInput.disabled = true;
        taskProgressInput.style.opacity = "0.6";
        taskProgressInput.style.cursor = "not-allowed";
        
        // Sync status dynamic
        if (pct === 100) {
            taskStatusInput.value = "completed";
        } else if (taskStatusInput.value === "completed" && pct < 100) {
            taskStatusInput.value = "inprogress";
        }
    } else {
        taskProgressInput.disabled = false;
        taskProgressInput.style.opacity = "1";
        taskProgressInput.style.cursor = "pointer";
    }
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
    syncModalProgressWithSubtasks();
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

function handleFormSubmit(e) {
    e.preventDefault();

    const id = taskIdInput.value;
    const title = taskTitleInput.value.trim();
    const desc = taskDescInput.value.trim();
    const startDate = `${taskStartDateInput.value}T${taskStartHourInput.value}:${taskStartMinuteInput.value}`;
    const dueDate = `${taskDateInput.value}T${taskHourInput.value}:${taskMinuteInput.value}`;
    const category = taskCategoryInput.value;
    const priority = taskForm.querySelector('input[name="priority"]:checked').value;
    const workLocation = taskForm.querySelector('input[name="workLocation"]:checked').value;
    const includeSaturday = taskIncludeSaturdayInput ? taskIncludeSaturdayInput.checked : true;
    const includeSunday = taskIncludeSundayInput ? taskIncludeSundayInput.checked : true;
    const assignee = taskAssigneeInput.value.trim();
    const assigneeColor = taskForm.querySelector('input[name="assigneeColor"]:checked').value;
    let status = taskStatusInput.value;
    let progress = parseInt(taskProgressInput.value);

    // Kiểm tra ràng buộc logic thời gian
    if (new Date(startDate) > new Date(dueDate)) {
        showToast("Thời gian kết thúc không thể trước thời gian bắt đầu!", "warning");
        return;
    }

    // Đồng bộ ngược từ status sang subtasks nếu có subtasks để tránh mâu thuẫn dữ liệu
    if (tempSubtasks.length > 0) {
        if (status === "completed") {
            tempSubtasks.forEach(s => s.completed = true);
            progress = 100;
        } else if (status === "todo") {
            tempSubtasks.forEach(s => s.completed = false);
            progress = 0;
        } else if (status === "inprogress" && tempSubtasks.every(s => s.completed)) {
            // Nếu chuyển thành inprogress mà tất cả subtasks đang completed, ta uncheck việc phụ cuối cùng
            tempSubtasks[tempSubtasks.length - 1].completed = false;
            const comp = tempSubtasks.filter(s => s.completed).length;
            progress = Math.round((comp / tempSubtasks.length) * 100);
        }
    }

    // Double check status and progress sync
    if (progress === 100) {
        status = "completed";
    } else if (status === "completed") {
        progress = 100;
    }

    if (title === "") return;

    // Đồng bộ màu sắc nhân viên sang bản đồ màu sắc toàn cục và các công việc khác
    if (assignee && assignee.trim() !== "") {
        const key = assignee.trim().toLowerCase();
        assigneeColors[key] = assigneeColor;
        saveAssigneeColors();
        
        tasks.forEach(t => {
            if (t.assignee && t.assignee.trim().toLowerCase() === key) {
                t.assigneeColor = assigneeColor;
            }
        });
        
        populateAssigneeDatalist();
    }

    if (id) {
        // Editing existing task
        const task = tasks.find(t => t.id === id);
        if (task) {
            const wasCompleted = task.status === "completed";
            
            task.title = title;
            task.desc = desc;
            task.startDate = startDate;
            task.dueDate = dueDate;
            task.category = category;
            task.priority = priority;
            task.workLocation = workLocation;
            task.includeSaturday = includeSaturday;
            task.includeSunday = includeSunday;
            task.assignee = assignee;
            task.assigneeColor = assigneeColor;
            task.status = status;
            task.progress = progress;
            task.subtasks = [...tempSubtasks];
            task.updatedAt = Date.now();

            if (status === "completed" && !wasCompleted) {
                task.subtasks.forEach(s => s.completed = true);
                triggerConfettiCelebration();
            }

            saveTasks();
        }
    } else {
        // Add new task
        const newTask = {
            id: `task-${Date.now()}`,
            title: title,
            desc: desc,
            startDate: startDate,
            dueDate: dueDate,
            category: category,
            priority: priority,
            workLocation: workLocation,
            includeSaturday: includeSaturday,
            includeSunday: includeSunday,
            assignee: assignee,
            assigneeColor: assigneeColor,
            status: status,
            progress: progress,
            subtasks: [...tempSubtasks],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        if (status === "completed") {
            newTask.subtasks.forEach(s => s.completed = true);
            triggerConfettiCelebration();
        }

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
    downloadAnchor.setAttribute("download", `tgtask_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Đã xuất file sao lưu JSON thành công!", "success");
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
                        rebuildAssigneeColorsFromTasks();
                        renderSidebarCategories();
                        renderAll();
                        showToast("Nhập dữ liệu sao lưu thành công!", "success");
                    }
                } else {
                    showToast("Định dạng file sao lưu không hợp lệ. Vui lòng kiểm tra lại.", "error");
                }
            } else {
                showToast("Nội dung file JSON phải là một mảng các công việc.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Lỗi khi đọc file sao lưu JSON. Hãy chắc chắn tệp của bạn không bị hỏng.", "error");
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
    // Nếu là chuỗi có định dạng datetime-local (chứa ký tự 'T')
    if (dateStr.includes('T')) {
        const [datePart, timePart] = dateStr.split('T');
        const [year, month, day] = datePart.split('-');
        const time = timePart.substring(0, 5); // Lấy "HH:mm"
        return `${day}/${month}/${year} ${time}`;
    }
    // Dữ liệu cũ chỉ có YYYY-MM-DD
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function formatTimestamp(timestamp) {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// ==========================================
// Canvas Confetti Celebrations Engine
// ==========================================
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

// --- Google Drive Config Modal Control ---
function openGDriveConfigModal() {
    if (!gdriveConfigModal) return;
    
    // Đặt lại giá trị input
    gdriveClientIdInput.value = gdriveClientId || "";

    // Cập nhật Banner trạng thái động và hiển thị nút reset tương ứng
    if (gdriveStatusBanner && gdriveStatusText) {
        gdriveStatusBanner.className = "cloud-status-banner";
        
        if (isGDriveConfigured) {
            gdriveStatusBanner.className = "cloud-status-banner status-custom";
            gdriveStatusBanner.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
            gdriveStatusBanner.style.border = "1px solid rgba(16, 185, 129, 0.2)";
            gdriveStatusBanner.style.color = "#10b981";
            gdriveStatusText.innerHTML = `<strong>Đã cấu hình:</strong> Google Client ID đã được thiết lập thành công. Sẵn sàng kết nối!`;
            if (resetGDriveConfigBtn) resetGDriveConfigBtn.style.display = "inline-flex";
        } else {
            gdriveStatusBanner.className = "cloud-status-banner status-none";
            gdriveStatusBanner.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            gdriveStatusBanner.style.border = "1px solid rgba(239, 68, 68, 0.2)";
            gdriveStatusBanner.style.color = "#ef4444";
            gdriveStatusText.innerHTML = `<strong>Chưa cấu hình:</strong> Ứng dụng hiện đang lưu dữ liệu offline trong trình duyệt. Vui lòng thiết lập Client ID của bạn.`;
            if (resetGDriveConfigBtn) resetGDriveConfigBtn.style.display = "none";
        }
    }

    gdriveConfigModal.classList.add("active");
    if (window.lucide) lucide.createIcons();
}

function closeGDriveConfigModal() {
    if (!gdriveConfigModal) return;
    gdriveConfigModal.classList.remove("active");
}

function handleGDriveConfigSubmit(e) {
    e.preventDefault();
    
    const clientId = gdriveClientIdInput.value.trim();
    if (!clientId) {
        showToast("Vui lòng nhập Client ID hợp lệ!", "warning");
        return;
    }
    
    try {
        localStorage.setItem("tgtask_gdrive_client_id", clientId);
        gdriveClientId = clientId;
        isGDriveConfigured = true;
        
        updateGDriveConfigBadge(true);
        closeGDriveConfigModal();
        showToast("Đã lưu cấu hình Google Client ID thành công! Bạn có thể kết nối ngay.", "success");
        renderUserProfile();
    } catch (e) {
        console.error("Lỗi lưu cấu hình Google Drive:", e);
        showToast("Có lỗi xảy ra khi lưu cấu hình.", "error");
    }
}

function handleResetGDriveConfig() {
    if (confirm("Bạn có chắc chắn muốn xóa cấu hình Google Client ID hiện tại không? Mọi tính năng đồng bộ sẽ bị tạm dừng.")) {
        try {
            localStorage.removeItem("tgtask_gdrive_client_id");
            localStorage.removeItem("tgtask_gdrive_access_token");
            localStorage.removeItem("tgtask_gdrive_token_expires");
            localStorage.removeItem("tgtask_gdrive_token_scope");
            localStorage.removeItem("tgtask_gdrive_user_email");
            localStorage.removeItem("tgtask_gdrive_user_name");
            localStorage.removeItem("tgtask_gdrive_user_avatar");
            
            gdriveClientId = "";
            gdriveAccessToken = "";
            isGDriveConfigured = false;
            gdriveUserEmail = "";
            gdriveUserName = "";
            gdriveUserAvatar = "";
            
            updateGDriveConfigBadge(false);
            closeGDriveConfigModal();
            showToast("Đã xóa cấu hình Google Drive thành công!", "success");
            renderUserProfile();
        } catch (e) {
            console.error("Lỗi xóa cấu hình Google Drive:", e);
            showToast("Lỗi khi xóa cấu hình.", "error");
        }
    }
}

// ==========================================================================
// Premium Toast Notifications System (Glassmorphism)
// ==========================================================================
function showToast(message, type = "info") {
    // Tìm hoặc tạo Toast container
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "info";
    if (type === "success") icon = "check-circle";
    if (type === "error") icon = "alert-triangle";
    if (type === "warning") icon = "alert-circle";

    toast.innerHTML = `
        <i data-lucide="${icon}"></i>
        <div class="toast-content">${message}</div>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    // Event click đóng nhanh
    toast.querySelector(".toast-close").addEventListener("click", () => {
        toast.classList.add("leaving");
        setTimeout(() => toast.remove(), 300);
    });

    // Tự động biến mất sau 4 giây
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add("leaving");
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}
