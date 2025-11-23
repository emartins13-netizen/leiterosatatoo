//import * as fs from 'fs/promises';
// configuração da API 
//const apikey = process.env.leitrosatatoo;
//const apiUrl = 'https://leiterosatatoo.com/api';
//const knowledge_file = 'data.json';


// Load gallery data from data.json and render gallery with a lightbox
async function loadGallery() {
    try {
        const res = await fetch('data.json');
        const items = await res.json();
        const grid = document.getElementById('galleryGrid');

        items.forEach(item => {
            const figure = document.createElement('figure');
            figure.className = 'card';
            figure.tabIndex = 0;

            const img = document.createElement('img');
            img.src = item.thumb || item.image;
            img.alt = item.title || 'Imagem do portfólio';

            const caption = document.createElement('figcaption');
            caption.textContent = item.title || '';

            figure.appendChild(img);
            figure.appendChild(caption);
            grid.appendChild(figure);

            function open() {
                openLightbox(item.image, item.title, item.description);
            }

            figure.addEventListener('click', open);
            figure.addEventListener('keypress', (e) => { if (e.key === 'Enter') open(); });
        });
    } catch (err) {
        console.error('Erro carregando galeria:', err);
    }
}

function openLightbox(src, title, desc) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImage');
    const cap = document.getElementById('lightboxCaption');
    img.src = src;
    img.alt = title || '';
    cap.textContent = title ? `${title}${desc ? ' — ' + desc : ''}` : (desc || '');
    lb.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImage');
    lb.setAttribute('aria-hidden', 'true');
    img.src = '';
}

document.addEventListener('DOMContentLoaded', () => {
    loadGallery();
    initCalendar(); // Movido para o listener principal

    const lb = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');

    closeBtn.addEventListener('click', closeLightbox);
    lb.addEventListener('click', (e) => {
        if (e.target === lb) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
});

// --- Lógica do Calendário e Agenda ---

const calendarState = {
    currentDate: new Date(),
    // Dados de exemplo: Dias e horários disponíveis
    // Em um projeto real, isso viria de um banco de dados.
    availability: {
        "2025-11-28": ["10:00", "11:00", "14:00", "15:00"],
        "2025-12-02": ["09:00", "10:00"],
        "2025-12-04": ["13:00", "14:00", "16:00"]
    }
};

function initCalendar() {
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    prevMonthBtn.addEventListener('click', () => {
        calendarState.currentDate.setMonth(calendarState.currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        calendarState.currentDate.setMonth(calendarState.currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
}

function renderCalendar() {
    const { currentDate, availability } = calendarState;
    const monthYearEl = document.getElementById('month-year');
    const daysEl = document.getElementById('calendar-days');

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    monthYearEl.textContent = `${currentDate.toLocaleString('pt-BR', { month: 'long' })} ${year}`;
    daysEl.innerHTML = '';

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('empty');
        daysEl.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.textContent = day;

        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Verifica se o dia tem horários disponíveis
        if (availability[dateString]) {
            dayCell.classList.add('available');
            dayCell.addEventListener('click', () => showAgendaForDate(dateString, dayCell));
        }

        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayCell.classList.add('today');
        }

        daysEl.appendChild(dayCell);
    }
}

function showAgendaForDate(dateString, dayCell) {
    // Remove a seleção de outros dias
    document.querySelectorAll('.calendar-days .selected').forEach(el => el.classList.remove('selected'));
    // Adiciona a classe de seleção ao dia clicado
    dayCell.classList.add('selected');

    const agendaTitle = document.getElementById('agenda-title');
    const agendaSlots = document.getElementById('agenda-slots');
    const slots = calendarState.availability[dateString] || [];

    const formattedDate = new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    agendaTitle.textContent = `Horários disponíveis para ${formattedDate}:`;
    agendaSlots.innerHTML = '';

    if (slots.length > 0) {
        slots.forEach(time => {
            const slotEl = document.createElement('div');
            slotEl.className = 'slot';
            slotEl.textContent = time;
            slotEl.addEventListener('click', () => alert(`Horário ${time} em ${formattedDate} selecionado!`));
            agendaSlots.appendChild(slotEl);
        });
    } else {
        agendaTitle.textContent = 'Selecione um dia disponível';
    }
}
