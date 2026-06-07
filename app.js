/* ==========================================================================
   TORATHAT SERVICE SOLAR - INTERACTIVE BEHAVIOR & CALCULATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSpotlightEffect();
    initCalculator();
    initContactModal();
});

/**
 * 1. Navigation & Scroll Effects
 */
function initNavigation() {
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Header scroll background toggle
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu on clicking link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

/**
 * 2. Premium Spotlight Hover Effect
 * Moves background glow inside cards relative to cursor position
 */
function initSpotlightEffect() {
    const cards = document.querySelectorAll('.card, .calculator-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
}

/**
 * 3. Interactive Solar ROI Calculator
 */
function initCalculator() {
    const billRange = document.getElementById('billRange');
    if (!billRange) return;
    const billNumber = document.getElementById('billNumber');
    const profileBtns = document.querySelectorAll('.profile-btn');
    
    // Outputs
    const systemSizeEl = document.getElementById('systemSize');
    const monthlySavingsEl = document.getElementById('monthlySavings');
    const yearlySavingsEl = document.getElementById('yearlySavings');
    const paybackPeriodEl = document.getElementById('paybackPeriod');
    const lifetimeSavingsEl = document.getElementById('lifetimeSavings');
    const carbonOffsetEl = document.getElementById('carbonOffset');
    const treesPlantedEl = document.getElementById('treesPlanted');

    let currentProfile = 'residential';
    let monthlyBill = 12000;

    // Profile details
    const profiles = {
        residential: {
            dayUsageRatio: 0.38,
            selfConsumption: 0.85,
            costPerKw: 38000
        },
        orchard: {
            dayUsageRatio: 0.65,
            selfConsumption: 0.92,
            costPerKw: 33000
        },
        business: {
            dayUsageRatio: 0.85,
            selfConsumption: 0.98,
            costPerKw: 29000
        }
    };

    // Calculate outputs
    function calculate() {
        const p = profiles[currentProfile];
        const tariff = 4.7; // THB per kWh average
        
        // Est. monthly consumption in kWh
        const monthlyKwh = monthlyBill / tariff;
        
        // Est. solar production hours per month in Chanthaburi
        const sunHoursPerMonth = 115; 
        
        // Calculated system size (kWp) needed to cover daytime usage
        let calculatedSize = (monthlyKwh * p.dayUsageRatio) / sunHoursPerMonth;
        
        // Bound sizes reasonably
        if (calculatedSize < 1.5) calculatedSize = 1.5;
        if (calculatedSize > 150) calculatedSize = 150;
        
        // Clean formatting for system size
        let systemSize = Math.round(calculatedSize * 10) / 10;
        
        // Monthly Savings: System size * production * tariff * consumption rate
        let estSavings = systemSize * sunHoursPerMonth * tariff * p.selfConsumption;
        
        // Capped by realistic profile maximums of bill
        const maxSavingsRatio = currentProfile === 'residential' ? 0.70 : currentProfile === 'orchard' ? 0.82 : 0.90;
        if (estSavings > (monthlyBill * maxSavingsRatio)) {
            estSavings = monthlyBill * maxSavingsRatio;
        }
        
        const monthlySavings = Math.round(estSavings);
        const yearlySavings = monthlySavings * 12;
        
        // Cost calculations
        const totalCost = systemSize * p.costPerKw;
        
        // Payback period
        let payback = totalCost / (monthlySavings * 12);
        if (payback < 3.5) payback = 3.5;
        if (payback > 7.5) payback = 7.5;
        const paybackPeriod = Math.round(payback * 10) / 10;
        
        // Lifetime savings (25 Years)
        // Taking 25 years savings minus initial cost
        const lifetimeSavingsVal = (monthlySavings * 12 * 25 * 0.88) - totalCost;
        const lifetimeSavingsMillions = Math.round((lifetimeSavingsVal / 1000000) * 100) / 100;
        
        // CO2 Offset: 1 kWp offsets approx 0.76 tons CO2/year
        const carbonOffsetVal = systemSize * 0.76;
        const carbonOffset = Math.round(carbonOffsetVal * 10) / 10;
        const treesPlanted = Math.round(carbonOffset * 100);

        // Update DOM
        systemSizeEl.innerHTML = `${systemSize.toLocaleString('th-TH')} <span class="unit">kWp</span>`;
        monthlySavingsEl.innerHTML = `${monthlySavings.toLocaleString('th-TH')} <span class="unit">บาท</span>`;
        yearlySavingsEl.innerHTML = yearlySavings.toLocaleString('th-TH');
        paybackPeriodEl.innerHTML = `${paybackPeriod.toLocaleString('th-TH')} <span class="unit">ปี</span>`;
        
        if (lifetimeSavingsMillions > 0) {
            lifetimeSavingsEl.innerHTML = `${lifetimeSavingsMillions.toLocaleString('th-TH')} <span class="unit">ล้านบาท</span>`;
        } else {
            lifetimeSavingsEl.innerHTML = `${Math.round(lifetimeSavingsVal).toLocaleString('th-TH')} <span class="unit">บาท</span>`;
        }
        
        carbonOffsetEl.textContent = carbonOffset.toLocaleString('th-TH');
        treesPlantedEl.textContent = treesPlanted.toLocaleString('th-TH');
    }

    // Event listeners for profile selection
    profileBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            profileBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentProfile = btn.getAttribute('data-profile');
            
            // Adjust slider ranges and defaults based on profile
            if (currentProfile === 'residential') {
                billRange.min = 3000;
                billRange.max = 30000;
                if (monthlyBill < 3000) monthlyBill = 3000;
                if (monthlyBill > 30000) monthlyBill = 12000;
            } else if (currentProfile === 'orchard') {
                billRange.min = 5000;
                billRange.max = 80000;
                if (monthlyBill < 5000) monthlyBill = 15000;
                if (monthlyBill > 80000) monthlyBill = 35000;
            } else {
                billRange.min = 15000;
                billRange.max = 250000;
                if (monthlyBill < 15000) monthlyBill = 55000;
            }
            
            billRange.value = monthlyBill;
            billNumber.value = monthlyBill;
            calculate();
        });
    });

    // Slider inputs syncing
    billRange.addEventListener('input', (e) => {
        monthlyBill = parseInt(e.target.value);
        billNumber.value = monthlyBill;
        calculate();
    });

    billNumber.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        const min = parseInt(billRange.min);
        const max = parseInt(billRange.max);
        
        if (isNaN(val) || val < min) val = min;
        if (val > max) val = max;
        
        monthlyBill = val;
        billNumber.value = val;
        billRange.value = val;
        calculate();
    });

    // Run initial calculation
    calculate();
}

/**
 * 4. Modal Dialog Handlers (Lead Capture Form)
 */
function initContactModal() {
    const modal = document.getElementById('contactModal');
    const modalClose = document.getElementById('modalClose');
    const calcCtaBtn = document.getElementById('calcCtaBtn');
    const heroCtaBtn = document.querySelector('.hero-actions-group .btn-primary');
    const navCtaBtn = document.querySelector('.header-actions .btn-primary');
    const leadForm = document.getElementById('leadForm');
    const formSuccess = document.getElementById('formSuccess');
    const estBillText = document.getElementById('estBillText');
    const billNumber = document.getElementById('billNumber');

    // Open Modal
    function openModal() {
        if (modal) {
            // Pre-fill bill estimate inside modal
            if (estBillText && billNumber) {
                estBillText.value = `${parseInt(billNumber.value).toLocaleString('th-TH')} บาท/เดือน`;
            }
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock background scroll
        }
    }

    // Close Modal
    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            // Reset success msg state
            setTimeout(() => {
                formSuccess.classList.remove('active');
                leadForm.style.display = 'block';
                leadForm.reset();
            }, 300);
        }
    }

    if (calcCtaBtn) calcCtaBtn.addEventListener('click', openModal);
    if (heroCtaBtn) heroCtaBtn.addEventListener('click', (e) => {
        // Only open modal if clicked, otherwise let normal anchor scroll work
        // e.preventDefault();
        // openModal();
    });
    if (navCtaBtn) navCtaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    // Pricing package CTA listeners
    const packageCtaBtns = document.querySelectorAll('.open-survey-modal');
    packageCtaBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const pkgCard = btn.closest('.pricing-card');
            const pkgName = pkgCard ? pkgCard.querySelector('h3').textContent : '';
            const notesEl = document.getElementById('notes');
            if (notesEl) {
                if (pkgName) {
                    notesEl.value = `สนใจนัดสำรวจหน้างานจริงสำหรับ: ${pkgName}`;
                } else {
                    notesEl.value = 'สนใจปรึกษาผู้เชี่ยวชาญเรื่องการติดตั้งโซล่าเซลล์ / นัดสำรวจหน้างานจริง';
                }
            }
            openModal();
        });
    });

    if (modalClose) modalClose.addEventListener('click', closeModal);
    
    // Close modal when clicking background
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Lead Form Submit Handler
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect info (simulate API dispatch)
            const clientName = document.getElementById('clientName').value;
            const clientPhone = document.getElementById('clientPhone').value;
            const clientLocation = document.getElementById('clientLocation').value;
            const estBill = estBillText ? estBillText.value : '';
            const notes = document.getElementById('notes').value;
            
            console.log('Lead registration captured:', {
                clientName,
                clientPhone,
                clientLocation,
                estBill,
                notes,
                timestamp: new Date().toISOString()
            });

            // Transition states to Success
            leadForm.style.display = 'none';
            formSuccess.classList.add('active');
        });
    }

    // Footer Lead Form Capture
    const footerForm = document.getElementById('footerLeadForm');
    if (footerForm) {
        footerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const footerPhone = document.getElementById('footerPhone').value;
            alert(`ขอบคุณค่ะ เจ้าหน้าที่จะโทรติดต่อกลับที่เบอร์ ${footerPhone} ในวันทำการถัดไป`);
            footerForm.reset();
        });
    }
}
