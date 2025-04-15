// Set default dates
const today = new Date();
const dueDate = new Date();
dueDate.setDate(today.getDate() + 30);
document.getElementById('invoice-date').valueAsDate = today;
document.getElementById('due-date').valueAsDate = dueDate;
// Template selection
const templateCards = document.querySelectorAll('.template-card');
templateCards.forEach(card => {
    card.addEventListener('click', function() {
        templateCards.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const template = this.getAttribute('data-template');
        const previewContainer = document.getElementById('invoice-preview');
        // Remove all template classes
        previewContainer.classList.remove('template-modern', 'template-classic', 'template-minimal');
        // Add the selected template class
        previewContainer.classList.add(`template-${template}`);
        updateInvoice();
    });
});
// Logo preview
document.getElementById('business-logo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('logo-preview');
            preview.src = e.target.result;
            preview.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    }
});
// Form inputs
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('input', updateInvoice);
});
// Add item button
document.getElementById('add-item').addEventListener('click', function() {
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.innerHTML = `
<div class="mb-3">
    <label class="form-label">Item Description</label>
    <input type="text" class="form-control item-description" value="New Item">
</div>
<div class="row">
    <div class="col-4">
        <div class="mb-3">
            <label class="form-label">Quantity</label>
            <input type="number" class="form-control item-quantity" value="1">
        </div>
    </div>
    <div class="col-4">
        <div class="mb-3">
            <label class="form-label">Unit Price</label>
            <input type="number" class="form-control item-price" value="0">
        </div>
    </div>
    <div class="col-4">
        <div class="mb-3">
            <label class="form-label">Amount</label>
            <input type="text" class="form-control item-amount" value="0" disabled>
        </div>
    </div>
</div>
<button type="button" class="btn btn-sm btn-danger remove-item">Remove</button>
`;
    document.getElementById('items-container').appendChild(itemRow);
    // Add event listeners to new row
    const newRow = document.getElementById('items-container').lastElementChild;
    newRow.querySelector('.remove-item').addEventListener('click', function() {
        newRow.remove();
        updateInvoice();
    });
    const newQuantity = newRow.querySelector('.item-quantity');
    const newPrice = newRow.querySelector('.item-price');
    newQuantity.addEventListener('input', updateRowAmount);
    newPrice.addEventListener('input', updateRowAmount);
    updateInvoice();
});
// Remove item buttons
document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', function() {
        this.closest('.item-row').remove();
        updateInvoice();
    });
});
// Calculate row amounts
document.querySelectorAll('.item-quantity, .item-price').forEach(input => {
    input.addEventListener('input', updateRowAmount);
});

function updateRowAmount(e) {
    const row = e.target.closest('.item-row');
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    row.querySelector('.item-amount').value = (quantity * price).toFixed(2);
    updateInvoice();
}
// Download PDF
document.getElementById('download-btn').addEventListener('click', function() {
    const element = document.getElementById('invoice-preview');
    const options = {
        margin: 10,
        filename: document.getElementById('invoice-number').value + '.pdf',
        image: {
            type: 'jpeg',
            quality: 0.98
        },
        html2canvas: {
            scale: 2
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        }
    };
    console.log(html2pdf)
    html2pdf().set(options).from(element).save();
});
// Initial invoice generation
updateInvoice();

function updateInvoice() {
    const template = document.querySelector('.template-card.active').getAttribute('data-template');
    const previewContainer = document.getElementById('invoice-preview');
    // Business info
    const businessName = document.getElementById('business-name').value;
    const businessAddress = document.getElementById('business-address').value;
    const businessContact = document.getElementById('business-contact').value;
    // Client info
    const clientName = document.getElementById('client-name').value;
    const clientAddress = document.getElementById('client-address').value;
    const clientContact = document.getElementById('client-contact').value;
    // Invoice details
    const invoiceNumber = document.getElementById('invoice-number').value;
    const invoiceDate = document.getElementById('invoice-date').value;
    const dueDate = document.getElementById('due-date').value;
    const currencySymbol = document.getElementById('currency').value;
    const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
    const notes = document.getElementById('notes').value;
    // Items
    const items = [];
    document.querySelectorAll('.item-row').forEach(row => {
        items.push({
            description: row.querySelector('.item-description').value,
            quantity: parseFloat(row.querySelector('.item-quantity').value) || 0,
            price: parseFloat(row.querySelector('.item-price').value) || 0,
            amount: parseFloat(row.querySelector('.item-amount').value) || 0
        });
    });
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    // Format dates
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    // Logo
    const logoPreview = document.getElementById('logo-preview');
    const logoHtml = logoPreview.classList.contains('d-none') ? '' :
        `<div class="logo-container">
    <img src="${logoPreview.src}" alt="Business Logo" style="max-width: 100%; max-height: 100%;">
</div>`;
    // Generate template HTML based on selected template
    let invoiceHtml = '';
    if (template === 'modern') {
        invoiceHtml = `
    <div class="invoice-header">
        <div>
            ${logoHtml}
            <div class="invoice-title">INVOICE</div>
            <div>${invoiceNumber}</div>
        </div>
        <div style="text-align: right;">
            <div style="font-weight: bold; margin-bottom: 5px;">${businessName}</div>
            <div style="white-space: pre-line;">${businessAddress}</div>
            <div style="white-space: pre-line;">${businessContact}</div>
        </div>
    </div>
    
    <div class="invoice-details">
        <div class="row">
            <div class="col-md-6">
                <h5>Bill To:</h5>
                <div style="font-weight: bold;">${clientName}</div>
                <div style="white-space: pre-line;">${clientAddress}</div>
                <div style="white-space: pre-line;">${clientContact}</div>
            </div>
            <div class="col-md-6 text-end">
                <div><strong>Invoice Date:</strong> ${formatDate(invoiceDate)}</div>
                <div><strong>Due Date:</strong> ${formatDate(dueDate)}</div>
            </div>
        </div>
    </div>
    
    <table class="table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${currencySymbol}${item.price.toFixed(2)}</td>
                    <td>${currencySymbol}${item.amount.toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="invoice-total">
        <div><strong>Subtotal:</strong> ${currencySymbol}${subtotal.toFixed(2)}</div>
        <div><strong>Tax (${taxRate}%):</strong> ${currencySymbol}${taxAmount.toFixed(2)}</div>
        <div class="total-value">Total: ${currencySymbol}${total.toFixed(2)}</div>
    </div>
    
    <div class="additional-notes">
        <h5>Notes:</h5>
        <div style="white-space: pre-line;">${notes}</div>
    </div>
`;
    } else if (template === 'classic') {
        invoiceHtml = `
    <div class="invoice-header">
        ${logoHtml}
        <div class="invoice-title">INVOICE</div>
        <div>${invoiceNumber}</div>
    </div>
    
    <div class="address-container">
        <div>
            <h4>From:</h4>
            <div style="font-weight: bold;">${businessName}</div>
            <div style="white-space: pre-line;">${businessAddress}</div>
            <div style="white-space: pre-line;">${businessContact}</div>
        </div>
        <div>
            <h4>To:</h4>
            <div style="font-weight: bold;">${clientName}</div>
            <div style="white-space: pre-line;">${clientAddress}</div>
            <div style="white-space: pre-line;">${clientContact}</div>
        </div>
        <div>
            <h4>Details:</h4>
            <div><strong>Invoice Date:</strong> ${formatDate(invoiceDate)}</div>
            <div><strong>Due Date:</strong> ${formatDate(dueDate)}</div>
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${currencySymbol}${item.price.toFixed(2)}</td>
                    <td>${currencySymbol}${item.amount.toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="invoice-total">
        <div><strong>Subtotal:</strong> ${currencySymbol}${subtotal.toFixed(2)}</div>
        <div><strong>Tax (${taxRate}%):</strong> ${currencySymbol}${taxAmount.toFixed(2)}</div>
        <div class="total-value">Total: ${currencySymbol}${total.toFixed(2)}</div>
    </div>
    
    <div class="additional-notes">
        <strong>Notes:</strong>
        <div style="white-space: pre-line;">${notes}</div>
    </div>
`;
    } else if (template === 'minimal') {
        invoiceHtml = `
    <div class="invoice-header">
        <div>
            ${logoHtml}
            <div class="invoice-title">Invoice</div>
            <div class="invoice-number">${invoiceNumber}</div>
        </div>
        <div style="text-align: right;">
            <div style="font-weight: bold;">${businessName}</div>
            <div style="white-space: pre-line;">${businessAddress}</div>
            <div style="white-space: pre-line;">${businessContact}</div>
        </div>
    </div>
    
    <div class="address-container">
        <div>
            <h4>BILLED TO</h4>
            <div style="font-weight: bold;">${clientName}</div>
            <div style="white-space: pre-line;">${clientAddress}</div>
            <div style="white-space: pre-line;">${clientContact}</div>
        </div>
        <div style="text-align: right;">
            <h4>DATE</h4>
            <div>${formatDate(invoiceDate)}</div>
            <h4>DUE DATE</h4>
            <div>${formatDate(dueDate)}</div>
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>DESCRIPTION</th>
                <th>QTY</th>
                <th>PRICE</th>
                <th>AMOUNT</th>
            </tr>
        </thead>
        <tbody>
            ${items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${currencySymbol}${item.price.toFixed(2)}</td>
                    <td>${currencySymbol}${item.amount.toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="invoice-total">
        <div>Subtotal: ${currencySymbol}${subtotal.toFixed(2)}</div>
        <div>Tax (${taxRate}%): ${currencySymbol}${taxAmount.toFixed(2)}</div>
        <div class="total-value">TOTAL: ${currencySymbol}${total.toFixed(2)}</div>
    </div>
    
    <div class="additional-notes">
        <div style="white-space: pre-line;">${notes}</div>
    </div>
`;
    }
    // Update the preview
    previewContainer.innerHTML = invoiceHtml;
}