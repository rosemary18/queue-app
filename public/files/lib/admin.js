// States

const root = document.getElementById('root')
const STATES = {
    events: [],
    event: null,
    participants: [],
    activeTab: 0
}

// Cycles

const handlerOnLoad = () => {
    
    const socket = io();

    socket.on('connect', function () {
        
    })

    socket.on('event-add', handlerGetAllEvents);

    socket.on('queue-updated', function () {
        if (STATES.event) handlerGetEvent()
    });

    socket.on('counter-signed', function () {
        
    });

    socket.on('booth-signed', function () {
        
    });

}

const handlerUnLoad = () => {
    
}

const Start = async () => {

    // let x = prompt('To continue, fill your password')
    // while (x != "xxx") x = prompt('Password wrong, please try again.')
    
    await handlerGetAllEvents()
    renderScreen()
}

// Services

const handlerGetAllEvents = async () => {

    fetch('/api/event', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(res => {
        if (res?.statusCode == 200) {
            STATES.events = res.data
            renderScreen()
        }
    })
}

const handlerGetEvent = async () => {

    fetch(`/api/event/${STATES.event?.id}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(res => {
        if (res?.statusCode == 200) {
            STATES.event = res.data
            renderScreen()
        }
    })
}

const handlerDeleteEvent = (id) => {
    return () => {

        let confirmed = confirm(`Are you sure you want to delete event ${STATES.events[id].event_name} ?`);

        if (!confirmed) return

        fetch('/api/event/delete/' + STATES.events[id].id, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(res => {
            if (res?.statusCode == 200) {
                STATES.events = STATES.events.filter(event => event.id != STATES.events[id].id)
                renderScreen()
            }
            alert(res?.message)
        })
    }
}

// Functions

function getWeekDates() {
    let today = new Date();
    let day = today.getDay() || 7; // Mengubah 0 (Minggu) menjadi 7
    if (day !== 1) {
        today.setHours(-24 * (day - 1));
    }
    let firstDayOfWeek = new Date(today);
    let weekDates = [];

    for (let i = 0; i < 7; i++) {
        let currentDate = new Date(firstDayOfWeek);
        currentDate.setDate(firstDayOfWeek.getDate() + i);
        weekDates.push(currentDate);
    }

    return weekDates;
}

const generateDataSet = () => {

    const dates = getWeekDates();
    const data = {
        labels: dates.map(date => dateFns.format(date, 'MMM, dd')),
        datasets: [
            {
                label: 'Events',
                data: [],
                borderWidth: 2
            },
        ]
    }

    for (let i = 0; i < dates.length; i++) {
        const date = dates[i]
        const events = STATES.events?.filter(event => dateFns.isSameDay(date, new Date(event.created_at)))?.length
        data.datasets[0].data.push(events)
    }

    return data
}

const handlerCreateEvent = () => {

    let event_name = prompt('Enter event name!')

    if (!event_name) return

    fetch('/api/event/create', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event_name
        })
    })
    .then(res => res.json())
    .then(res => {
        if (res?.statusCode == 200) handlerGetAllEvents()
        alert(res?.message)
    })
}

// Renders

const createButton = ({ text, ic, color = "white", size = "bx-xs", active = false, rotation, backgroundColor,  onClick }) => {

    const btn = document.createElement('div')
    const iconWrapper = document.createElement('div')
    const icon = document.createElement('i')
    const title = document.createElement('p')

    btn.classList.add('btn')
    iconWrapper.classList.add('btn-icon-wrapper')
    icon.classList.add('bx', ic)
    icon.classList.add(size)
    if (rotation) icon.classList.add(rotation)
    if (!text) iconWrapper.style.backgroundColor = backgroundColor || "#FFFFFF35"
    if (active) iconWrapper.style.backgroundColor = "#0796323F"
    
    title.classList.add('btn-title')

    icon.style.color = (active) ? "#079632" : color
    icon.style.fontSize = size
    
    title.textContent = text
    btn.onclick = onClick

    iconWrapper.appendChild(icon)
    btn.appendChild(iconWrapper)
    if (text) btn.appendChild(title)

    return btn
}

const createTableEvent = () => {

    const headers = ["No", "Event Name", "Queues", "Counters", "Booths", "Date", "Actions"]

    const table = document.createElement('table')
    const thead = document.createElement('thead')
    const tbody = document.createElement('tbody')

    table.classList.add('table')
    thead.classList.add('table-head')
    tbody.classList.add('table-body')

    const trh = document.createElement('tr')
    for (let i = 0; i < headers.length; i++) {
        const th = document.createElement('th')
        th.textContent = headers[i]
        trh.appendChild(th)
    }
    thead.appendChild(trh)

    for (let i = 0; i < STATES.events?.length; i++) {
        const tr = document.createElement('tr')
        for (let j = 0; j < headers.length; j++) {
            const td = document.createElement('td')
            switch (j) {
                case 0:
                    td.textContent = `${i + 1}`
                    break
                case 1:
                    td.textContent = STATES.events[i]?.event_name
                    break
                case 2:
                    td.textContent = STATES.events[i]?.participants?.length + " Queues"
                    break
                case 3:
                    td.textContent = STATES.events[i]?.counters?.length + " Counters"
                    break
                case 4:
                    td.textContent = STATES.events[i]?.booths?.length + " Booths"
                    break
                case 5:
                    td.textContent = dateFns?.format(new Date(STATES.events[i]?.created_at), 'eeee, dd-MM-yyyy HH:mm');
                    break
                default:
                    const btnShow = createButton({
                        ic: "bxs-show",
                        onClick: () => {
                            STATES.event = STATES.events[i]
                            STATES.activeTab = null
                            renderScreen(STATES.events[i]?.event_name, renderEvent)
                        }
                    })
                    const btnMonitor = createButton({ ic: "bxs-slideshow", onClick: () => window.open(`/liveQueue/${STATES.events[i]?.event_code}`) })
                    const btnDelete = createButton({ ic: "bx-x", color: "red", backgroundColor: "#FF000035", onClick: handlerDeleteEvent(i) })
                    td.style.display = "flex"
                    td.style.flexDirection = "row"
                    td.style.alignItems = "center"
                    td.style.justifyContent = "flex-end"
                    td.appendChild(btnMonitor)
                    td.appendChild(btnShow)
                    td.appendChild(btnDelete)
            }
            tr.appendChild(td)
        }
        tbody.appendChild(tr)
    }

    table.appendChild(thead)
    table.appendChild(tbody)

    return table
}

const createTableEventParticipants = () => {

    const headers = ["No", "Name", "Queue Code", "Status"]

    const table = document.createElement('table')
    const thead = document.createElement('thead')
    const tbody = document.createElement('tbody')

    table.classList.add('table')
    thead.classList.add('table-head')
    tbody.classList.add('table-body')

    const trh = document.createElement('tr')
    for (let i = 0; i < headers.length; i++) {
        const th = document.createElement('th')
        th.textContent = headers[i]
        trh.appendChild(th)
    }
    thead.appendChild(trh)

    for (let i = 0; i < STATES.event?.participants?.length; i++) {
        const tr = document.createElement('tr')
        for (let j = 0; j < headers.length; j++) {
            const td = document.createElement('td')
            switch (j) {
                case 0:
                    td.textContent = `${i + 1}`
                    break
                case 1:
                    td.textContent = STATES.event?.participants?.[i].name
                    break
                case 2:
                    td.textContent = STATES.event?.participants?.[i].queue_code
                    break
                case 3:
                    td.style.color = STATES.event?.participants?.[i].status == 0 ? "gray" : "green"
                    td.textContent = STATES.event?.participants?.[i].status == 0 ? "Waiting" : "Served"
                    break
            }
            tr.appendChild(td)
        }
        tbody.appendChild(tr)
    }

    table.appendChild(thead)
    table.appendChild(tbody)

    return table
}

const createTableEventCounters = () => {

    const headers = ["No", "Counter Code", "Status"]

    const table = document.createElement('table')
    const thead = document.createElement('thead')
    const tbody = document.createElement('tbody')

    table.classList.add('table')
    thead.classList.add('table-head')
    tbody.classList.add('table-body')

    const trh = document.createElement('tr')
    for (let i = 0; i < headers.length; i++) {
        const th = document.createElement('th')
        th.textContent = headers[i]
        trh.appendChild(th)
    }
    thead.appendChild(trh)

    for (let i = 0; i < STATES.event?.counters?.length; i++) {
        const tr = document.createElement('tr')
        for (let j = 0; j < headers.length; j++) {
            const td = document.createElement('td')
            switch (j) {
                case 0:
                    td.textContent = `${i + 1}`
                    break
                case 1:
                    td.textContent = STATES.event?.counters?.[i].counter_code
                    break
                case 2:
                    td.textContent = STATES.event?.counters?.[i].status == 0 ? "Inactive" : "Active"
                    break
            }
            tr.appendChild(td)
        }
        tbody.appendChild(tr)
    }

    table.appendChild(thead)
    table.appendChild(tbody)

    return table
}

const createTableEventBooths = () => {

    const headers = ["No", "Booth Code", "Status"]

    const table = document.createElement('table')
    const thead = document.createElement('thead')
    const tbody = document.createElement('tbody')

    table.classList.add('table')
    thead.classList.add('table-head')
    tbody.classList.add('table-body')

    const trh = document.createElement('tr')
    for (let i = 0; i < headers.length; i++) {
        const th = document.createElement('th')
        th.textContent = headers[i]
        trh.appendChild(th)
    }
    thead.appendChild(trh)

    for (let i = 0; i < STATES.event?.booths?.length; i++) {
        const tr = document.createElement('tr')
        for (let j = 0; j < headers.length; j++) {
            const td = document.createElement('td')
            switch (j) {
                case 0:
                    td.textContent = `${i + 1}`
                    break
                case 1:
                    td.textContent = STATES.event?.booths?.[i].booth_code
                    break
                case 2:
                    td.textContent = STATES.event?.booths?.[i].status == 0 ? "Inactive" : "Active"
                    break
            }
            tr.appendChild(td)
        }
        tbody.appendChild(tr)
    }

    table.appendChild(thead)
    table.appendChild(tbody)

    return table
}

const renderDashboard = () => {

    const container = document.createElement('div')
    const ctx = document.createElement('canvas')
    new Chart(ctx, {
        type: 'line',
        data: generateDataSet(),
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    container.appendChild(ctx)
    container.style.display = "flex";
    container.style.flex = 1;
    container.style.backgroundColor = "#212529";
    container.style.borderRadius = "12px";
    container.style.margin = "12px";
    container.style.boxShadow = "0px 0px 10px 0px #0000001A";
    container.style.color = "#CACACA";
    container.style.padding = "12px 18px";

    return container
    
}

const renderEvents = () => {
    
    const container = document.createElement('div')
    const table = createTableEvent()
    table.id = "events-table"

    table.style.maxHeight = "100%";
    container.style.backgroundColor = "#212529";
    container.style.borderRadius = "12px";
    container.style.margin = "12px";
    container.style.boxShadow = "0px 0px 10px 0px #0000001A";
    container.style.color = "#CACACA";
    container.style.padding = "12px 18px";
    container.style.display = "flex";
    container.style.flex = 1;
    container.style.flexDirection = "column";

    container.appendChild(table)
    return container

}

const renderEvent = () => {
    
    const container = document.createElement('div')
    const detailContainer = document.createElement('div')
    const detailLeftSection= document.createElement('div')
    const detailTitle = document.createElement('h2')
    const tableParticipant = createTableEventParticipants()
    const tableCounters = createTableEventCounters()
    const tableBooths = createTableEventBooths()
    
    container.classList.add('detail')
    detailContainer.classList.add('detail-container')
    detailLeftSection.classList.add('detail-left-section')

    detailTitle.style.margin = "0 0 18px 0"
    detailTitle.style.fontSize = "18px"

    detailTitle.textContent = "Event Details"
    detailContainer.appendChild(detailTitle)
    
    for (let index = 0; index < 6; index++) {
        const _container = document.createElement('div')
        const detailText = document.createElement('p')
        const detailTextValue = document.createElement('p')
        detailText.style.margin = "0"
        detailText.style.marginRight = "24px"
        detailText.style.fontSize = "14px"
        detailTextValue.style.margin = "0"
        detailTextValue.style.fontSize = "14px"
        detailTextValue.style.color = "white"
        _container.style.display = "flex"
        _container.style.flexDirection = "row"
        _container.style.justifyContent = "space-between"
        _container.style.margin = "6px 0"
        switch (index) {
            case 0:
                detailText.textContent = `Event Name :`
                detailTextValue.textContent = `${STATES.event?.event_name}`
                break
            case 1:
                detailText.textContent = `Event Code :`
                detailTextValue.textContent = `${STATES.event?.event_code}`
                detailTextValue.style.color = "#5233FFF6"
                break
            case 2:
                detailText.textContent = `Event Counter Pass :`
                detailTextValue.textContent = `${STATES.event?.event_counter_pass}`
                detailTextValue.style.color = "#5233FFF6"
                break
            case 3:
                detailText.textContent = `Event Booth Pass :`
                detailTextValue.textContent = `${STATES.event?.event_booth_pass}`
                detailTextValue.style.color = "#5233FFF6"
                break
            case 4:
                detailText.textContent = `Updated At :`
                detailTextValue.textContent = `${dateFns?.format(new Date(STATES.event?.updated_at), 'dd-MM-yyyy HH:mm')}`
                break
            case 5:
                detailText.textContent = `Created At :`
                detailTextValue.textContent = `${dateFns?.format(new Date(STATES.event?.created_at), 'dd-MM-yyyy HH:mm')}`
                break
        }

        _container.appendChild(detailText)
        _container.appendChild(detailTextValue)
        detailContainer.appendChild(_container)
    }

    detailLeftSection.appendChild(detailContainer)
    container.appendChild(detailLeftSection)

    for (let index = 0; index < 3; index++) {

        const _containerTable = document.createElement('div')
        _containerTable.style.display = "flex"
        _containerTable.style.flex = 1
        _containerTable.style.flexDirection = "column"
        _containerTable.style.padding = "4px 12px"
        _containerTable.style.backgroundColor = "#212529"
        _containerTable.style.borderRadius = "12px"
        _containerTable.style.margin = "12px 4px"
        _containerTable.style.color = "#CACACA"
        
        switch (index) {
            case 0:
                tableCounters.id = "counters-table"
                _containerTable.appendChild(tableCounters)
                container.appendChild(_containerTable)
                break
            case 1:
                tableBooths.id = "booths-table"
                _containerTable.appendChild(tableBooths)
                container.appendChild(_containerTable)
                break                
            case 2:
                _containerTable.style.flex = 1.5
                tableParticipant.id = "participants-table"
                _containerTable.appendChild(tableParticipant)
                container.appendChild(_containerTable)
                break
        }
    }

    return container
}

const renderScreen = (_title, content) => {

    root.innerHTML = ''

    const header = document.createElement('div')
    const bodyContent = document.createElement('div')
    const sideBar = document.createElement('div')
    const sideBarBtnWrapper = document.createElement('div')
    const wrapper = document.createElement('div')
    const logo = document.createElement('img')
    const titleWrapper = document.createElement('div')
    const title = document.createElement('h1')
    const btnDashbaord = createButton({
        text: "Dashboard",
        ic: "bx-carousel",
        active: STATES.activeTab == 0,
        onClick: () => {
            if (STATES.activeTab == 0) return
            STATES.activeTab = 0
            STATES.event = null
            renderScreen()
        }
    })
    const btnEvent = createButton({
        text: "Events",
        ic: "bx-calendar-event",
        active: STATES.activeTab == 1,
        onClick: () => {
            if (STATES.activeTab == 1) return
            handlerGetAllEvents()
            STATES.activeTab = 1
            STATES.event = null
            renderScreen()
        }
    })
    const btnAdd = createButton({
        ic: "bx-plus",
        rotation: "bx-rotate-180",
        onClick: handlerCreateEvent
    })
    const btnLogout = createButton({
        text: "Log out",
        ic: "bx-log-out-circle",
        rotation: "bx-rotate-180",
        onClick: () => window.location.href = "/",
    })

    header.classList.add('header')
    bodyContent.classList.add('body-content')
    sideBar.classList.add('sidebar')
    sideBarBtnWrapper.classList.add('sidebar-btn-wrapper')
    wrapper.classList.add('content')
    logo.classList.add('logo')
    titleWrapper.classList.add('title-wrapper')

    logo.src = '/icons/ic-app.png'
    title.textContent = _title ? _title : STATES.activeTab == 0 ? "Dashboard" : "Events"

    titleWrapper.appendChild(title);

    if (content) wrapper.appendChild(content())
    else if (STATES.activeTab == 0) wrapper.appendChild(renderDashboard())
    else if (STATES.activeTab == 1) wrapper.appendChild(renderEvents())

    header.appendChild(logo)
    header.appendChild(titleWrapper)
    if (STATES.activeTab == 1) header.appendChild(btnAdd)

    sideBarBtnWrapper.appendChild(btnDashbaord)
    sideBarBtnWrapper.appendChild(btnEvent)
    sideBar.appendChild(sideBarBtnWrapper)
    sideBar.appendChild(btnLogout)

    bodyContent.appendChild(sideBar)
    bodyContent.appendChild(wrapper)
    root.appendChild(header)
    root.appendChild(bodyContent)

    if (STATES.activeTab == 1) {
        $(document).ready(function() {
            $('#events-table').DataTable();
        });
        $('#events-table').DataTable({
            responsive: true,
            paging: true,
            scrollY: wrapper.clientHeight*.78
        } );
    }

    if (STATES.activeTab == null) {
        $(document).ready(function() {
            $('#participants-table').DataTable();
            $('#counters-table').DataTable();
            $('#booths-table').DataTable();
        });
        $('#participants-table').DataTable({
            responsive: true,
            paging: true,
            lengthChange: false,
            searching: false,
            scrollY: wrapper.clientHeight*.8
        } );
        $('#counters-table').DataTable({
            responsive: true,
            paging: false,
            lengthChange: false,
            searching: false,
            scrollY: wrapper.clientHeight * .85,
            info: false
        });
        $('#booths-table').DataTable({
            responsive: true,
            paging: false,
            lengthChange: false,
            searching: false,
            scrollY: wrapper.clientHeight * .85,
            info: false
        });
    }
}

// Register

window.addEventListener('load', handlerOnLoad)
window.addEventListener('unload', handlerUnLoad)

Start()