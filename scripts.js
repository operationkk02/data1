// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA1XAjLiTqd1CodfIqYdOF1oih2k1oMRzE",
    authDomain: "socapp-26d07.firebaseapp.com",
    projectId: "socapp-26d07",
    storageBucket: "socapp-26d07.firebasestorage.app",
    messagingSenderId: "688205639145",
    appId: "1:688205639145:web:e6646133a81b76eaa4af78",
    measurementId: "G-TTWTK62NVK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global variables
let socData = [];
let filteredData = [];
let currentFilter = '';
let socTable;
let checkTable;
let statusTable;
let floorChart;
let socBarChart;

// Apps Script URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJ1cFgp6YbHKIOKvWYSrEp0YxC1Zcx-5YBerPdSRmlzpEC7rGRRzRgPccCLlNGqxAIzA/exec';

$(document).ready(function() {
    // Initialize Thai greeting
    updateThaiGreeting();
    
    // Set today's date as default
    $('#checkDate').val(new Date().toISOString().split('T')[0]);
    
    // Initialize DataTables
    initializeDataTables();
    
    // Load data from Firebase
    loadDataFromFirebase();
    
    // Initialize charts
    initializeChart();
    initializeBarChart();
    
    // Sample usage of bar chart (will be updated with real data)
    renderSocBars({ total: 6, pending: 5, done: 1 });
    
    // Menu card navigation
    $('.menu-card').click(function() {
        const pageName = $(this).data('page');
        showPage(pageName);
    });
    
    // Filter buttons
    $('.filter-btn').click(function() {
        const filter = $(this).data('filter');
        applyFilter(filter);
        updateFilterButtons($(this));
    });

    // Status filter buttons
    $(document).on('click', '.status-filter-btn', function() {
        const status = $(this).data('status');
        applyStatusFilter(status);
        updateStatusFilterButtons($(this));
    });
    
    // Date range search
    $('#searchDateRange').click(function() {
        const startDate = $('#startDate').val();
        const endDate = $('#endDate').val();
        if (startDate && endDate) {
            applyDateRangeFilter(startDate, endDate);
        } else {
            Swal.fire('ข้อผิดพลาด', 'กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด', 'warning');
        }
    });

    // Clear date range
    $('#clearDateRange').click(function() {
        $('#startDate').val('');
        $('#endDate').val('');
        applyFilter('');
        updateFilterButtons($('.filter-btn[data-filter=""]'));
    });
    
    // Form validation and submission
    $('#socForm').validate({
        rules: {
            checkDate: { required: true },
            details: { required: true },
            floor: { required: true },
            checker: { required: true }
        },
        messages: {
            checkDate: "กรุณาเลือกวันที่ตรวจเช็ค",
            details: "กรุณาระบุรายละเอียดที่พบ",
            floor: "กรุณาเลือกชั้น",
            checker: "กรุณาเลือกผู้ตรวจเช็ค"
        },
        submitHandler: function(form) {
            submitSOCForm();
        }
    });
    
    // Edit form submission
    $('#editForm').submit(function(e) {
        e.preventDefault();
        updateSOCRecord();
    });
    
    // Modal controls
    $('#closeModal, #cancelEditBtn').click(function() {
        $('#viewEditModal').addClass('hidden');
    });
    
    // Cancel button
    $('#cancelBtn').click(function() {
        resetForm();
        showMainMenu();
    });

    // Admin login form
    $('#adminLoginForm').submit(function(e) {
        e.preventDefault();
        const password = $('#adminPassword').val();
        if (password === 'adminkk2') {
            $('#adminLogin').hide();
            $('#adminPanel').show();
            updateStatusTab();
            Swal.fire({
                title: 'เข้าสู่ระบบสำเร็จ!',
                text: 'ยินดีต้อนรับ Admin',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            Swal.fire('ข้อผิดพลาด', 'รหัสผ่านไม่ถูกต้อง', 'error');
            $('#adminPassword').val('');
        }
    });

    // Admin logout
    $('#adminLogout').click(function() {
        $('#adminLogin').show();
        $('#adminPanel').hide();
        $('#adminPassword').val('');
        Swal.fire({
            title: 'ออกจากระบบแล้ว',
            icon: 'info',
            timer: 1000,
            showConfirmButton: false
        });
    });

    // Excel download button
    $('#download-excel-data').click(function() {
        exportExcel();
    });
});

function updateThaiGreeting() {
    const now = new Date();
    const options = {
        timeZone: 'Asia/Bangkok',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const thaiDate = now.toLocaleDateString('th-TH', options);
    const hour = now.getHours();
    
    let greeting = '';
    if (hour >= 5 && hour < 12) {
        greeting = 'สวัสดีตอนเช้า';
    } else if (hour >= 12 && hour < 17) {
        greeting = 'สวัสดี';
    } else if (hour >= 17 && hour < 20) {
        greeting = 'สวัสดีตอนเย็น';
    } else {
        greeting = 'สวัสดีตอนค่ำ';
    }
    
    $('#thaiGreeting').text(`${greeting} ${thaiDate}`);
    
    // Update every minute
    setTimeout(updateThaiGreeting, 60000);
}

function showPage(pageName) {
    // Hide main menu and show back button
    $('#main-menu').addClass('hidden');
    $('#back-button').removeClass('hidden');
    
    // Hide all pages
    $('.page-content').addClass('hidden');
    
    // Show selected page
    $(`#${pageName}-page`).removeClass('hidden');
    
    // Initialize page-specific content
    if (pageName === 'data') {
        updateDashboard();
    } else if (pageName === 'check') {
        updateCheckTable();
    } else if (pageName === 'admin') {
        // Reset admin login state when switching to admin page
        $('#adminLogin').show();
        $('#adminPanel').hide();
        $('#adminPassword').val('');
    }
}

function showMainMenu() {
    // Show main menu and hide back button
    $('#main-menu').removeClass('hidden');
    $('#back-button').addClass('hidden');
    
    // Hide all pages
    $('.page-content').addClass('hidden');
}

function initializeDataTables() {
    socTable = $('#socTable').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/th.json'
        },
        responsive: true,
        pageLength: 10,
        order: [[0, 'desc']]
    });

    // Initialize check table
    if ($.fn.DataTable.isDataTable('#checkTable')) {
        $('#checkTable').DataTable().destroy();
    }
    checkTable = $('#checkTable').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/th.json'
        },
        responsive: true,
        pageLength: 10,
        order: [[0, 'desc']]
    });

    statusTable = $('#statusTable').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/th.json'
        },
        responsive: true,
        pageLength: 10,
        order: [[0, 'desc']]
    });
}

function initializeChart() {
    const ctx = document.getElementById('floorChart').getContext('2d');
    floorChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#667eea',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b',
                    '#fa709a'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function initializeBarChart() {
    const ctx = document.getElementById('socBarChart').getContext('2d');
    socBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['จำนวน SOC', 'รอดำเนินการ', 'เสร็จสิ้น'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#6366F1', '#F472B6', '#22D3EE'],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#374151',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: function(value) {
                        return value;
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

async function loadDataFromFirebase() {
    try {
        const snapshot = await db.collection('soc_records').orderBy('checkDate', 'desc').get();
        socData = [];
        snapshot.forEach(doc => {
            socData.push({
                id: doc.id,
                ...doc.data()
            });
        });
        filteredData = [...socData];
        updateTable();
        updateCheckTable();
        updateDashboard();
        updateChart();
        updateStatusTab();
    } catch (error) {
        console.error('Error loading data:', error);
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error');
    }
}

function applyFilter(filter) {
    currentFilter = filter;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch(filter) {
        case 'today':
            filteredData = socData.filter(r => r.checkDate === todayStr);
            updateFilterInfo('วันนี้');
            break;
        case 'yesterday':
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            filteredData = socData.filter(r => r.checkDate === yesterdayStr);
            updateFilterInfo('เมื่อวาน');
            break;
        case 'thisMonth':
            const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            filteredData = socData.filter(r => new Date(r.checkDate) >= thisMonthStart);
            updateFilterInfo('เดือนนี้');
            break;
        case 'lastMonth':
            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            filteredData = socData.filter(r => {
                const checkDate = new Date(r.checkDate);
                return checkDate >= lastMonthStart && checkDate <= lastMonthEnd;
            });
            updateFilterInfo('เดือนที่แล้ว');
            break;
        default:
            filteredData = [...socData];
            updateFilterInfo('ทั้งหมด');
    }
    
    updateTable();
    updateDashboard();
    updateChart();
}

function applyDateRangeFilter(startDate, endDate) {
    filteredData = socData.filter(r => {
        const checkDate = r.checkDate;
        return checkDate >= startDate && checkDate <= endDate;
    });
    updateFilterInfo(`${startDate} ถึง ${endDate}`);
    updateTable();
    updateDashboard();
    updateChart();
    
    // Update filter buttons
    $('.filter-btn').removeClass('active');
}

function applyStatusFilter(status) {
    if (status === '') {
        filteredData = [...socData];
    } else {
        filteredData = socData.filter(r => (r.status || 'รอดำเนินการ') === status);
    }
    updateStatusTable();
}

function updateFilterButtons(activeBtn) {
    $('.filter-btn').removeClass('active');
    activeBtn.addClass('active');
}

function updateStatusFilterButtons(activeBtn) {
    $('.status-filter-btn').removeClass('active');
    activeBtn.addClass('active');
}

function updateFilterInfo(filterText) {
    $('#chartFilterInfo').text(filterText);
    $('#tableFilterInfo').text(filterText);
}

function updateTable() {
    socTable.clear();
    filteredData.forEach(record => {
        const statusBadge = getStatusBadge(record.status || 'รอดำเนินการ');
        const actions = `
            <div class="flex space-x-2">
                <button onclick="viewRecord('${record.id}')" class="text-blue-600 hover:text-blue-800" title="ดู">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                </button>
                <button onclick="editRecord('${record.id}')" class="text-green-600 hover:text-green-800" title="แก้ไข">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                </button>
                <button onclick="deleteRecord('${record.id}')" class="text-red-600 hover:text-red-800