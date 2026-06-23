const textareas = elemento.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        const divTemporal = document.createElement('div');
        
        // Convertimos los saltos de línea (\n) en etiquetas <br> reales de HTML
        // y escapamos caracteres especiales para evitar problemas de renderizado
        const textoConSaltos = textarea.value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>");
        
        divTemporal.innerHTML = textoConSaltos;

        // Estilos obligatorios para que el DIV procese el texto como un bloque
        divTemporal.style.display = 'block';
        divTemporal.style.whiteSpace = 'normal'; // Al usar <br>, ya no dependemos de pre-wrap
        divTemporal.style.wordBreak = 'break-word';
        divTemporal.style.boxSizing = 'border-box';

        // Clonamos los estilos visuales del textarea original
        const estiloOriginal = window.getComputedStyle(textarea);
        divTemporal.style.fontFamily = estiloOriginal.fontFamily;
        divTemporal.style.fontSize = estiloOriginal.fontSize;
        divTemporal.style.color = estiloOriginal.color;
        divTemporal.style.padding = estiloOriginal.padding;
        divTemporal.style.border = estiloOriginal.border;
        divTemporal.style.borderRadius = estiloOriginal.borderRadius;
        divTemporal.style.backgroundColor = estiloOriginal.backgroundColor;
        
        // Mantenemos las dimensiones exactas
        const dimTextarea = textarea.getBoundingClientRect();
        divTemporal.style.width = dimTextarea.width + 'px';
        divTemporal.style.minHeight = dimTextarea.height + 'px'; 

        // Intercambio temporal en el DOM
        textarea.parentNode.insertBefore(divTemporal, textarea);
        textarea.style.display = 'none';
        
        reemplazos.push({ original: textarea, temporal: divTemporal });
    })
    async function generar(a,b,botonReferencia) {
    const elemento = document.getElementById(`evaluacion-container-${a}`);
    
    if (!elemento) {
        console.error(`No se encontró el contenedor: evaluacion-container-${a}`);
        alert("No se pudo encontrar el contenido a exportar.");
        return;
    }

    if (botonReferencia) botonReferencia.style.display = 'none';

    // Arreglo para guardar todos los reemplazos temporales
    const reemplazos = [];

    // --- 1. SOLUCIÓN PARA LOS SELECTS ---
    const selects = elemento.querySelectorAll('select');
    selects.forEach(select => {
        const textoSeleccionado = select.options[select.selectedIndex].text;
        const spanTemporal = document.createElement('span');
        spanTemporal.innerText = textoSeleccionado;
        
        // Copiar estilos básicos para mantener el diseño
        spanTemporal.style.display = 'inline-block';
        spanTemporal.style.fontFamily = window.getComputedStyle(select).fontFamily;
        spanTemporal.style.fontSize = window.getComputedStyle(select).fontSize;
        spanTemporal.style.color = window.getComputedStyle(select).color;
        spanTemporal.style.padding = window.getComputedStyle(select).padding;
        spanTemporal.style.border = window.getComputedStyle(select).border;
        spanTemporal.style.borderRadius = window.getComputedStyle(select).borderRadius;
        spanTemporal.style.backgroundColor = window.getComputedStyle(select).backgroundColor;
        spanTemporal.style.width = window.getComputedStyle(select).width;
        spanTemporal.style.textAlign = 'center';

        select.parentNode.insertBefore(spanTemporal, select);
        select.style.display = 'none';
        reemplazos.push({ original: select, temporal: spanTemporal });
    });

    // --- 2. SOLUCIÓN PARA LA FECHA (ACTUALIZADA) ---
    const elementoFecha = elemento.querySelector('.date-box') || elemento.querySelector('input[type="datetime-local"]');
    
    if (elementoFecha) {
        let textoFecha = elementoFecha.value || elementoFecha.innerText || elementoFecha.textContent;
        
        if (!textoFecha || textoFecha.trim() === "") {
            textoFecha = " "; 
        } else {
            // Si el formato viene de un input datetime-local nativo (ej: 2026-05-02T22:04)
            if (textoFecha.includes('T')) {
                const partes = textoFecha.split('T'); 
                const fechaLimpia = partes[0].replace(/-/g, '/'); // Cambia guiones por diagonales
                const horaLimpia = partes[1];
                textoFecha = `${fechaLimpia}   ${horaLimpia}`; // Resultado limpio: 2026/05/02   22:04
            }
        }

        const spanFechaTemporal = document.createElement('span');
        spanFechaTemporal.innerText = textoFecha;
        
        // Clonamos fuentes y colores originales
        spanFechaTemporal.style.fontFamily = window.getComputedStyle(elementoFecha).fontFamily;
        spanFechaTemporal.style.fontSize = window.getComputedStyle(elementoFecha).fontSize;
        spanFechaTemporal.style.color = window.getComputedStyle(elementoFecha).color;
        spanFechaTemporal.style.padding = window.getComputedStyle(elementoFecha).padding;
        
        // Medimos el tamaño físico real del contenedor original en píxeles
        const dimensiones = elementoFecha.getBoundingClientRect();
        spanFechaTemporal.style.width = dimensiones.width + 'px';
        spanFechaTemporal.style.height = dimensiones.height + 'px';
        
        // Forzamos el centrado absoluto con Flexbox (evita que se pegue a las esquinas en la imagen)
        spanFechaTemporal.style.display = 'inline-flex';
        spanFechaTemporal.style.alignItems = 'center';
        spanFechaTemporal.style.justifyContent = 'center';
        spanFechaTemporal.style.boxSizing = 'border-box';

        // Insertar el reemplazo y ocultar el original
        elementoFecha.parentNode.insertBefore(spanFechaTemporal, elementoFecha);
        elementoFecha.style.display = 'none';
        reemplazos.push({ original: elementoFecha, temporal: spanFechaTemporal });
    }

    try {
        const canvas = await html2canvas(elemento, {
            scale: 2,           
            useCORS: true,      
            logging: false,     
            backgroundColor: '#ffffff' 
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        const enlaceDescarga = document.createElement('a');
        enlaceDescarga.download = `Evaluacion_${b}_${a}.jpg`;
        enlaceDescarga.href = imgData;
        enlaceDescarga.click();

    } catch (error) {
        console.error("Error al generar la imagen JPEG:", error);
        alert("Hubo un problema al generar la imagen del reporte.");
    } finally {
        // --- 3. RESTAURAR TODO EL HTML ORIGINAL ---
        reemplazos.forEach(item => {
            item.temporal.remove();
            item.original.style.display = ''; 
        });

        if (botonReferencia) botonReferencia.style.display = 'block';
    }
}
;