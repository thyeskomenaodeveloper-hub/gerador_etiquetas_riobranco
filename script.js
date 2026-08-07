document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('labelForm');
    const labelsGrid = document.getElementById('labelsGrid');
    const clearBtn = document.getElementById('clearBtn');
    
    let labelIdCounter = 0;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('productName').value;
        const desc = document.getElementById('productDescription').value;
        const price = parseFloat(document.getElementById('productPrice').value).toFixed(2);
        const barcode = document.getElementById('productBarcode').value;
        
        addLabel(name, desc, price, barcode);
        form.reset();
        document.getElementById('productName').focus();
    });

    clearBtn.addEventListener('click', () => {
        if(confirm('Tem certeza que deseja limpar todas as etiquetas?')) {
            labelsGrid.innerHTML = '';
        }
    });

    function addLabel(name, desc, price, barcodeValue) {
        labelIdCounter++;
        const currentId = `barcode-${labelIdCounter}`;
        
        const priceFormatted = price.replace('.', ',');

        const labelEl = document.createElement('div');
        labelEl.className = 'label-item';
        
        labelEl.innerHTML = `
            <button class="label-delete no-print" onclick="this.parentElement.remove()" title="Remover">&times;</button>
            <div class="label-header">Rio Branco Festas e Embalagens</div>
            <div class="label-title">${name}</div>
            <div class="label-desc">${desc}</div>
            <div class="label-price"><span>R$</span> ${priceFormatted}</div>
            <svg id="${currentId}" class="label-barcode"></svg>
        `;
        
        labelsGrid.appendChild(labelEl);
        
        try {
            JsBarcode(`#${currentId}`, barcodeValue, {
                format: "CODE128",
                lineColor: "#000",
                width: 1.5,
                height: 25,
                displayValue: true,
                fontSize: 10,
                margin: 0
            });
        } catch (error) {
            console.error('Erro ao gerar código de barras', error);
            document.getElementById(currentId).outerHTML = `<div style="color:red; font-size: 12px; margin-top: 10px;">Código inválido</div>`;
        }
    }
});
