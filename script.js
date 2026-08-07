document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('labelForm');
    const labelsGrid = document.getElementById('labelsGrid');
    const clearBtn = document.getElementById('clearBtn');
    const barcodeInput = document.getElementById('productBarcode');
    const nameInput = document.getElementById('productName');
    const priceInput = document.getElementById('productPrice');
    const logoInput = document.getElementById('logoInput');
    const resetLogoBtn = document.getElementById('resetLogoBtn');
    const mainHeaderLogo = document.getElementById('mainHeaderLogo');
    
    let labelIdCounter = 0;
    const DEFAULT_LOGO = 'logo.png';
    let currentLogoUrl = localStorage.getItem('custom_label_logo') || DEFAULT_LOGO;

    // Inicializa exibição da logo salva
    function updateLogoUI() {
        if (currentLogoUrl !== DEFAULT_LOGO) {
            mainHeaderLogo.src = currentLogoUrl;
            resetLogoBtn.style.display = 'inline-block';
        } else {
            mainHeaderLogo.src = DEFAULT_LOGO;
            resetLogoBtn.style.display = 'none';
        }
    }
    updateLogoUI();

    // Upload de logo personalizada pelo usuário
    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                currentLogoUrl = evt.target.result;
                localStorage.setItem('custom_label_logo', currentLogoUrl);
                updateLogoUI();
            };
            reader.readAsDataURL(file);
        }
    });

    // Restaurar logo padrão
    resetLogoBtn.addEventListener('click', () => {
        localStorage.removeItem('custom_label_logo');
        currentLogoUrl = DEFAULT_LOGO;
        logoInput.value = '';
        updateLogoUI();
    });

    // Selecionar todo o texto ao focar no campo de código de barras para facilitar novos bips
    barcodeInput.addEventListener('focus', () => {
        barcodeInput.select();
    });

    // Suporte a leitor/bipador de código de barras
    barcodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const barcodeVal = barcodeInput.value.trim();
            if (!barcodeVal) return;

            // Se o nome do produto não estiver preenchido, vai para o nome
            if (!nameInput.value.trim()) {
                e.preventDefault();
                nameInput.focus();
            } else if (!priceInput.value.trim()) {
                // Se o preço não estiver preenchido, vai para o preço
                e.preventDefault();
                priceInput.focus();
            }
            // Se tudo já estiver preenchido, o envio do formulário ocorre normalmente
        }
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const desc = document.getElementById('productDescription').value.trim();
        const price = parseFloat(priceInput.value).toFixed(2);
        const barcode = barcodeInput.value.trim();
        
        addLabel(name, desc, price, barcode);
        form.reset();
        barcodeInput.focus();
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar todas as etiquetas?')) {
            labelsGrid.innerHTML = '';
        }
    });

    function addLabel(name, desc, price, barcodeValue) {
        labelIdCounter++;
        const currentId = `barcode-${labelIdCounter}`;
        
        const priceFormatted = price.replace('.', ',');

        const labelEl = document.createElement('div');
        labelEl.className = 'label-item';
        
        const logoHTML = currentLogoUrl ? `<img src="${currentLogoUrl}" class="label-header-logo" alt="Logo">` : '';

        labelEl.innerHTML = `
            <button class="label-delete no-print" onclick="this.parentElement.remove()" title="Remover">&times;</button>
            <div class="label-header">
                ${logoHTML}
                <span>Rio Branco Festas</span>
            </div>
            <div class="label-title">${name}</div>
            <div class="label-desc">${desc}</div>
            <div class="label-price"><span>R$</span> ${priceFormatted}</div>
            <svg id="${currentId}" class="label-barcode"></svg>
        `;
        
        labelsGrid.appendChild(labelEl);
        
        // Limpa e valida o valor do código
        const cleanCode = String(barcodeValue).trim();
        
        // Determina formato ideal (EAN-13, EAN-8 ou CODE128)
        let format = "CODE128";
        if (/^\d{13}$/.test(cleanCode)) {
            format = "EAN13";
        } else if (/^\d{8}$/.test(cleanCode)) {
            format = "EAN8";
        }

        const barcodeOptions = {
            format: format,
            lineColor: "#000000",
            background: "#ffffff",
            width: 1.5,
            height: 26,
            displayValue: true,
            fontSize: 10,
            margin: 8 // Margem essencial (quiet zone) para o bipador ler com facilidade
        };

        try {
            JsBarcode(`#${currentId}`, cleanCode, barcodeOptions);
        } catch (error) {
            // Se falhar o dígito verificador do EAN13, faz fallback para CODE128 universal
            try {
                barcodeOptions.format = "CODE128";
                JsBarcode(`#${currentId}`, cleanCode, barcodeOptions);
            } catch (errFallback) {
                console.error('Erro ao gerar código de barras', errFallback);
                const svgContainer = document.getElementById(currentId);
                if (svgContainer) {
                    svgContainer.outerHTML = `<div style="color:red; font-size: 11px; margin-top: 5px;">Código inválido</div>`;
                }
            }
        }
    }
});


