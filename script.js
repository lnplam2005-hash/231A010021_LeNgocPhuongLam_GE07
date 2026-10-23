// Lấy dữ liệu từ LocalStorage hoặc khởi tạo mảng rỗng (Bài 3)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Hàm chống XSS cơ bản - Escape HTML strings (Bài 4)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Xử lý sự kiện submit form (Bài 2 & Bài 4)
document.getElementById('transactionForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const type = document.getElementById('type').value;
    const amountInput = document.getElementById('amount').value;
    const categoryInput = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    // Validation: Không để trống dữ liệu & số tiền lớn hơn 0 (Bài 2)
    if (!amountInput || !categoryInput.trim() || !date) {
        alert('Vui lòng điền đầy đủ tất cả các trường dữ liệu!');
        return;
    }

    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
        alert('Số tiền phải là một số lớn hơn 0!');
        return;
    }

    // Chống XSS bằng cách escape dữ liệu đầu vào chuỗi
    const safeCategory = escapeHTML(categoryInput.trim());

    const newTransaction = {
        id: Date.now(),
        type: type,
        amount: amount,
        category: safeCategory,
        date: date
    };

    transactions.push(newTransaction);
    saveAndRefresh();
    
    // Reset form
    this.reset();
});

// Lưu vào LocalStorage và cập nhật giao diện (Bài 3)
function saveAndRefresh() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    initApp();
}

// Xóa giao dịch
function deleteTransaction(id) {
    transactions = transactions.filter(item => item.id !== id);
    saveAndRefresh();
}

// Tính toán và hiển thị giao diện tổng quan, bảng dữ liệu, thanh tiến trình (Bài 1 & Bài 3)
function initApp() {
    const tableBody = document.getElementById('transactionTableBody');
    tableBody.innerHTML = '';

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(item => {
        if (item.type === 'income') {
            totalIncome += item.amount;
        } else {
            totalExpense += item.amount;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.category}</td>
            <td><span class="${item.type === 'income' ? 'badge-income' : 'badge-expense'}">${item.type === 'income' ? 'Thu' : 'Chi'}</span></td>
            <td class="${item.type === 'income' ? 'badge-income' : 'badge-expense'}">${item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString('vi-VN')} đ</td>
            <td><button class="btn-delete" onclick="deleteTransaction(${item.id})">Xóa</button></td>
        `;
        tableBody.appendChild(row);
    });

    const totalBalance = totalIncome - totalExpense;

    // Cập nhật số liệu lên thẻ hiển thị (Bài 1)
    document.getElementById('totalBalance').innerText = totalBalance.toLocaleString('vi-VN') + ' đ';
    document.getElementById('totalIncome').innerText = totalIncome.toLocaleString('vi-VN') + ' đ';
    document.getElementById('totalExpense').innerText = totalExpense.toLocaleString('vi-VN') + ' đ';

    // Cập nhật biểu đồ Progress Bar CSS (Bài 3)
    const incomeProgress = document.getElementById('incomeProgress');
    const expenseProgress = document.getElementById('expenseProgress');

    const totalSum = totalIncome + totalExpense;
    if (totalSum === 0) {
        incomeProgress.style.width = '50%';
        incomeProgress.innerText = 'Thu: 0%';
        expenseProgress.style.width = '50%';
        expenseProgress.innerText = 'Chi: 0%';
    } else {
        const incomePercent = ((totalIncome / totalSum) * 100).toFixed(1);
        const expensePercent = ((totalExpense / totalSum) * 100).toFixed(1);

        incomeProgress.style.width = incomePercent + '%';
        incomeProgress.innerText = `Thu: ${incomePercent}%`;

        expenseProgress.style.width = expensePercent + '%';
        expenseProgress.innerText = `Chi: ${expensePercent}%`;
    }
}

// Chạy khởi tạo khi tải trang
initApp();