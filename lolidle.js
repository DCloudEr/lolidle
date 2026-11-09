(function() {
    // Evita duplicar se injetado mais de uma vez
    if (document.getElementById('bot-painel-slots')) return;

    // Cria a caixa flutuante principal
    const painel = document.createElement('div');
    painel.id = 'bot-painel-slots';
    painel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 340px;
        height: 300px;
        min-width: 240px;
        min-height: 160px;
        background: #1e1e1e;
        color: #fff;
        border: 2px solid #444;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        font-family: sans-serif;
        z-index: 10000;
        user-select: none;
        resize: both;
        overflow: auto;
        display: flex;
        flex-direction: column;
    `;

    // Cabeçalho (Área para arrastar e botões)
    const header = document.createElement('div');
    header.style.cssText = `
        background: #333;
        padding: 6px 8px;
        font-size: 13px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #444;
        cursor: move;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        flex-shrink: 0;
    `;

    const tituloHeader = document.createElement('span');
    tituloHeader.innerText = 'Auto Clicker';
    tituloHeader.style.cssText = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
    header.appendChild(tituloHeader);

    const headerButtons = document.createElement('div');
    headerButtons.style.cssText = 'display: flex; gap: 4px; flex-shrink: 0;';

    const btnMinimizarIcone = document.createElement('button');
    btnMinimizarIcone.innerText = '🗕';
    btnMinimizarIcone.title = 'Minimizar para ícone';
    btnMinimizarIcone.style.cssText = `
        background: #f0ad4e;
        color: white;
        border: none;
        border-radius: 3px;
        width: 22px;
        height: 22px;
        cursor: pointer;
        font-weight: bold;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const btnFechar = document.createElement('button');
    btnFechar.innerText = '✕';
    btnFechar.title = 'Fechar';
    btnFechar.style.cssText = `
        background: #d9534f;
        color: white;
        border: none;
        border-radius: 3px;
        width: 22px;
        height: 22px;
        cursor: pointer;
        font-weight: bold;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    headerButtons.appendChild(btnMinimizarIcone);
    headerButtons.appendChild(btnFechar);
    header.appendChild(headerButtons);
    painel.appendChild(header);

    // Ícone flutuante
    const iconeFlutuante = document.createElement('div');
    iconeFlutuante.id = 'bot-icone-flutuante';
    iconeFlutuante.innerText = '⚡';
    iconeFlutuante.title = 'Abrir Auto Clicker (Arraste para mover)';
    iconeFlutuante.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 45px;
        height: 45px;
        background: #0275d8;
        color: white;
        border-radius: 50%;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: grab;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        z-index: 10001;
        user-select: none;
    `;
    document.body.appendChild(iconeFlutuante);

    // Corpo do painel
    const body = document.createElement('div');
    body.style.cssText = `
        padding: 8px; 
        display: flex; 
        flex-direction: column; 
        gap: 6px; 
        flex-grow: 1; 
        overflow: hidden;
    `;

    const slotsContainer = document.createElement('div');
    slotsContainer.style.cssText = `
        flex-grow: 1; 
        overflow-y: auto; 
        display: flex; 
        flex-direction: column; 
        gap: 5px; 
        padding-right: 2px;
    `;
    body.appendChild(slotsContainer);

    const footerControls = document.createElement('div');
    footerControls.style.cssText = 'display: flex; flex-direction: column; gap: 5px; flex-shrink: 0;';

    const btnAddSlot = document.createElement('button');
    btnAddSlot.innerText = '+ Adicionar Botão';
    btnAddSlot.style.cssText = `
        background: #5bc0de;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 6px;
        cursor: pointer;
        font-weight: bold;
        font-size: 11px;
    `;
    footerControls.appendChild(btnAddSlot);

    const btnToggle = document.createElement('button');
    btnToggle.innerText = 'LIGAR CLICKER';
    btnToggle.style.cssText = `
        width: 100%;
        padding: 8px;
        background: #d9534f;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
    `;
    footerControls.appendChild(btnToggle);

    body.appendChild(footerControls);
    painel.appendChild(body);
    document.body.appendChild(painel);

    let ativo = false;
    let slotConfigs = [];

    function simularTecla(caractere) {
        if (!caractere) return;
        const upper = caractere.toUpperCase();
        const eventoDown = new KeyboardEvent('keydown', { key: caractere, code: 'Key' + upper, bubbles: true });
        const eventoPress = new KeyboardEvent('keypress', { key: caractere, bubbles: true });
        const eventoUp = new KeyboardEvent('keyup', { key: caractere, code: 'Key' + upper, bubbles: true });

        document.dispatchEvent(eventoDown);
        document.dispatchEvent(eventoPress);
        document.dispatchEvent(eventoUp);
    }

    function agendarSlot(slot) {
        if (!ativo) return;
        slot.timeoutId = setTimeout(() => {
            if (!ativo) return;
            simularTecla(slot.tecla);
            agendarSlot(slot);
        }, slot.tempo * 1000);
    }

    function pararTodosTimers() {
        slotConfigs.forEach(slot => {
            if (slot.timeoutId) clearTimeout(slot.timeoutId);
        });
    }

    function reiniciarTodosTimers() {
        pararTodosTimers();
        if (ativo) {
            slotConfigs.forEach(slot => {
                simularTecla(slot.tecla);
                agendarSlot(slot);
            });
        }
    }

    function criarElementoSlot(teclaInicial, tempoInicial) {
        const slotRow = document.createElement('div');
        slotRow.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #2a2a2a;
            padding: 5px 6px;
            border-radius: 4px;
            font-size: 12px;
            flex-shrink: 0;
            gap: 4px;
        `;

        const leftGroup = document.createElement('div');
        leftGroup.style.cssText = 'display: flex; align-items: center; gap: 4px; flex-shrink: 1; min-width: 0;';

        const inputKey = document.createElement('input');
        inputKey.type = 'text';
        inputKey.value = teclaInicial;
        inputKey.maxLength = 1;
        inputKey.style.cssText = `
            width: 22px;
            text-align: center;
            background: #333;
            color: #fff;
            border: 1px solid #555;
            border-radius: 3px;
            padding: 3px;
            font-weight: bold;
            text-transform: lowercase;
            flex-shrink: 0;
        `;

        const labelTempo = document.createElement('span');
        labelTempo.innerText = 's:';
        labelTempo.style.cssText = 'font-size: 11px; color: #ccc; flex-shrink: 0;';

        const inputTime = document.createElement('input');
        inputTime.type = 'number';
        inputTime.step = '0.1';
        inputTime.min = '0.1';
        inputTime.value = tempoInicial;
        inputTime.style.cssText = `
            width: 50px;
            min-width: 35px;
            background: #333;
            color: #fff;
            border: 1px solid #555;
            border-radius: 3px;
            padding: 3px;
            text-align: center;
            flex-shrink: 1;
        `;

        leftGroup.appendChild(inputKey);
        leftGroup.appendChild(labelTempo);
        leftGroup.appendChild(inputTime);

        const rightGroup = document.createElement('div');
        rightGroup.style.cssText = 'display: flex; align-items: center; gap: 3px; flex-shrink: 0;';

        const btnSalvar = document.createElement('button');
        btnSalvar.innerText = 'Gravar';
        btnSalvar.style.cssText = `
            background: #0275d8;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 4px 5px;
            cursor: pointer;
            font-size: 10px;
            font-weight: bold;
        `;

        const btnRemover = document.createElement('button');
        btnRemover.innerText = 'X';
        btnRemover.style.cssText = `
            background: #d9534f;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 4px 6px;
            cursor: pointer;
            font-size: 10px;
            font-weight: bold;
        `;

        rightGroup.appendChild(btnSalvar);
        rightGroup.appendChild(btnRemover);

        slotRow.appendChild(leftGroup);
        slotRow.appendChild(rightGroup);
        slotsContainer.appendChild(slotRow);

        const configObj = {
            tecla: teclaInicial,
            tempo: tempoInicial,
            timeoutId: null,
            elemento: slotRow
        };

        slotConfigs.push(configObj);

        btnSalvar.addEventListener('click', () => {
            const novaTecla = inputKey.value.trim().toLowerCase();
            const novoTempo = parseFloat(inputTime.value);

            if (!novaTecla) {
                alert('Digite uma tecla válida.');
                return;
            }
            if (isNaN(novoTempo) || novoTempo <= 0) {
                alert('Digite um tempo válido em segundos.');
                return;
            }

            configObj.tecla = novaTecla;
            configObj.tempo = novoTempo;

            btnSalvar.innerText = 'Salvo!';
            btnSalvar.style.background = '#5cb85c';
            setTimeout(() => {
                btnSalvar.innerText = 'Gravar';
                btnSalvar.style.background = '#0275d8';
            }, 1000);

            if (ativo) {
                reiniciarTodosTimers();
            }
        });

        btnRemover.addEventListener('click', () => {
            if (configObj.timeoutId) clearTimeout(configObj.timeoutId);
            slotRow.remove();
            slotConfigs = slotConfigs.filter(s => s !== configObj);
            if (ativo) {
                reiniciarTodosTimers();
            }
        });
    }

    const slotsIniciais = [
        { tecla: 'a', tempo: 4.2 },
        { tecla: 'q', tempo: 5.2 },
        { tecla: 'w', tempo: 10.6 },
        { tecla: 'e', tempo: 12.4 },
        { tecla: 'r', tempo: 23.0 }
    ];

    slotsIniciais.forEach(s => criarElementoSlot(s.tecla, s.tempo));

    btnAddSlot.addEventListener('click', () => {
        criarElementoSlot('x', 5.0);
    });

    btnToggle.addEventListener('click', () => {
        ativo = !ativo;
        if (ativo) {
            btnToggle.innerText = 'DESLIGAR CLICKER';
            btnToggle.style.background = '#5cb85c';
            slotConfigs.forEach(slot => {
                simularTecla(slot.tecla);
                agendarSlot(slot);
            });
        } else {
            btnToggle.innerText = 'LIGAR CLICKER';
            btnToggle.style.background = '#d9534f';
            pararTodosTimers();
        }
    });

    btnFechar.addEventListener('click', (e) => {
        e.stopPropagation();
        pararTodosTimers();
        painel.remove();
        iconeFlutuante.remove();
    });

    btnMinimizarIcone.addEventListener('click', (e) => {
        e.stopPropagation();
        painel.style.display = 'none';
        iconeFlutuante.style.display = 'flex';
        iconeFlutuante.style.top = painel.style.top;
        iconeFlutuante.style.left = painel.style.left;
        iconeFlutuante.style.right = 'auto';
    });

    let iconeMovido = false;
    iconeFlutuante.addEventListener('click', () => {
        if (!iconeMovido) {
            iconeFlutuante.style.display = 'none';
            painel.style.display = 'flex';
        }
    });

    function tornarArrastavel(elemento, gatilho) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        let hasMoved = false;

        gatilho.addEventListener('mousedown', (e) => {
            isDragging = true;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;
            initialX = elemento.offsetLeft;
            initialY = elemento.offsetTop;
            gatilho.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                hasMoved = true;
            }
            elemento.style.left = `${initialX + dx}px`;
            elemento.style.top = `${initialY + dy}px`;
            elemento.style.right = 'auto';
            elemento.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                gatilho.style.cursor = gatilho === iconeFlutuante ? 'grab' : 'move';
                if (gatilho === iconeFlutuante) {
                    iconeMovido = hasMoved;
                    setTimeout(() => { iconeMovido = false; }, 100);
                }
            }
        });
    }

    tornarArrastavel(painel, header);
    tornarArrastavel(iconeFlutuante, iconeFlutuante);
})();