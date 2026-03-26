
const input = document.getElementById('textInput');
const generateBtn = document.getElementById('generateBtn');
const qrContainer = document.getElementById('qrCodeContainer');

function showMessage(text, timeout = 3000) {
    const existing = document.getElementById('qr-msg');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.id = 'qr-msg';
    msg.innerText = text;
    Object.assign(msg.style, {
        marginTop: '12px',
        fontSize: '0.95rem',
        color: '#222',
        background: 'rgba(255,255,255,0.9)',
        padding: '8px 12px',
        borderRadius: '10px',
        display: 'inline-block',
        boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
    });
    qrContainer.appendChild(msg);

    setTimeout(() => msg.remove(), timeout);
}

function clearQRCodeArea() {
    while (qrContainer.firstChild) {
        qrContainer.removeChild(qrContainer.firstChild);
    }
}

function createDownloadButton(canvas) {
    const link = document.createElement('a');
    link.innerText = 'Download PNG';
    link.setAttribute('download', 'qrcode.png');
    link.href = canvas.toDataURL('image/png');
    Object.assign(link.style, {
        display: 'inline-block',
        margin: '10px 8px 0 0',
        padding: '8px 12px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg,#667eea,#764ba2)',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: '600',
        boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
    });
    return link;
}

function createCopyButton(canvas, textValue) {
    const btn = document.createElement('button');
    btn.innerText = 'Copy PNG';
    Object.assign(btn.style, {
        display: 'inline-block',
        margin: '10px 0 0 0',
        padding: '8px 12px',
        borderRadius: '10px',
        background: '#2d3436',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
    });

    btn.addEventListener('click', async () => {
        try {
            if (navigator.clipboard && canvas.toBlob) {
                canvas.toBlob(async (blob) => {
                    try {
                        const item = new ClipboardItem({ [blob.type]: blob });
                        await navigator.clipboard.write([item]);
                        showMessage('PNG copied to clipboard!');
                    } catch (err) {
                        await fallbackCopyText(canvas.toDataURL('image/png'));
                        showMessage('Data URL copied due to browser limitations.');
                    }
                });
            } else {
                await fallbackCopyText(canvas.toDataURL('image/png'));
                showMessage('Data URL copied (fallback).');
            }
        } catch (err) {
            console.error(err);
            showMessage('Copy failed: ' + (err.message || err));
        }
    });

    async function fallbackCopyText(str) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(str);
        } else {
            const ta = document.createElement('textarea');
            ta.value = str;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
        }
    }

    return btn;
}

function generateQRCode() {
    const text = input.value.trim();

    if (!text) {
        showMessage('Please enter text or URL.');
        return;
    }

    clearQRCodeArea();

    const canvas = document.createElement('canvas');
    const size = text.length > 120 ? 420 : (text.length > 40 ? 320 : 260);

    new QRious({
        element: canvas,
        value: text,
        size: size,
        level: 'H',
        background: 'white',
        foreground: '#111'
    });

    Object.assign(canvas.style, {
        width: '200px',
        height: '200px',
        borderRadius: '12px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
        display: 'block',
        margin: '0 auto'
    });

    const wrapper = document.createElement('div');
    wrapper.style.textAlign = 'center';
    wrapper.appendChild(canvas);

    const btnRow = document.createElement('div');
    btnRow.style.marginTop = '12px';
    btnRow.style.display = 'flex';
    btnRow.style.justifyContent = 'center';
    btnRow.style.flexWrap = 'wrap';
    btnRow.style.gap = '8px';

    const downloadLink = createDownloadButton(canvas);
    btnRow.appendChild(downloadLink);

    const copyBtn = createCopyButton(canvas, text);
    btnRow.appendChild(copyBtn);

    const copyTextBtn = document.createElement('button');
    copyTextBtn.innerText = 'Copy Text';
    Object.assign(copyTextBtn.style, {
        marginLeft: '8px',
        padding: '8px 12px',
        borderRadius: '10px',
        background: '#00b894',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
    });
    copyTextBtn.addEventListener('click', async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                showMessage('Text copied!');
            } else {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
                showMessage('Text copied (fallback).');
            }
        } catch (err) {
            console.error(err);
            showMessage('Copy failed.');
        }
    });
    btnRow.appendChild(copyTextBtn);

    wrapper.appendChild(btnRow);

    qrContainer.appendChild(wrapper);

    showMessage('QR code generated!');
}

generateBtn.addEventListener('click', generateQRCode);

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        generateQRCode();
    }
});