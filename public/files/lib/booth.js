// States

const socket = io();
const root = document.getElementById('root')
const eventId = window.location.pathname.split('/')[2]
const STATES = {
    event: {},
    booth: {},
    queues: [],
    queue: null,
}

// Cycles

const handlerOnLoad = () => {
    socket.on('connect', function () { 
        if (localStorage.getItem('booth_pass') && localStorage.getItem('booth_code')) handlerAuthenticate()
    })
    socket.on('queue-updated', handlerGetAllQueues);
    socket.on('participant-updated', handlerGetAllQueues);
}

const handlerUnLoad = () => {
    
}

const Start = async () => {

    renderAuth()
}

// Services

const handlerAuthenticate = async () => {
    
    let inputBoothPass = document.getElementById('input-booth-pass').value
    let inputBoothCode = document.getElementById('input-booth-code').value
    const sBoothPass = localStorage.getItem('booth_pass')
    const sBoothCode = localStorage.getItem('booth_code')

    if (sBoothPass) inputBoothPass = sBoothPass
    if (sBoothCode) inputBoothCode = sBoothCode

    if (!inputBoothCode) return alert('Fill your Booth Code');
    if (!inputBoothPass) return alert('Fill your Booth Pass');

    const body = {
        "event_code": eventId,
        "booth_code": inputBoothCode?.toUpperCase(),
        "event_booth_pass": inputBoothPass,
        "socket_id": socket?.id
    }

    fetch('/api/signin/booth', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then( async res => {
        console.log(res)
        if (res?.statusCode == 200) {
            STATES.booth = res.data?.booth
            STATES.event = res.data?.event
            STATES.queue = res.data?.queue
            await handlerGetAllQueues()
            alert(`Sign Success! Welcome Booth ${inputBoothCode}`)
            localStorage.setItem('booth_pass', inputBoothPass)
            localStorage.setItem('booth_code', inputBoothCode)
        } else {
            localStorage.removeItem('booth_pass')
            localStorage.removeItem('booth_code')
            alert(res?.message)
        }
    }).catch(err => {
        console.log(err)
        alert(err)
    })
}

const handlerNextQueue = async () => {

    const body = {
        "booth_id": `${STATES.booth?.id}`,
    }

    fetch('/api/queue/next', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then( async res => {
        if (res?.statusCode == 200) {
            STATES.queue = res.data ?? null
            renderForm()
            await handlerGetAllQueues()
        } else alert(res?.message)
    }).catch(err => {
        console.log(err)
        alert(err)
    })
}

const handlerGetAllQueues = async () => {

    if (!(STATES.event?.id)) return

    await fetch(`/api/queue/${STATES.event?.id}`, { method: "GET" })
    .then(res => res.json())
    .then( async res => {
        if (res?.statusCode == 200) {
            STATES.queues = res.data
            renderScreen()
        } else alert(res?.message)
    }).catch(err => {
        console.log(err)
        alert(err)
    })
}

// Functions

// Renders

const createInput = (id, _label, width = "24em", value, disabled) => {

    const container = document.createElement("div")
    const input = document.createElement("input")
    const label = document.createElement("label")

    container.classList.add("form__group", "field")
    input.classList.add("form__field")
    label.classList.add("form__label")

    if (width) container.style.width = width
    if (disabled) input.disabled = true
    if (value) input.value = value

    input.id = id
    input.placeholder = _label
    input.name = id
    label.for = id
    input.type = "text"
    input.required = true
    label.textContent = _label

    container.appendChild(input)
    container.appendChild(label)


    return container
}

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

const renderAuth = () => {

    root.innerHTML = ''

    const container = document.createElement('div')
    const title = document.createElement('h1')
    const inputBoothPass = createInput("input-booth-pass", "Booth Pass")
    const inputBoothCode = createInput("input-booth-code", "Booth Code")
    const btnSign = document.createElement('button')

    title.classList.add('title-form', 'animate__heartBeat')
    btnSign.classList.add('button')

    title.textContent = "Fill Your Credentials"
    btnSign.textContent = "SUBMIT"

    btnSign.style.marginTop = "2em"
    container.style.display = 'flex'
    container.style.flex = 1
    container.style.flexDirection = 'column'
    container.style.alignItems = 'center'
    container.style.justifyContent = 'center'

    container.appendChild(title)
    container.appendChild(inputBoothPass)
    container.appendChild(inputBoothCode)
    container.appendChild(btnSign)

    btnSign.onclick = handlerAuthenticate

    root.appendChild(container)
}

const renderTable = () => {

    const tableContainer = document.getElementById('table-container')
    const title = document.createElement('h1')

    if (!tableContainer) return

    const headers = ["Queue Code", "Serve By Booth"]

    const table = document.createElement('table')
    const thead = document.createElement('thead')
    const tbody = document.createElement('tbody')

    table.id = "table-queues"

    title.classList.add('title-form')
    table.classList.add('table')
    thead.classList.add('table-head')
    tbody.classList.add('table-body')

    table.style.color = "white"

    title.textContent = "Queues"

    const trh = document.createElement('tr')
    for (let i = 0; i < headers.length; i++) {
        const th = document.createElement('th')
        th.textContent = headers[i]
        trh.appendChild(th)
    }
    thead.appendChild(trh)

    for (let i = 0; i < STATES.queues?.length; i++) {
        const tr = document.createElement('tr')
        for (let j = 0; j < headers.length; j++) {
            const td = document.createElement('td')
            const tdc = document.createElement("div")
            tdc.style.display = "flex"
            tdc.style.flexDirection = "row"
            tdc.style.alignItems = "center"
            switch (j) {
                case 0:
                    td.textContent = STATES.queues?.[i].queue_code
                    break
                case 1:
                    td.style.color = STATES.queues?.[i]?.serve_by_booth ? "green" : "gray"
                    td.textContent = STATES.queues?.[i]?.serve_by_booth ? STATES.queues?.[i]?.booth?.booth_code : "Waiting"
                    break
            }
            tr.appendChild(td)
        }
        tbody.appendChild(tr)
    }

    table.appendChild(thead)
    table.appendChild(tbody)

    tableContainer.innerHTML = ""
    tableContainer.appendChild(title)
    tableContainer.appendChild(table)

    $(document).ready(function() {
        $('#table-queues').DataTable();
    });
    $('#table-queues').DataTable({
        responsive: true,
        paging: false,
        searching: false,
        lengthChange: false,
        info: false,
        scrollY: tableContainer.clientHeight*.85
    } );
}

const renderForm = () => {
    
    const form = document.getElementById('form')

    if (!form) return

    const container = document.createElement('div')
    const title = document.createElement('h1')
    const inputQueueCode = createInput("input-queue-code", "Queue Code", "24em", STATES.queue?.queue_code ?? "", true)
    const inputName = createInput("input-name", "Name", "24em", STATES.queue?.name ?? "", true)
    const inputPhoneNumber = createInput("input-phone-number", "Phone Number", "24em", STATES.queue?.phone_number ?? "", true)
    const btnContainer = document.createElement('div')
    const btnCall = document.createElement('button')
    const btnNext = document.createElement('button')

    title.classList.add('title-form')
    btnCall.classList.add('button-green')
    btnNext.classList.add('button')

    container.style.display = "flex"
    container.style.flexDirection = "column"
    container.style.flex = 1

    btnContainer.style.display = "flex"
    btnContainer.style.flexDirection = "row"
    btnContainer.style.alignItems = "center"
    btnContainer.style.justifyContent = "flex-end"
    btnNext.style.fontSize = "14px"
    btnNext.style.padding = "12px 18px"
    btnNext.style.marginLeft = "18px"
    btnNext.style.marginRight = "6px"

    title.textContent = "Detail Queue"
    btnCall.textContent = "Call"
    btnNext.textContent = "Next Queue"

    if (STATES.queue != null) btnContainer.appendChild(btnCall)
    btnContainer.appendChild(btnNext)
    container.appendChild(inputQueueCode)
    container.appendChild(inputName)
    container.appendChild(inputPhoneNumber)
    form.innerHTML = ""
    form.appendChild(title)
    form.appendChild(container)
    form.appendChild(btnContainer)

    btnCall.onclick = () => socket?.emit(`call`, {booth_code: STATES.booth?.booth_code, queue_code: STATES.queue?.queue_code})
    btnNext.onclick = () => {
        let confirmed = confirm(!STATES.queue ? "Are you ready?" : 'Are you sure to complete this queue?')
        if (!confirmed) return
        handlerNextQueue()
    }
}

const renderScreen = () => {

    root.innerHTML = ''

    const header = document.createElement('div')
    const divider = document.createElement('div')
    const bodyContent = document.createElement('div')
    const tableContainer = document.createElement('div')
    const form = document.createElement('div')
    const logo = document.createElement('img')
    const titleWrapper = document.createElement('div')
    const title = document.createElement('h1')
    const btnLogout = createButton({
        ic: "bx-log-out-circle",
        onClick: async () => {
            await localStorage.removeItem('booth_pass');
            await localStorage.removeItem('booth_code');
            window.location.reload()
        },
    })

    header.classList.add('header')
    bodyContent.classList.add('body-content')
    logo.classList.add('logo')
    titleWrapper.classList.add('title-wrapper')
    tableContainer.classList.add('table-container')
    form.classList.add('form')

    divider.style.width = "2px"
    divider.style.borderRadius = "100px"
    divider.style.margin = "12px"
    divider.style.backgroundColor = "#7C7C7C"

    logo.src = '/icons/ic-ce.png'
    title.textContent = `Booth - ${STATES.booth?.booth_code}`

    tableContainer.id = "table-container"
    form.id = "form"

    titleWrapper.appendChild(title);

    header.appendChild(logo)
    header.appendChild(titleWrapper)
    header.appendChild(btnLogout)

    bodyContent.appendChild(tableContainer)
    bodyContent.appendChild(divider)
    bodyContent.appendChild(form)
    root.appendChild(header)
    root.appendChild(bodyContent)

    renderTable()
    renderForm()
}

// Register

window.addEventListener('load', handlerOnLoad)
window.addEventListener('unload', handlerUnLoad)

Start()