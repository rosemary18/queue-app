// States

const root = document.getElementById('root')
const eventId = window.location.pathname.split('/')[2]
const STATES = {
    event: {},
    counter: {},
    participants: [],
    participant: null,
    socket_id: ''
}

// Cycles

const handlerOnLoad = () => {
    
    const socket = io();

    socket.on('connect', function () {
        STATES.socket_id = socket.id
        if (localStorage.getItem('counter_pass') && localStorage.getItem('counter_code')) handlerAuthenticate()
    });
    socket.on('queue-updated', handlerGetEvent);
    socket.on('event-updated', handlerGetEvent);
    socket.on('participant-updated', handlerGetEvent);
}

const handlerUnLoad = () => {
    
}

const Start = async () => {
    renderAuth()
}

// Services

const handlerAuthenticate = async () => {
    
    let inputCounterPass = document.getElementById('input-counter-pass')?.value
    let inputCounterCode = document.getElementById('input-counter-code')?.value
    const sCounterPass = localStorage.getItem('counter_pass')
    const sCounterCode = localStorage.getItem('counter_code')

    if (sCounterPass) inputCounterPass = sCounterPass
    if (sCounterCode) inputCounterCode = sCounterCode

    if (!inputCounterCode) return alert('Fill your Counter Code');
    if (!inputCounterPass) return alert('Fill your Counter Pass');

    const body = {
        "event_code": eventId,
        "counter_code": inputCounterCode?.toUpperCase(),
        "event_counter_pass": inputCounterPass,
        "socket_id": STATES.socket_id
    }

    console.log(body)

    fetch('/api/signin/counter', {
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
            STATES.counter = res.data?.counter
            STATES.event = res.data?.event
            await handlerGetParticipants()
            alert(`Sign Success! Welcome Registration ${inputCounterCode}`)
            renderScreen()
            localStorage.setItem('counter_pass', inputCounterPass)
            localStorage.setItem('counter_code', inputCounterCode)
        } else {
            localStorage.removeItem('counter_pass')
            localStorage.removeItem('counter_code')
            alert(res?.message)
        }
    }).catch(err => {
        console.log(err)
        alert(err)
    })
}

const handlerGetParticipants = async () => {

    if (STATES.counter) {
        await fetch(`/api/participant/event/${STATES.event?.id}`, { method: 'GET' })
        .then(res => res.json())
        .then( async res => {
            if (res?.statusCode == 200) {
                STATES.participants = res?.data || []
                renderTable()
            }
        }).catch(err => {
            console.log(err)
            alert(err)
        })
    }
}

const handlerGetEvent = async () => {

    if (STATES.event?.id) {

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
                handlerGetParticipants()
            }
        })
    }

}

const handlerAddParticipant = () => {

    const inputName = document.getElementById('input-name')
    const inputPhoneNumber = document.getElementById('input-phone-number')

    if (!inputName.value) return alert('Fill Participant Name!');
    if (!inputPhoneNumber.value) return alert('Fill Phone Number');

    const body = {
        "counter_id": `${STATES.counter?.id}`,
        "name": inputName.value,
        "phone_number": inputPhoneNumber.value
    }

    fetch('/api/participant/add', {
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
            alert(`New queue added!`)
            await handlerGetParticipants()
            renderScreen()
        } else alert(res?.message)
    }).catch(err => {
        console.log(err)
        alert(err)
    })
}

const handlerUpdateParticipant = (back_to_queue) => {

    const inputName = document.getElementById('input-name')
    const inputPhoneNumber = document.getElementById('input-phone-number')

    if (!inputName.value) return alert('Fill Participant Name!');
    if (!inputPhoneNumber.value) return alert('Fill Phone Number');

    const body = {
        "name": inputName.value,
        "phone_number": inputPhoneNumber.value
    }

    if (back_to_queue) body.status = 0

    fetch(`/api/participant/update/${STATES.participant?.id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then( async res => {
        if (res?.statusCode == 200) {
            alert(`Queues ${STATES.participant?.queue_code} Updated!`)
            STATES.participant = null
            await handlerGetParticipants()
            renderScreen()
        } else alert(res?.message)
    }).catch(err => {
        console.log(err)
        alert(err)
    })
}

const handlerResendWa = (id) => {
    return () => {
        fetch(`/api/participant/resend-wa/${STATES.participants[id]?.id}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(res => {
            alert(res.message)
        })
    }
}

const handlerDeleteParticipant = (id) => {
    return () => {

        let confirmed = confirm(`Are you sure you want to delete queue ${STATES.participants[id]?.queue_code}?`)

        if (!confirmed) return
        
        fetch(`/api/participant/delete/${STATES.participants[id]?.id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(async res => {
            if (res.statusCode == 200) {
                if (STATES.participants[id]?.id == STATES.participant?.id) STATES.participant = null
                await handlerGetParticipants()
                renderForm()
            }
            alert(res.message)
        })
    }
}

// Functions

const handlerGetNextQueue = () => {
    let queue = STATES.counter?.counter_code?.charAt(0)
    if (STATES.participants?.length > 0) {
        let x = STATES.participants[0]?.queue_code?.substring(1)
        queue += `000${(parseInt(x) + 1).toString()}`.slice(-3)
    } else queue += "001".substring()
    return queue
}

// Renders

const createInput = (id, _label, width = "24em", value, disabled) => {

    const container = document.createElement("div")
    const input = document.createElement("input")
    const label = document.createElement("label")

    container.classList.add("form__group", "field")
    input.classList.add("form__field")
    label.classList.add("form__label")

    if (width) container.style.width = width
    if (disabled) {
        input.disabled = true
        input.style.borderBottom = "0px"
    }
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
    const inputCounterPass = createInput("input-counter-pass", "Registration Pass")
    const inputCounterCode = createInput("input-counter-code", "Registration Code")
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
    container.appendChild(inputCounterPass)
    container.appendChild(inputCounterCode)
    container.appendChild(btnSign)

    btnSign.onclick = handlerAuthenticate

    root.appendChild(container)
}

const renderTable = () => {

    const tableContainer = document.getElementById('table-container')

    if (!tableContainer) return

    const headers = ["No", "Name", "Queue Code", "Phone Number", "Whatsapp Sent", "Status", "Action"]

    const table = document.createElement('table')
    const thead = document.createElement('thead')
    const tbody = document.createElement('tbody')

    table.id = "table-participants"

    table.classList.add('table')
    thead.classList.add('table-head')
    tbody.classList.add('table-body')

    table.style.color = "white"

    const trh = document.createElement('tr')
    for (let i = 0; i < headers.length; i++) {
        const th = document.createElement('th')
        th.textContent = headers[i]
        trh.appendChild(th)
    }
    thead.appendChild(trh)

    for (let i = 0; i < STATES.participants?.length; i++) {
        const tr = document.createElement('tr')
        const participant = STATES.participants?.[i]
        for (let j = 0; j < headers.length; j++) {
            const td = document.createElement('td')
            const tdc = document.createElement("div")
            tdc.style.display = "flex"
            tdc.style.flexDirection = "row"
            tdc.style.alignItems = "center"
            switch (j) {
                case 0:
                    td.textContent = `${i + 1}`
                    break
                case 1:
                    td.textContent = participant.name
                    break
                case 2:
                    td.textContent = participant.queue_code
                    break
                case 3:
                    td.textContent = participant.phone_number
                    break
                case 4:
                    const text = document.createElement("p")
                    const btnResend = createButton({ic: "bx-sync", onClick: handlerResendWa(i)})
                    text.style.color = participant.wa_sent_status == 1 ? "green" : "gray"
                    text.textContent = participant.wa_sent_status == 1 ? "Sent" : "Not Sent"
                    tdc.appendChild(text)
                    tdc.appendChild(btnResend)
                    td.appendChild(tdc)
                    break
                case 5:
                    td.style.color = (participant?.status == 2 || !participant.serve_by_booth) ? "gray" : participant.status == 0 ? "green" : "white"
                    td.textContent = participant?.status == 2 ? "Skipped" : !participant.serve_by_booth ? "Waiting" : participant.status == 0 ? "Being Served" : "Served"
                    break
                case 6:
                    const btnEdit = createButton({
                        ic: "bx-edit",
                        active: STATES.participants[i]?.id == STATES.participant?.id,
                        onClick: () => {
                            if (STATES.participant == null) {
                                const confirmed = confirm("Are you sure you want to edit this participant?")
                                if (!confirmed) return
                                STATES.participant = STATES.participants[i]
                            } else {
                                STATES.participant = null
                            }
                            renderScreen()
                        }
                    })
                    const btnDelete = createButton({ic: "bx-x", color: "red", backgroundColor: "#FF000035", onClick: handlerDeleteParticipant(i)})
                    tdc.appendChild(btnEdit)
                    if (!(participant.serve_by_booth)) tdc.appendChild(btnDelete)
                    td.appendChild(tdc)
                    break
            }
            tr.appendChild(td)
        }
        tbody.appendChild(tr)
    }

    table.appendChild(thead)
    table.appendChild(tbody)

    tableContainer.innerHTML = ""
    tableContainer.appendChild(table)

    $(document).ready(function() {
        $('#table-participants').DataTable();
    });
    $('#table-participants').DataTable({
        responsive: true,
        paging: true,
        scrollY: tableContainer.clientHeight*.8
    } );
}

const renderForm = () => {
    
    const form = document.getElementById('form')

    if (!form) return

    const container = document.createElement('div')
    const title = document.createElement('h1')
    const inputQueueCode = createInput("input-queue-code", "Queue Code", "24em", STATES.participant?.queue_code, true)
    const inputName = createInput("input-name", "Name", "24em", STATES.participant?.name ?? "")
    const inputPhoneNumber = createInput("input-phone-number", "Phone Number", "24em", STATES.participant?.phone_number ?? "62")
    const btnContainer = document.createElement('div')
    const btnCancel = document.createElement('button')
    const btnBackToQueue = document.createElement('button')
    const btnSubmit = document.createElement('button')

    title.classList.add('title-form')
    btnCancel.classList.add('button-blue')
    btnBackToQueue.classList.add('button-blue')
    btnSubmit.classList.add('button')

    container.style.display = "flex"
    container.style.flexDirection = "column"
    container.style.flex = 1

    btnContainer.style.display = "flex"
    btnContainer.style.flexDirection = "row"
    btnContainer.style.alignItems = "center"
    btnContainer.style.justifyContent = "flex-end"
    btnSubmit.style.fontSize = "14px"
    btnSubmit.style.padding = "12px 18px"
    btnSubmit.style.marginLeft = "18px"
    btnSubmit.style.marginRight = "6px"

    title.textContent = "Form Queues"
    btnCancel.textContent = "Cancel"
    btnBackToQueue.textContent = "Back to Queue"
    btnSubmit.textContent = STATES.participant != null ? "EDIT" : "SUBMIT"

    if (STATES.participant != null) {
        btnContainer.appendChild(btnCancel)
        if (STATES.participant?.status == 2) btnContainer.appendChild(btnBackToQueue)
    }
    btnContainer.appendChild(btnSubmit)
    if (STATES.participant != null) container.appendChild(inputQueueCode)
    container.appendChild(inputName)
    container.appendChild(inputPhoneNumber)
    form.innerHTML = ""
    form.appendChild(title)
    form.appendChild(container)
    form.appendChild(btnContainer)

    btnCancel.onclick = () => {
        STATES.participant = null
        renderScreen()
    }
    btnBackToQueue.onclick = () => {
        let confirmed = confirm(`Are you sure to bring back queue ${STATES.participant?.queue_code} to queues ?`)
        if (!confirmed) return
        handlerUpdateParticipant(true)
    }
    btnSubmit.onclick = () => {
        if (STATES.participant != null) handlerUpdateParticipant()
        else handlerAddParticipant()
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
            await localStorage.removeItem('counter_pass');
            await localStorage.removeItem('counter_code');
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
    title.textContent = `Registration - ${STATES.counter?.counter_code}`

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