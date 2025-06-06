// هذا هو محتوى ملف script.js
// تم نقل جميع أكواد JavaScript من وسم <script> في ملف HTML إلى هنا

// عناصر DOM
const fromAmount = document.getElementById('fromAmount');
const toAmount = document.getElementById('toAmount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const swapBtn = document.getElementById('swapBtn');
const resultRate = document.getElementById('resultRate');
const resultInfo = document.getElementById('resultInfo');
const nextUpdateCountdown = document.getElementById('nextUpdateCountdown'); 

let countdownInterval; 
const updateInterval = 10 * 60; // 10 دقائق بالثواني (600 ثانية)

// مفتاح API الخاص بك من ExchangeRate-API.com
const API_KEY = '2ff7b375d7e512cc78edd4c5'; 
const BASE_API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;

// دالة لتحديث نص العداد
function updateCountdownDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    nextUpdateCountdown.textContent = `Next update in: ${minutes}m ${formattedSeconds}s`;
}

// دالة لبدء العداد
function startCountdown() {
    let timeLeft = updateInterval; 

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    updateCountdownDisplay(timeLeft); 

    countdownInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(countdownInterval);
            nextUpdateCountdown.textContent = 'Updating now...';
            convertCurrency(); // إعادة جلب البيانات
        } else {
            updateCountdownDisplay(timeLeft);
        }
    }, 1000); // تحديث كل ثانية
}

// دالة لجلب أسعار الصرف من API
async function fetchExchangeRates(baseCurrency) {
    try {
        resultRate.innerHTML = '<span class="loading-spinner"></span>';
        resultInfo.textContent = 'Fetching latest exchange rates...'; 
        nextUpdateCountdown.textContent = ''; // إخفاء العداد أثناء الجلب

        const response = await fetch(BASE_API_URL + baseCurrency);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error fetching data: ${errorData['error-type'] || response.statusText}`);
        }

        const data = await response.json();

        if (data.result === 'success') {
            startCountdown(); // بدء العداد بعد الجلب الناجح
            return data.conversion_rates;
        } else {
            throw new Error(`API failed: ${data['error-type']}`);
        }
    } catch (error) {
        console.error("Error fetching exchange rates:", error);
        resultRate.textContent = 'Error!';
        resultInfo.textContent = `Could not fetch rates: ${error.message}`;
        nextUpdateCountdown.textContent = ''; 
        return null;
    }
}

// دالة التحويل (مع تحديث لجلب الأسعار ديناميكيًا)
async function convertCurrency() {
    const amount = parseFloat(fromAmount.value) || 0;
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (amount === 0) {
        toAmount.value = '';
        resultRate.textContent = '0.00';
        resultInfo.textContent = 'Enter amount to convert'; 
        nextUpdateCountdown.textContent = ''; 
        return;
    }

    const rates = await fetchExchangeRates(from);

    if (!rates) {
        toAmount.value = '';
        return;
    }

    let rate = rates[to];

    if (rate === undefined) {
        resultRate.textContent = 'N/A'; 
        resultInfo.textContent = 'No exchange data available for these currencies.'; 
        toAmount.value = '';
        nextUpdateCountdown.textContent = ''; 
        return;
    }

    const result = amount * rate;
    toAmount.value = result.toFixed(4);
    resultRate.textContent = `1 ${from} = ${rate.toFixed(2)} ${to}`; 
    resultInfo.textContent = `Last updated: ${new Date().toLocaleTimeString('en-US')}`; 
}

// دالة التبديل
function swapCurrencies() {
    const tempCurrency = fromCurrency.value;
    const tempAmount = fromAmount.value;
    
    fromCurrency.value = toCurrency.value;
    toCurrency.value = tempCurrency;
    
    if (toAmount.value && parseFloat(toAmount.value) !== 0) { 
        fromAmount.value = toAmount.value;
    } else {
        fromAmount.value = '1'; 
    }
    
    convertCurrency();
}

// ربط الأحداث
fromAmount.addEventListener('input', convertCurrency);
fromCurrency.addEventListener('change', convertCurrency);
toCurrency.addEventListener('change', convertCurrency);
swapBtn.addEventListener('click', swapCurrencies);

// تحويل أولي عند تحميل الصفحة
setTimeout(() => {
    convertCurrency();
}, 500);

// دعم لوحة المفاتيح
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault(); 
        swapCurrencies();
    }
});
