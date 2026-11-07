/**
 * Billing & Invoicing System
 * Owner: RAJARAM HODAWADEKAR | Contact: 1234567890
 * Features:
 * 1. Admin Login & Sign In Security Gate
 * 2. Simplified Client Details (1. Name, 2. Phone Number)
 * 3. Manual QR Code Insertion (with Auto UPI QR Fallback)
 * 4. WhatsApp Sharing with Direct 1-Tap UPI Payment Links
 */

// Default Configurations & Credentials
const DEFAULT_CONFIG = {
  ownerName: 'RAJARAM HODAWADEKAR',
  ownerPhone: '1234567890',
  ownerUpi: '8830994807@upi',
  shopName: 'RAJARAM AGRO AND SERVICES',
  invoicePrefix: 'INV-2026-'
};

const DEFAULT_ADMIN = {
  username: '1234567890',
  password: 'admin',
  name: 'RAJARAM HODAWADEKAR',
  phone: '1234567890'
};

// Application State
let appConfig = { ...DEFAULT_CONFIG };
let currentQrCodeInstance = null;
let invoiceCounter = 1;
let isManualQrActive = false;
let currentHistoryFilter = 'all';

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  initAuthSystem();
  loadConfig();
  initInvoiceMeta();
  setupEventListeners();
  initFixedQrSecuritySystem();
  addInitialRows();
  calculateTotals();
  updateHistoryCounter();
  updateHistoryFilterCounts();
  syncStatusVisuals(document.getElementById('paymentStatus').value);
});

/* ==========================================================================
   1. ADMIN AUTHENTICATION SYSTEM (LOGIN, SIGN IN & SIGN UP)
   ========================================================================== */
function initAuthSystem() {
  // Check if credentials exist in localStorage, if not initialize default
  if (!localStorage.getItem('raj_admin_credentials')) {
    localStorage.setItem('raj_admin_credentials', JSON.stringify(DEFAULT_ADMIN));
  }

  // Check active login session
  const sessionUser = sessionStorage.getItem('raj_admin_logged_in');
  if (sessionUser) {
    unlockBillingApp(sessionUser);
  } else {
    lockBillingApp();
  }

  // Auth Tab Switchers
  const tabSignIn = document.getElementById('tabBtnSignIn');
  const tabSignUp = document.getElementById('tabBtnSignUp');
  const formSignIn = document.getElementById('formSignIn');
  const formSignUp = document.getElementById('formSignUp');

  tabSignIn.addEventListener('click', () => {
    tabSignIn.classList.add('active');
    tabSignUp.classList.remove('active');
    formSignIn.style.display = 'flex';
    formSignUp.style.display = 'none';
  });

  tabSignUp.addEventListener('click', () => {
    tabSignUp.classList.add('active');
    tabSignIn.classList.remove('active');
    formSignUp.style.display = 'flex';
    formSignIn.style.display = 'none';
  });

  // Toggle Password Visibility
  const toggleBtn = document.getElementById('btnToggleLoginPwd');
  const pwdInput = document.getElementById('loginPassword');
  toggleBtn.addEventListener('click', () => {
    if (pwdInput.type === 'password') {
      pwdInput.type = 'text';
      toggleBtn.textContent = '🔒';
    } else {
      pwdInput.type = 'password';
      toggleBtn.textContent = '👁️';
    }
  });

  // Handle Sign In (Login)
  formSignIn.addEventListener('submit', (e) => {
    e.preventDefault();
    const userOrPhone = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const storedAdmin = JSON.parse(localStorage.getItem('raj_admin_credentials') || JSON.stringify(DEFAULT_ADMIN));

    const isMatch = (
      (userOrPhone === storedAdmin.username || userOrPhone === storedAdmin.phone || userOrPhone.toLowerCase() === 'rajaram') &&
      password === storedAdmin.password
    );

    if (isMatch) {
      sessionStorage.setItem('raj_admin_logged_in', storedAdmin.name || 'RAJARAM HODAWADEKAR');
      unlockBillingApp(storedAdmin.name || 'RAJARAM HODAWADEKAR');
      showToast('Welcome back, Rajaram! System unlocked.', 'success');
    } else {
      showToast('Invalid credentials! Default: 1234567890 / admin', 'danger');
    }
  });

  // Handle Sign Up / Reset Password
  formSignUp.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regAdminName').value.trim();
    const phone = document.getElementById('regAdminPhone').value.trim();
    const newPwd = document.getElementById('regPassword').value;
    const confirmPwd = document.getElementById('regConfirmPassword').value;

    if (newPwd !== confirmPwd) {
      showToast('Passwords do not match!', 'warning');
      return;
    }

    const updatedAdmin = {
      username: phone,
      phone: phone,
      name: name,
      password: newPwd
    };

    localStorage.setItem('raj_admin_credentials', JSON.stringify(updatedAdmin));

    // Also update appConfig owner details
    appConfig.ownerName = name;
    appConfig.ownerPhone = phone;
    localStorage.setItem('raj_billing_config', JSON.stringify(appConfig));
    applyConfigToUI();

    sessionStorage.setItem('raj_admin_logged_in', name);
    unlockBillingApp(name);
    showToast('Admin registered & password saved!', 'success');
  });

  // Logout Handler
  document.getElementById('btnLogout').addEventListener('click', () => {
    if (confirm('Lock billing system and logout?')) {
      sessionStorage.removeItem('raj_admin_logged_in');
      lockBillingApp();
      showToast('Logged out securely.', 'info');
    }
  });
}

function unlockBillingApp(adminName) {
  document.getElementById('adminAuthOverlay').style.display = 'none';
  document.getElementById('billingAppRoot').style.display = 'block';
  document.getElementById('headerAdminDisplay').textContent = adminName || appConfig.ownerName;
}

function lockBillingApp() {
  document.getElementById('adminAuthOverlay').style.display = 'flex';
  document.getElementById('billingAppRoot').style.display = 'none';
}

/* ==========================================================================
   2. CONFIGURATION & CORNER DETAILS
   ========================================================================== */
function loadConfig() {
  const saved = localStorage.getItem('raj_billing_config');
  if (saved) {
    try {
      appConfig = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to parse config:', e);
    }
  }
  applyConfigToUI();
}

function applyConfigToUI() {
  // Corner owner details (as specifically required)
  document.getElementById('ownerNameDisplay').textContent = appConfig.ownerName;
  document.getElementById('ownerPhoneDisplay').textContent = appConfig.ownerPhone;
  document.getElementById('ownerPhoneDisplay').href = `tel:${appConfig.ownerPhone}`;
  document.getElementById('ownerUpiDisplay').textContent = appConfig.ownerUpi;

  // Header and print info
  document.getElementById('shopNameDisplay').textContent = appConfig.shopName;
  document.getElementById('shopTaglineDisplay').textContent = appConfig.shopTagline;
  document.getElementById('shopAddressDisplay').textContent = appConfig.shopAddress;
  document.getElementById('signOwnerName').textContent = appConfig.ownerName;
  document.getElementById('upiPayeeName').textContent = appConfig.ownerName;
  document.getElementById('upiPayeeVpa').textContent = appConfig.ownerUpi;

  // Settings inputs
  document.getElementById('cfgOwnerName').value = appConfig.ownerName;
  document.getElementById('cfgOwnerPhone').value = appConfig.ownerPhone;
  document.getElementById('cfgOwnerUpi').value = appConfig.ownerUpi;
  document.getElementById('cfgShopName').value = appConfig.shopName;
  document.getElementById('cfgShopTagline').value = appConfig.shopTagline;
  document.getElementById('cfgShopAddress').value = appConfig.shopAddress;
  document.getElementById('cfgInvoicePrefix').value = appConfig.invoicePrefix;
}

function initInvoiceMeta() {
  const dateInput = document.getElementById('invoiceDate');
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;

  const history = getSavedInvoices();
  if (history.length > 0) {
    invoiceCounter = history.length + 1;
  }
  const padded = String(invoiceCounter).padStart(4, '0');
  document.getElementById('invoiceNumber').value = `${appConfig.invoicePrefix}${padded}`;
}

/* ==========================================================================
   3. FIXED QR CODE SECURITY SYSTEM (PROTECTED BY ADMIN ID & PASSWORD)
   ========================================================================== */
function initFixedQrSecuritySystem() {
  const btnManage = document.getElementById('btnManageFixedQr');
  const modalSec = document.getElementById('modalQrSecurity');
  const formVerify = document.getElementById('formVerifyQrAdmin');
  const panelUnlocked = document.getElementById('qrUnlockedPanel');
  const fileInput = document.getElementById('fixedQrFileInput');
  const btnChooseFile = document.getElementById('btnChooseFixedQrFile');
  const btnRemove = document.getElementById('btnRemoveFixedQr');
  const fixedQrImg = document.getElementById('fixedQrImg');
  const dynamicCanvas = document.getElementById('dynamicQrCanvas');
  const qrLabelStatus = document.getElementById('qrLabelStatus');

  const secPreviewImg = document.getElementById('secPreviewImg');
  const secNoImgText = document.getElementById('secNoImgText');

  // Toggle password visibility in QR security modal
  const btnToggleSecPass = document.getElementById('btnToggleSecPass');
  const secAdminPass = document.getElementById('secAdminPass');
  btnToggleSecPass.addEventListener('click', () => {
    if (secAdminPass.type === 'password') {
      secAdminPass.type = 'text';
      btnToggleSecPass.textContent = '🔒';
    } else {
      secAdminPass.type = 'password';
      btnToggleSecPass.textContent = '👁️';
    }
  });

  // Open QR security modal
  btnManage.addEventListener('click', () => {
    formVerify.style.display = 'flex';
    panelUnlocked.style.display = 'none';
    secAdminPass.value = '';
    modalSec.style.display = 'flex';
    document.getElementById('secAdminUser').value = appConfig.ownerPhone || '1234567890';
  });

  // Close buttons
  document.getElementById('btnCloseQrSecModal').addEventListener('click', () => {
    modalSec.style.display = 'none';
  });
  document.getElementById('btnCloseQrSecBottom').addEventListener('click', () => {
    modalSec.style.display = 'none';
  });

  // Verify Admin ID & Password
  formVerify.addEventListener('submit', (e) => {
    e.preventDefault();
    const userOrPhone = document.getElementById('secAdminUser').value.trim();
    const password = document.getElementById('secAdminPass').value.trim();
    const storedAdmin = JSON.parse(localStorage.getItem('raj_admin_credentials') || JSON.stringify(DEFAULT_ADMIN));

    const isMatch = (
      (userOrPhone === storedAdmin.username || userOrPhone === storedAdmin.phone || userOrPhone.toLowerCase() === 'rajaram') &&
      password === storedAdmin.password
    );

    if (isMatch) {
      formVerify.style.display = 'none';
      panelUnlocked.style.display = 'flex';
      document.getElementById('secUpiIdInput').value = appConfig.ownerUpi || '';
      refreshSecPreview();
      showToast('Admin verified! QR & UPI management unlocked.', 'success');
    } else {
      showToast('Access denied! Incorrect Admin ID or Password.', 'danger');
    }
  });

  // Trigger file selection
  btnChooseFile.addEventListener('click', () => {
    fileInput.click();
  });

  // Handle image upload
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG/PNG)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      localStorage.setItem('raj_fixed_qr_img', base64Data);
      applyFixedQrImage(base64Data);
      refreshSecPreview();
      showToast('Permanent Fixed QR Code updated securely!', 'success');
    };
    reader.readAsDataURL(file);
  });

  // Reset to auto dynamic QR
  btnRemove.addEventListener('click', () => {
    if (confirm('Reset to auto-generated dynamic UPI QR code?')) {
      localStorage.removeItem('raj_fixed_qr_img');
      isManualQrActive = false;
      fixedQrImg.style.display = 'none';
      dynamicCanvas.style.display = 'block';
      qrLabelStatus.textContent = 'Scan with GPay / PhonePe';
      refreshSecPreview();
      calculateTotals();
      showToast('Reset to dynamic UPI QR', 'info');
    }
  });

  // Save UPI ID from security panel
  const btnSaveSecUpi = document.getElementById('btnSaveSecUpiId');
  if (btnSaveSecUpi) {
    btnSaveSecUpi.addEventListener('click', () => {
      const newUpi = document.getElementById('secUpiIdInput').value.trim();
      if (newUpi) {
        appConfig.ownerUpi = newUpi;
        localStorage.setItem('raj_billing_config', JSON.stringify(appConfig));
        applyConfigToUI();
        calculateTotals();
        showToast('Fixed UPI ID updated to: ' + newUpi, 'success');
      } else {
        showToast('Please enter a valid UPI ID', 'warning');
      }
    });
  }

  function refreshSecPreview() {
    const saved = localStorage.getItem('raj_fixed_qr_img');
    if (saved) {
      secPreviewImg.src = saved;
      secPreviewImg.style.display = 'block';
      secNoImgText.style.display = 'none';
    } else {
      secPreviewImg.style.display = 'none';
      secNoImgText.style.display = 'block';
    }
  }

  // Check if permanent QR exists
  const existingFixedQr = localStorage.getItem('raj_fixed_qr_img');
  if (existingFixedQr) {
    applyFixedQrImage(existingFixedQr);
  }
}

function applyFixedQrImage(base64Data) {
  const fixedQrImg = document.getElementById('fixedQrImg');
  const dynamicCanvas = document.getElementById('dynamicQrCanvas');
  const qrLabelStatus = document.getElementById('qrLabelStatus');

  isManualQrActive = true;
  fixedQrImg.src = base64Data;
  fixedQrImg.style.display = 'block';
  dynamicCanvas.style.display = 'none';
  qrLabelStatus.textContent = '🔒 Fixed Verified QR (Scan to Pay)';
}

/* ==========================================================================
   4. EVENT LISTENERS
   ========================================================================== */
function setupEventListeners() {
  document.getElementById('btnAddRow').addEventListener('click', () => addNewRow());

  const tbody = document.getElementById('itemsTableBody');
  tbody.addEventListener('input', (e) => {
    if (e.target.classList.contains('item-qty-input') || e.target.classList.contains('item-price-input')) {
      updateRowTotal(e.target.closest('tr'));
      calculateTotals();
    }
  });

  tbody.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('item-price-input')) {
      e.preventDefault();
      const newRow = addNewRow();
      const nextInput = newRow.querySelector('.item-desc-input');
      if (nextInput) nextInput.focus();
    }
  });

  tbody.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.btn-delete-row');
    if (delBtn) deleteRow(delBtn.closest('tr'));
  });

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price')) || 0;
      addPresetItem(name, price);
    });
  });

  document.getElementById('discountValue').addEventListener('input', calculateTotals);
  document.getElementById('discountType').addEventListener('change', calculateTotals);
  document.getElementById('gstRate').addEventListener('change', calculateTotals);

  document.getElementById('btnNewInvoice').addEventListener('click', resetInvoiceForm);
  document.getElementById('btnPrintInvoice').addEventListener('click', triggerPrint);
  document.getElementById('btnDockPrint').addEventListener('click', triggerPrint);
  document.getElementById('btnSaveInvoice').addEventListener('click', saveCurrentInvoice);

  document.getElementById('btnQuickWhatsApp').addEventListener('click', openWhatsAppModal);
  document.getElementById('btnDockWhatsApp').addEventListener('click', openWhatsAppModal);
  document.getElementById('btnCloseWaModal').addEventListener('click', closeWhatsAppModal);
  document.getElementById('btnShareToAnyoneWhatsApp').addEventListener('click', shareToAnyoneWhatsApp);
  document.getElementById('btnOpenWhatsAppDirect').addEventListener('click', sendViaWhatsAppDirect);
  document.getElementById('btnCopyWaText').addEventListener('click', copyWhatsAppMessage);

  // Toggle client details on printed bill (Keep private / only for me)
  const chkPrint = document.getElementById('chkShowClientOnPrint');
  if (chkPrint) {
    chkPrint.addEventListener('change', (e) => {
      const card = document.getElementById('clientDetailsCard');
      if (card) {
        if (e.target.checked) {
          card.classList.remove('hide-client-print');
          showToast('Client details will be printed on bill', 'info');
        } else {
          card.classList.add('hide-client-print');
          showToast('Client details kept private (hidden from print)', 'info');
        }
      }
    });
  }

  // Quick UPI ID Edit buttons
  const promptUpiChange = () => {
    const current = appConfig.ownerUpi || '1234567890@upi';
    const newUpi = prompt('Enter your new UPI ID / VPA (e.g. rajaram@okhdfcbank or 9876543210@ybl):', current);
    if (newUpi && newUpi.trim() && newUpi.trim() !== current) {
      appConfig.ownerUpi = newUpi.trim();
      localStorage.setItem('raj_billing_config', JSON.stringify(appConfig));
      applyConfigToUI();
      calculateTotals();
      showToast('UPI ID updated to: ' + appConfig.ownerUpi, 'success');
    }
  };

  const btnCornerUpi = document.getElementById('btnQuickEditUpiCorner');
  if (btnCornerUpi) btnCornerUpi.addEventListener('click', promptUpiChange);

  const btnBoxUpi = document.getElementById('btnQuickEditUpiBox');
  if (btnBoxUpi) btnBoxUpi.addEventListener('click', promptUpiChange);

  document.getElementById('btnCopyVpa').addEventListener('click', () => {
    navigator.clipboard.writeText(appConfig.ownerUpi).then(() => {
      showToast('UPI ID copied to clipboard!', 'success');
    });
  });

  document.getElementById('btnHistory').addEventListener('click', openHistoryModal);
  document.getElementById('btnCloseHistoryModal').addEventListener('click', closeHistoryModal);
  document.getElementById('btnCloseHistoryBottom').addEventListener('click', closeHistoryModal);
  document.getElementById('searchHistoryInput').addEventListener('input', filterHistoryList);
  document.getElementById('btnClearHistory').addEventListener('click', clearAllHistory);

  document.getElementById('btnSettings').addEventListener('click', openSettingsModal);
  document.getElementById('btnCloseSettingsModal').addEventListener('click', closeSettingsModal);
  document.getElementById('btnSaveSettings').addEventListener('click', saveSettingsFromModal);
  document.getElementById('btnResetSettings').addEventListener('click', resetSettingsToDefault);

  // Sync Customer Phone to WhatsApp modal recipient
  document.getElementById('clientPhone').addEventListener('input', (e) => {
    document.getElementById('waRecipientPhone').value = e.target.value.trim();
  });

  // Payment Status Change Event (Auto updates in saved bills)
  const paymentStatusSelect = document.getElementById('paymentStatus');
  if (paymentStatusSelect) {
    paymentStatusSelect.addEventListener('change', (e) => {
      updateCurrentInvoiceStatus(e.target.value);
    });
  }

  // 1-Click "Mark Paid" button on invoice sheet
  const btnQuickPaidToggle = document.getElementById('btnQuickPaidToggle');
  if (btnQuickPaidToggle) {
    btnQuickPaidToggle.addEventListener('click', () => {
      const cur = document.getElementById('paymentStatus').value;
      const next = (cur === 'Paid') ? 'Unpaid' : 'Paid';
      updateCurrentInvoiceStatus(next);
    });
  }

  // 1-Click "Mark Paid" button on floating screen dock
  const btnDockTogglePaid = document.getElementById('btnDockTogglePaid');
  if (btnDockTogglePaid) {
    btnDockTogglePaid.addEventListener('click', () => {
      const cur = document.getElementById('paymentStatus').value;
      const next = (cur === 'Paid') ? 'Unpaid' : 'Paid';
      updateCurrentInvoiceStatus(next);
    });
  }

  // Confirm Payment & UTR Button in payment box
  const btnConfirmUtrPayment = document.getElementById('btnConfirmUtrPayment');
  if (btnConfirmUtrPayment) {
    btnConfirmUtrPayment.addEventListener('click', () => {
      const utrVal = document.getElementById('utrRefInput').value.trim();
      updateCurrentInvoiceStatus('Paid', utrVal);
    });
  }

  // WhatsApp Modal "Mark as PAID" Shortcut Button
  const btnWaMarkAsPaid = document.getElementById('btnWaMarkAsPaid');
  if (btnWaMarkAsPaid) {
    btnWaMarkAsPaid.addEventListener('click', () => {
      updateCurrentInvoiceStatus('Paid');
    });
  }

  // History Filter Tabs (All, Unpaid, Paid)
  document.querySelectorAll('.hist-tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.hist-tab-btn').forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');
      currentHistoryFilter = tabBtn.getAttribute('data-filter') || 'all';
      const searchVal = document.getElementById('searchHistoryInput')?.value || '';
      renderHistoryTable(searchVal);
    });
  });
}

/* ==========================================================================
   5. TABLE ROWS & CALCULATIONS
   ========================================================================== */
function addInitialRows() {
  addNewRow('Engine Oil (1 Litre)', 1, 450);
  addNewRow('Brake Shoes / Brake Pads', 1, 380);
  addNewRow('General Servicing & Labour Charges', 1, 350);
}

function addNewRow(desc = '', qty = 1, price = '') {
  const tbody = document.getElementById('itemsTableBody');
  const rowCount = tbody.children.length + 1;
  const tr = document.createElement('tr');

  const unitPrice = parseFloat(price) || 0;
  const lineTotal = (qty * unitPrice).toFixed(2);

  tr.innerHTML = `
    <td class="row-index">${rowCount}</td>
    <td>
      <input type="text" class="item-desc-input" placeholder="Type spare part name or service..." value="${escapeHtml(desc)}" autocomplete="off">
    </td>
    <td>
      <input type="number" class="item-qty-input" min="1" step="1" value="${qty}">
    </td>
    <td>
      <input type="number" class="item-price-input" min="0" step="any" placeholder="0.00" value="${price !== '' ? price : ''}">
    </td>
    <td class="item-total-cell">
      ₹ ${formatIndianCurrency(lineTotal)}
    </td>
    <td class="no-print" style="text-align: center;">
      <button type="button" class="btn-delete-row" title="Delete Row">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </td>
  `;

  tbody.appendChild(tr);
  updateRowIndices();
  return tr;
}

function addPresetItem(name, price) {
  const tbody = document.getElementById('itemsTableBody');
  const rows = tbody.querySelectorAll('tr');

  for (const row of rows) {
    const descInput = row.querySelector('.item-desc-input');
    const priceInput = row.querySelector('.item-price-input');
    if (!descInput.value.trim() && (!priceInput.value || parseFloat(priceInput.value) === 0)) {
      descInput.value = name;
      priceInput.value = price;
      updateRowTotal(row);
      calculateTotals();
      showToast(`Added: ${name}`, 'info');
      return;
    }
  }

  const newRow = addNewRow(name, 1, price);
  updateRowTotal(newRow);
  calculateTotals();
  showToast(`Added: ${name}`, 'info');
}

function deleteRow(row) {
  const tbody = document.getElementById('itemsTableBody');
  if (tbody.children.length > 1) {
    row.remove();
    updateRowIndices();
    calculateTotals();
    showToast('Item removed', 'info');
  } else {
    row.querySelector('.item-desc-input').value = '';
    row.querySelector('.item-qty-input').value = 1;
    row.querySelector('.item-price-input').value = '';
    updateRowTotal(row);
    calculateTotals();
  }
}

function updateRowIndices() {
  const rows = document.querySelectorAll('#itemsTableBody tr');
  rows.forEach((row, idx) => {
    row.querySelector('.row-index').textContent = idx + 1;
  });
}

function updateRowTotal(row) {
  const qty = parseFloat(row.querySelector('.item-qty-input').value) || 0;
  const price = parseFloat(row.querySelector('.item-price-input').value) || 0;
  const total = qty * price;
  row.querySelector('.item-total-cell').textContent = `₹ ${formatIndianCurrency(total.toFixed(2))}`;
}

function calculateTotals() {
  const tbody = document.getElementById('itemsTableBody');
  const rows = tbody.querySelectorAll('tr');

  let subtotal = 0;
  let activeItemCount = 0;

  rows.forEach(row => {
    const desc = row.querySelector('.item-desc-input').value.trim();
    const qty = parseFloat(row.querySelector('.item-qty-input').value) || 0;
    const price = parseFloat(row.querySelector('.item-price-input').value) || 0;
    if (desc || price > 0) activeItemCount++;
    subtotal += (qty * price);
  });

  const discountInput = parseFloat(document.getElementById('discountValue').value) || 0;
  const discountType = document.getElementById('discountType').value;
  let discountAmount = 0;

  if (discountType === 'percent') {
    discountAmount = (subtotal * discountInput) / 100;
  } else {
    discountAmount = discountInput;
  }
  if (discountAmount > subtotal) discountAmount = subtotal;

  const afterDiscount = subtotal - discountAmount;
  const gstRate = parseFloat(document.getElementById('gstRate').value) || 0;
  const gstAmount = (afterDiscount * gstRate) / 100;

  const rawTotal = afterDiscount + gstAmount;
  const grandTotal = Math.round(rawTotal);
  const roundOff = grandTotal - rawTotal;

  document.getElementById('subtotalDisplay').textContent = `₹ ${formatIndianCurrency(subtotal.toFixed(2))}`;
  document.getElementById('discountDisplay').textContent = `- ₹ ${formatIndianCurrency(discountAmount.toFixed(2))}`;
  document.getElementById('gstDisplay').textContent = `+ ₹ ${formatIndianCurrency(gstAmount.toFixed(2))}`;
  document.getElementById('roundOffDisplay').textContent = `${roundOff >= 0 ? '+' : '-'} ₹ ${Math.abs(roundOff).toFixed(2)}`;
  document.getElementById('grandTotalDisplay').textContent = `₹ ${formatIndianCurrency(grandTotal.toFixed(2))}`;
  document.getElementById('upiAmountDisplay').textContent = `₹ ${formatIndianCurrency(grandTotal.toFixed(2))}`;

  document.getElementById('dockItemCount').textContent = activeItemCount;
  document.getElementById('dockTotal').textContent = `₹ ${formatIndianCurrency(grandTotal.toFixed(2))}`;
  document.getElementById('amountWordsDisplay').textContent = numberToIndianWords(grandTotal);

  // If a fixed QR is active, keep displaying it
  const savedFixedQr = localStorage.getItem('raj_fixed_qr_img');
  if (savedFixedQr) {
    applyFixedQrImage(savedFixedQr);
  } else {
    updateDynamicUpiQrCode(grandTotal);
  }
}

function updateDynamicUpiQrCode(amount) {
  const qrContainer = document.getElementById('dynamicQrCanvas');
  qrContainer.innerHTML = '';

  const invNo = document.getElementById('invoiceNumber').value.trim() || 'INV';
  const payeeName = appConfig.ownerName.trim();
  const upiId = appConfig.ownerUpi.trim();

  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Bill_' + invNo)}`;

  try {
    if (typeof QRCode !== 'undefined') {
      currentQrCodeInstance = new QRCode(qrContainer, {
        text: upiUri,
        width: 100,
        height: 100,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  } catch (err) {
    console.warn('QR Code generation notice:', err);
  }
}

/* ==========================================================================
   6. EXACT REQUESTED WHATSAPP BILL STRUCTURE (AS PER USER SCREENSHOT)
   ========================================================================== */
function buildWhatsAppMessage() {
  const invNo = document.getElementById('invoiceNumber').value.trim() || 'INV-2026-0001';
  const invDate = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
  const clientName = document.getElementById('clientName').value.trim();
  const clientPhone = document.getElementById('clientPhone').value.trim();
  const rawTotal = document.getElementById('grandTotalDisplay').textContent.replace('₹', '').trim();
  const cleanTotal = rawTotal.replace(/,/g, '');

  const items = [];
  document.querySelectorAll('#itemsTableBody tr').forEach(row => {
    const desc = row.querySelector('.item-desc-input').value.trim();
    const qty = parseFloat(row.querySelector('.item-qty-input').value) || 0;
    const price = parseFloat(row.querySelector('.item-price-input').value) || 0;
    if (desc && qty > 0) {
      items.push({
        desc,
        qty,
        price: price.toFixed(2),
        total: (qty * price).toFixed(2)
      });
    }
  });

  const formattedDate = formatDateDisplay(invDate);
  const lineDivider = '──────────────────────────';

  let msg = `🧾 *BILL / INVOICE: ${invNo}*\n`;
  msg += `${lineDivider}\n`;
  msg += `*FROM: ${appConfig.ownerName}*\n`;
  msg += `📞 *Contact:* +91 ${appConfig.ownerPhone}\n`;
  msg += `🏪 *Shop:* ${appConfig.shopName}\n`;
  msg += `📅 *Date:* ${formattedDate}\n`;
  if (clientName) {
    msg += `👤 *Customer:* ${clientName}\n`;
    if (clientPhone) {
      msg += `📱 *Phone:* +91 ${clientPhone}\n`;
    }
  }
  msg += `${lineDivider}\n`;

  msg += `*SPARE PARTS & SERVICES:*\n\n`;

  if (items.length === 0) {
    msg += `1. *General Service / Spares*\n   1 x ₹${rawTotal} = *₹${rawTotal}*\n\n`;
  } else {
    items.forEach((it, idx) => {
      msg += `${idx + 1}. *${it.desc}*\n`;
      msg += `   ${it.qty} x ₹${formatIndianCurrency(it.price)} = *₹${formatIndianCurrency(it.total)}*\n\n`;
    });
  }

  msg += `${lineDivider}\n`;
  msg += `💰 *TOTAL AMOUNT DUE: ₹${rawTotal}*\n`;
  msg += `${lineDivider}\n\n`;

  const upiLink = `upi://pay?pa=${appConfig.ownerUpi}&pn=${encodeURIComponent(appConfig.ownerName)}&am=${cleanTotal}&cu=INR&tn=Bill_${invNo}`;

  msg += `📲 *CLICK TO PAY DIRECTLY (GPay / PhonePe / Paytm):*\n`;
  msg += `${upiLink}\n\n`;

  msg += `💳 *Or Pay Manually to UPI ID:*\n`;
  msg += `👉 \`${appConfig.ownerUpi}\`\n\n`;

  msg += `Thank you for your business! Please let us know once paid. 🙏`;

  return msg;
}

function openWhatsAppModal() {
  const clientPhone = document.getElementById('clientPhone').value.trim();
  document.getElementById('waRecipientPhone').value = clientPhone;

  const msg = buildWhatsAppMessage();
  document.getElementById('waMessagePreview').value = msg;
  document.getElementById('modalWhatsApp').style.display = 'flex';
}

function closeWhatsAppModal() {
  document.getElementById('modalWhatsApp').style.display = 'none';
}

/**
 * Share with ANYONE: Opens WhatsApp with contact/group picker
 */
function shareToAnyoneWhatsApp() {
  const message = document.getElementById('waMessagePreview').value;
  const encodedText = encodeURIComponent(message);

  // Standard WhatsApp universal send link - opens chat picker to send to ANY contact or group
  const waUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

  window.open(waUrl, '_blank');
  closeWhatsAppModal();
  showToast('Opening WhatsApp contact picker...', 'success');
}

/**
 * Send directly to specific phone number (if entered) or fallback to universal picker
 */
function sendViaWhatsAppDirect() {
  let phone = document.getElementById('waRecipientPhone').value.trim().replace(/\D/g, '');

  if (!phone || phone.length < 10) {
    // If no specific phone is given, smoothly share to anyone!
    shareToAnyoneWhatsApp();
    return;
  }

  if (phone.length === 10) {
    phone = '91' + phone;
  }

  const message = document.getElementById('waMessagePreview').value;
  const encodedText = encodeURIComponent(message);
  const waUrl = `https://wa.me/${phone}?text=${encodedText}`;

  window.open(waUrl, '_blank');
  closeWhatsAppModal();
  showToast('Opening WhatsApp for +91 ' + phone.slice(-10), 'success');
}

function copyWhatsAppMessage() {
  const msgArea = document.getElementById('waMessagePreview');
  msgArea.select();
  navigator.clipboard.writeText(msgArea.value).then(() => {
    showToast('Bill text & UPI payment link copied!', 'success');
  });
}

function triggerPrint() {
  calculateTotals();
  window.print();
}

/* ==========================================================================
   7. INVOICE LIFECYCLE, REAL-TIME STATUS SYNC & STORAGE
   ========================================================================== */
function resetInvoiceForm() {
  if (!confirm('Start a new invoice? Current unsaved entries will be reset.')) {
    return;
  }

  document.getElementById('clientName').value = '';
  document.getElementById('clientPhone').value = '';
  document.getElementById('discountValue').value = 0;
  document.getElementById('gstRate').value = '0';
  document.getElementById('paymentStatus').value = 'Unpaid';
  const utrRefInput = document.getElementById('utrRefInput');
  if (utrRefInput) utrRefInput.value = '';
  syncStatusVisuals('Unpaid');

  const tbody = document.getElementById('itemsTableBody');
  tbody.innerHTML = '';
  addNewRow();

  invoiceCounter++;
  const padded = String(invoiceCounter).padStart(4, '0');
  document.getElementById('invoiceNumber').value = `${appConfig.invoicePrefix}${padded}`;
  document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];

  calculateTotals();
  showToast('New invoice ready!', 'info');
}

/**
 * Automatically updates or saves the current invoice with the specified status.
 * Ensures the invoice in localStorage is automatically updated from UNPAID to PAID.
 */
function updateCurrentInvoiceStatus(newStatus, utrNumber = null) {
  const statusSelect = document.getElementById('paymentStatus');
  if (statusSelect) {
    statusSelect.value = newStatus;
  }

  // Update visual indicators across invoice, dock, and UTR box
  syncStatusVisuals(newStatus, utrNumber);

  const invNo = document.getElementById('invoiceNumber').value.trim();
  const history = getSavedInvoices();
  const existingIdx = history.findIndex(h => h.invoiceNumber === invNo);

  if (existingIdx >= 0) {
    // Existing saved bill -> automatically update from UNPAID to PAID!
    const oldStatus = history[existingIdx].paymentStatus || 'Unpaid';
    history[existingIdx].paymentStatus = newStatus;
    if (newStatus === 'Paid') {
      history[existingIdx].paidAt = new Date().toISOString();
      if (utrNumber) {
        history[existingIdx].utrNumber = utrNumber;
      }
    } else if (newStatus === 'Unpaid') {
      delete history[existingIdx].paidAt;
      delete history[existingIdx].utrNumber;
    }
    history[existingIdx].timestamp = new Date().toISOString();
    localStorage.setItem('raj_billing_invoices', JSON.stringify(history));

    updateHistoryCounter();
    updateHistoryFilterCounts();

    showToast(`✅ Saved Bill ${invNo} automatically updated from ${oldStatus} to ${newStatus.toUpperCase()}!`, 'success');
  } else {
    // Not yet saved -> automatically save it into history as Paid / current status!
    saveCurrentInvoice(true);
    showToast(`✅ Bill ${invNo} saved & automatically updated to ${newStatus.toUpperCase()}!`, 'success');
  }

  // If History modal is open, refresh table live
  const modalHistory = document.getElementById('modalHistory');
  if (modalHistory && modalHistory.style.display === 'flex') {
    const searchVal = document.getElementById('searchHistoryInput')?.value || '';
    renderHistoryTable(searchVal);
  }
}

/**
 * Updates all visual status badges and buttons across the screen
 */
function syncStatusVisuals(status, utrNumber = null) {
  const isPaid = (status === 'Paid');

  // 1. Meta status button
  const btnQuick = document.getElementById('btnQuickPaidToggle');
  if (btnQuick) {
    if (isPaid) {
      btnQuick.textContent = '✅ Paid';
      btnQuick.classList.add('is-paid');
      btnQuick.title = 'Bill is PAID. Click to toggle back to Unpaid if needed.';
    } else {
      btnQuick.textContent = '✅ Mark Paid';
      btnQuick.classList.remove('is-paid');
      btnQuick.title = 'Click to immediately mark as PAID and automatically update in saved bills';
    }
  }

  // 2. Dock Badge & Button
  const dockBadge = document.getElementById('dockStatusBadge');
  const btnDock = document.getElementById('btnDockTogglePaid');
  if (dockBadge) {
    dockBadge.className = `dock-status-badge ${status.toLowerCase()}`;
    dockBadge.textContent = isPaid ? '✅ Paid' : (status === 'Partial' ? '⚠️ Partial' : '⏳ Unpaid');
  }
  if (btnDock) {
    if (isPaid) {
      btnDock.textContent = '✅ Paid';
      btnDock.classList.add('is-paid');
    } else {
      btnDock.textContent = '✅ Mark Paid';
      btnDock.classList.remove('is-paid');
    }
  }

  // 3. Payment UTR box status & banner
  const utrBadge = document.getElementById('utrStatusBadge');
  const utrBanner = document.getElementById('utrSuccessBanner');
  if (utrBadge) {
    utrBadge.className = `utr-status-badge ${status.toLowerCase()}`;
    utrBadge.textContent = isPaid ? '✅ PAID' : (status === 'Partial' ? '⚠️ PARTIAL' : '⏳ UNPAID');
  }
  if (utrBanner) {
    if (isPaid) {
      utrBanner.style.display = 'block';
      if (utrNumber) {
        utrBanner.innerHTML = `🎉 <strong>Payment Confirmed & Verified!</strong> UTR / Ref: <code>${escapeHtml(utrNumber)}</code>. Saved invoice automatically updated to <strong>PAID</strong>.`;
      } else {
        utrBanner.innerHTML = `🎉 <strong>Payment Confirmed!</strong> Saved bill automatically updated to <strong>PAID</strong> in records.`;
      }
    } else {
      utrBanner.style.display = 'none';
    }
  }
}

/**
 * 1-Click update directly from the Saved Invoices History table row
 */
window.quickMarkInvoicePaid = function (invId, newStatus = 'Paid') {
  const history = getSavedInvoices();
  const inv = history.find(h => h.id === invId);
  if (!inv) return;

  const oldStatus = inv.paymentStatus || 'Unpaid';
  inv.paymentStatus = newStatus;
  if (newStatus === 'Paid') {
    inv.paidAt = new Date().toISOString();
  } else {
    delete inv.paidAt;
    delete inv.utrNumber;
  }
  localStorage.setItem('raj_billing_invoices', JSON.stringify(history));

  // If this invoice happens to be currently loaded on the screen, update the screen UI too!
  const currentScreenInv = document.getElementById('invoiceNumber').value.trim();
  if (currentScreenInv === inv.invoiceNumber) {
    document.getElementById('paymentStatus').value = newStatus;
    syncStatusVisuals(newStatus, inv.utrNumber || null);
  }

  updateHistoryCounter();
  updateHistoryFilterCounts();
  const searchVal = document.getElementById('searchHistoryInput')?.value || '';
  renderHistoryTable(searchVal);

  showToast(`✅ Invoice ${inv.invoiceNumber} automatically updated from ${oldStatus} to ${newStatus.toUpperCase()}!`, 'success');
};

function saveCurrentInvoice(silent = false) {
  const clientName = document.getElementById('clientName').value.trim() || 'Counter Sale / Customer';
  const clientPhone = document.getElementById('clientPhone').value.trim();
  const invNo = document.getElementById('invoiceNumber').value.trim();
  const invDate = document.getElementById('invoiceDate').value;
  const grandTotal = document.getElementById('grandTotalDisplay').textContent.replace('₹', '').trim();
  const status = document.getElementById('paymentStatus').value;
  const utrInput = document.getElementById('utrRefInput');
  const utrNumber = utrInput ? utrInput.value.trim() : '';

  const items = [];
  document.querySelectorAll('#itemsTableBody tr').forEach(row => {
    const desc = row.querySelector('.item-desc-input').value.trim();
    const qty = parseFloat(row.querySelector('.item-qty-input').value) || 0;
    const price = parseFloat(row.querySelector('.item-price-input').value) || 0;
    if (desc || price > 0) {
      items.push({ desc, qty, price });
    }
  });

  const history = getSavedInvoices();
  const existingIdx = history.findIndex(h => h.invoiceNumber === invNo);

  const invoiceRecord = {
    id: existingIdx >= 0 ? history[existingIdx].id : ('inv_' + Date.now()),
    invoiceNumber: invNo,
    date: invDate,
    clientName,
    clientPhone,
    items,
    discountValue: document.getElementById('discountValue').value,
    discountType: document.getElementById('discountType').value,
    gstRate: document.getElementById('gstRate').value,
    paymentStatus: status,
    utrNumber: utrNumber || (existingIdx >= 0 ? history[existingIdx].utrNumber : ''),
    paidAt: status === 'Paid' ? (existingIdx >= 0 && history[existingIdx].paidAt ? history[existingIdx].paidAt : new Date().toISOString()) : null,
    total: grandTotal,
    timestamp: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    history[existingIdx] = invoiceRecord;
  } else {
    history.unshift(invoiceRecord);
  }

  localStorage.setItem('raj_billing_invoices', JSON.stringify(history));
  updateHistoryCounter();
  updateHistoryFilterCounts();

  if (!silent) {
    showToast(`Invoice ${invNo} saved to your records!`, 'success');
  }
}

function getSavedInvoices() {
  const raw = localStorage.getItem('raj_billing_invoices');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function updateHistoryCounter() {
  const history = getSavedInvoices();
  const counterEl = document.getElementById('historyCount');
  if (counterEl) {
    counterEl.textContent = history.length;
  }
}

function updateHistoryFilterCounts() {
  const history = getSavedInvoices();
  const allCount = history.length;
  const paidCount = history.filter(h => h.paymentStatus && h.paymentStatus.toLowerCase() === 'paid').length;
  const unpaidCount = allCount - paidCount;

  const countAll = document.getElementById('countHistAll');
  const countUnpaid = document.getElementById('countHistUnpaid');
  const countPaid = document.getElementById('countHistPaid');

  if (countAll) countAll.textContent = allCount;
  if (countUnpaid) countUnpaid.textContent = unpaidCount;
  if (countPaid) countPaid.textContent = paidCount;
}

function openHistoryModal() {
  const searchVal = document.getElementById('searchHistoryInput')?.value || '';
  renderHistoryTable(searchVal);
  document.getElementById('modalHistory').style.display = 'flex';
}

function closeHistoryModal() {
  document.getElementById('modalHistory').style.display = 'none';
}

function renderHistoryTable(filterText = '') {
  const history = getSavedInvoices();
  const tbody = document.getElementById('historyTableBody');
  const emptyMsg = document.getElementById('emptyHistoryMsg');
  tbody.innerHTML = '';

  updateHistoryFilterCounts();

  const query = filterText.toLowerCase().trim();
  const filtered = history.filter(inv => {
    // Text search query
    const matchesQuery = (
      inv.invoiceNumber.toLowerCase().includes(query) ||
      (inv.clientName && inv.clientName.toLowerCase().includes(query)) ||
      (inv.clientPhone && inv.clientPhone.includes(query))
    );
    if (!matchesQuery) return false;

    // Filter tab
    const isPaid = (inv.paymentStatus && inv.paymentStatus.toLowerCase() === 'paid');
    if (currentHistoryFilter === 'unpaid') return !isPaid;
    if (currentHistoryFilter === 'paid') return isPaid;
    return true;
  });

  if (filtered.length === 0) {
    emptyMsg.style.display = 'block';
    emptyMsg.textContent = history.length === 0
      ? 'No saved bills found. Click "Save Bill" on any invoice to store it here.'
      : 'No bills match the selected filter or search query.';
    return;
  }
  emptyMsg.style.display = 'none';

  filtered.forEach(inv => {
    const isPaid = (inv.paymentStatus && inv.paymentStatus.toLowerCase() === 'paid');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(inv.invoiceNumber)}</strong></td>
      <td>${formatDateDisplay(inv.date)}</td>
      <td>${escapeHtml(inv.clientName)}</td>
      <td>${escapeHtml(inv.clientPhone || '-')}</td>
      <td><strong>₹ ${inv.total}</strong></td>
      <td>
        <span class="status-badge ${isPaid ? 'paid' : 'unpaid'}">
          ${isPaid ? '✅ Paid' : '⏳ Unpaid'}
        </span>
        ${inv.utrNumber ? `<div style="font-size: 0.68rem; color: #64748b; font-family: monospace;">UTR: ${escapeHtml(inv.utrNumber)}</div>` : ''}
      </td>
      <td>
        <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
          ${isPaid
        ? `<button type="button" class="btn-table-revert-unpaid" onclick="quickMarkInvoicePaid('${inv.id}', 'Unpaid')" title="Click to revert to Unpaid">🔄 Unpaid</button>`
        : `<button type="button" class="btn-table-mark-paid" onclick="quickMarkInvoicePaid('${inv.id}', 'Paid')" title="Client paid? Click to immediately update status to PAID">✅ Mark Paid</button>`
      }
          <button type="button" class="btn btn-secondary btn-sm" onclick="loadSavedInvoice('${inv.id}')" style="padding: 0.22rem 0.5rem; font-size: 0.72rem;">
            Load Bill
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterHistoryList(e) {
  renderHistoryTable(e.target.value);
}

window.loadSavedInvoice = function (invId) {
  const history = getSavedInvoices();
  const inv = history.find(h => h.id === invId);
  if (!inv) return;

  document.getElementById('invoiceNumber').value = inv.invoiceNumber;
  document.getElementById('invoiceDate').value = inv.date;
  document.getElementById('clientName').value = inv.clientName || '';
  document.getElementById('clientPhone').value = inv.clientPhone || '';
  document.getElementById('discountValue').value = inv.discountValue || 0;
  document.getElementById('discountType').value = inv.discountType || 'flat';
  document.getElementById('gstRate').value = inv.gstRate || '0';
  document.getElementById('paymentStatus').value = inv.paymentStatus || 'Unpaid';

  const utrRefInput = document.getElementById('utrRefInput');
  if (utrRefInput) {
    utrRefInput.value = inv.utrNumber || '';
  }
  syncStatusVisuals(inv.paymentStatus || 'Unpaid', inv.utrNumber || null);

  const tbody = document.getElementById('itemsTableBody');
  tbody.innerHTML = '';

  if (inv.items && inv.items.length > 0) {
    inv.items.forEach(it => {
      addNewRow(it.desc, it.qty, it.price);
    });
  } else {
    addNewRow();
  }

  calculateTotals();
  closeHistoryModal();
  showToast(`Loaded invoice: ${inv.invoiceNumber} (${inv.paymentStatus || 'Unpaid'})`, 'info');
};

function clearAllHistory() {
  if (confirm('Delete all saved invoices history permanently?')) {
    localStorage.removeItem('raj_billing_invoices');
    updateHistoryCounter();
    updateHistoryFilterCounts();
    renderHistoryTable();
    showToast('Invoice history cleared', 'info');
  }
}

/* ==========================================================================
   8. SETTINGS MODAL
   ========================================================================== */
function openSettingsModal() {
  applyConfigToUI();
  document.getElementById('modalSettings').style.display = 'flex';
}

function closeSettingsModal() {
  document.getElementById('modalSettings').style.display = 'none';
}

function saveSettingsFromModal() {
  appConfig.ownerName = document.getElementById('cfgOwnerName').value.trim() || DEFAULT_CONFIG.ownerName;
  appConfig.ownerPhone = document.getElementById('cfgOwnerPhone').value.trim() || DEFAULT_CONFIG.ownerPhone;
  appConfig.ownerUpi = document.getElementById('cfgOwnerUpi').value.trim() || DEFAULT_CONFIG.ownerUpi;
  appConfig.shopName = document.getElementById('cfgShopName').value.trim() || DEFAULT_CONFIG.shopName;
  appConfig.shopTagline = document.getElementById('cfgShopTagline').value.trim() || DEFAULT_CONFIG.shopTagline;
  appConfig.shopAddress = document.getElementById('cfgShopAddress').value.trim() || DEFAULT_CONFIG.shopAddress;
  appConfig.invoicePrefix = document.getElementById('cfgInvoicePrefix').value.trim() || DEFAULT_CONFIG.invoicePrefix;

  localStorage.setItem('raj_billing_config', JSON.stringify(appConfig));
  applyConfigToUI();
  calculateTotals();
  closeSettingsModal();
  showToast('Settings saved successfully!', 'success');
}

function resetSettingsToDefault() {
  if (confirm('Reset settings to default configuration?')) {
    appConfig = { ...DEFAULT_CONFIG };
    localStorage.removeItem('raj_billing_config');
    applyConfigToUI();
    calculateTotals();
    showToast('Reset to default settings', 'info');
  }
}

/* ==========================================================================
   9. UTILITIES
   ========================================================================== */
function numberToIndianWords(amount) {
  if (amount === 0) return 'Zero Rupees Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(num) {
    let str = '';
    if (num >= 100) {
      str += units[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 10 && num <= 19) {
      str += teens[num - 10] + ' ';
    } else if (num >= 20) {
      str += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
      if (num > 0) {
        str += units[num] + ' ';
      }
    } else if (num > 0) {
      str += units[num] + ' ';
    }
    return str.trim();
  }

  let crore = Math.floor(amount / 10000000);
  amount %= 10000000;
  let lakh = Math.floor(amount / 100000);
  amount %= 100000;
  let thousand = Math.floor(amount / 1000);
  amount %= 1000;
  let remainder = amount;

  let words = '';
  if (crore > 0) words += convertChunk(crore) + ' Crore ';
  if (lakh > 0) words += convertChunk(lakh) + ' Lakh ';
  if (thousand > 0) words += convertChunk(thousand) + ' Thousand ';
  if (remainder > 0) words += convertChunk(remainder) + ' ';

  return words.trim() + ' Rupees Only';
}

function formatIndianCurrency(numStr) {
  let [intPart, decPart] = numStr.toString().split('.');
  if (!decPart) decPart = '00';
  if (decPart.length === 1) decPart += '0';

  let lastThree = intPart.substring(intPart.length - 3);
  let otherNumbers = intPart.substring(0, intPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  let res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return `${res}.${decPart}`;
}

function formatDateDisplay(isoDateStr) {
  if (!isoDateStr) return '';
  const parts = isoDateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return isoDateStr;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
