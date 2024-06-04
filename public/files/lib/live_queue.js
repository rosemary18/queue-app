// States

const socket = io();
const root = document.getElementById('root')
const soundCalls = {
    "a": document.getElementById('s-call-1'),
    "b": document.getElementById('s-call-2'),
    "c": document.getElementById('s-call-3'),
}
const soundChars = {
    "a": document.getElementById('s-a'),
    "b": document.getElementById('s-b'),
    "c": document.getElementById('s-c'),
    "d": document.getElementById('s-d'),
    "e": document.getElementById('s-e'),
    "f": document.getElementById('s-f'),
    "g": document.getElementById('s-g'),
    "h": document.getElementById('s-h'),
    "i": document.getElementById('s-i'),
    "j": document.getElementById('s-j'),
    "k": document.getElementById('s-k'),
    "l": document.getElementById('s-l'),
    "m": document.getElementById('s-m'),
    "n": document.getElementById('s-n'),
    "o": document.getElementById('s-o'),
    "p": document.getElementById('s-p'),
    "q": document.getElementById('s-q'),
    "r": document.getElementById('s-r'),
    "s": document.getElementById('s-s'),
    "t": document.getElementById('s-t'),
    "u": document.getElementById('s-u'),
    "v": document.getElementById('s-v'),
    "w": document.getElementById('s-w'),
    "x": document.getElementById('s-x'),
    "y": document.getElementById('s-y'),
    "z": document.getElementById('s-z'),
}
const soundNumerics = {
    "0": document.getElementById('s-0'),
    "1": document.getElementById('s-1'),
    "2": document.getElementById('s-2'),
    "3": document.getElementById('s-3'),
    "4": document.getElementById('s-4'),
    "5": document.getElementById('s-5'),
    "6": document.getElementById('s-6'),
    "7": document.getElementById('s-7'),
    "8": document.getElementById('s-8'),
    "9": document.getElementById('s-9'),
}

const STATES = {
    event: {},
    queues: [],
    speaking: false
}

// Cycles

const handlerOnLoad = () => {
    
    socket.on('connect', function () {
        STATES.socket_id = socket.id
    });
    socket.on('call', handlerSpeak);

    socket.on('participant-updated', handlerGetEvent);
    socket.on('queue-updated', handlerGetEvent);
    socket.on('event-updated', handlerGetEvent);
    socket.on('booth-signed', handlerGetEvent);
}

const handlerUnLoad = () => {
    
}

const Start = async () => {
    
    handlerGetEvent()
    renderScreen()
}

// Services

const handlerGetEvent = async () => {

    console.log("Get event ...")

   fetch(`/api/event/code/${window.location.pathname.split('/')[2]}`)
    .then(res => res.json())
    .then(res => {
        STATES.event = res?.data
        handlerGetAllQueues()
    })
}

const handlerGetAllQueues = async () => {

    if (!STATES.event?.id) return

   fetch(`/api/queue/${STATES.event?.id}`)
    .then(res => res.json())
    .then(res => {
        STATES.queues = res?.data
        renderScreen()
    })
}

// Functions

const playSounds = async (sounds) => { 
    if (sounds?.length > 0) {

        let play = false
        
        await new Promise(resolve => {
            sounds[0]?.play()
            sounds[0]?.addEventListener('ended', () => {
                play = true
                resolve()
            })
        }) 

        if (play) {
            sounds.shift()
            setTimeout(() => playSounds(sounds), 250)
        }
    } else STATES.speaking = false
}

const handlerSpeak = (data) => {

    if (STATES.speaking) return

    STATES.speaking = true

    const plays = [soundCalls["a"]]
    const queue_codes = data?.queue_code?.split('') || []
    const booth_codes = data?.booth_code?.split('') || []

    for (let i = 0; i < queue_codes?.length; i++) {
        const code = queue_codes[i];
        if (Object.keys(soundChars).includes(code?.toLowerCase())) plays.push(soundChars[code?.toLowerCase()])
        if (Object.keys(soundNumerics).includes(code)) plays.push(soundNumerics[code])
    }

    plays.push(soundCalls["b"])
    plays.push(soundCalls["c"])

    for (let j = 0; j < booth_codes?.length; j++) {
        const code = booth_codes[j];
        if (Object.keys(soundChars).includes(code?.toLowerCase())) plays.push(soundChars[code?.toLowerCase()])
        if (Object.keys(soundNumerics).includes(code)) plays.push(soundNumerics[code])
    }

    playSounds(plays)
}

// Renders

const renderScreen = () => {

    const content = document.createElement('div')
    const leftContent = document.createElement('div')
    const rightContent = document.createElement('div')
    const marqueeContainer = document.createElement('div')
    const marqueeContent = document.createElement('div')
    const gridContainer = document.createElement('div')
    const rightTopContent = document.createElement('div')
    const rightBottomContent = document.createElement('div')
    const listMask = document.createElement('div')
    const imgImigration = document.createElement('img')
    const imgImifest = document.createElement('img')

    const containerImifest = document.createElement('div')
    const titleImi1 = document.createElement('h1')
    const titleImi2 = document.createElement('h1')
    const titleDescImi1 = document.createElement('p')
    const titleDescImi2 = document.createElement('p')

    imgImigration.src = '/images/img-imigration.png'
    imgImifest.src = '/icons/ic-app.png'

    gridContainer.classList.add('grid-container')
    leftContent.classList.add('left-content')
    rightContent.classList.add('right-content')
    content.classList.add('content')
    marqueeContent.classList.add('marquee-content')
    marqueeContainer.classList.add('marquee-container')
    rightTopContent.classList.add('right-top-content')
    rightBottomContent.classList.add('right-bottom-content')
    listMask.classList.add('list-mask', 'mask')
    imgImifest.classList.add('img-imifest')
    imgImigration.classList.add('img-imigration')

    containerImifest.classList.add('container-imifest')
    titleImi1.classList.add('title-imi-1')
    titleImi2.classList.add('title-imi-2')
    titleDescImi1.classList.add('title-desc-imi-1')
    titleDescImi2.classList.add('title-desc-imi-2')

    for (let i = 0; i < 20; i++) {

        const booth = STATES.event?.booths?.[i] || null
        const queue = booth ? STATES.queues?.find(queue => queue?.serve_by_booth == booth?.id) || null : null

        const gridItem = document.createElement('div')
        const top = document.createElement('div')
        const bottom = document.createElement('div')
        const titleTop = document.createElement('p')
        const titleBottom = document.createElement('p')
        const titleQueueNo = document.createElement('p')
        const titleBoothNo = document.createElement('p')

        gridItem.classList.add('grid-item')
        top.classList.add('booth-top')
        bottom.classList.add('booth-bottom')
        titleTop.classList.add('booth-title-top')
        titleBottom.classList.add('booth-title-bottom')
        titleQueueNo.classList.add('booth-queue-no')
        titleBoothNo.classList.add('booth-booth-no')

        titleTop.textContent = "ANTRIAN"
        titleBottom.textContent = "BOOTH"
        titleQueueNo.textContent = queue?.queue_code || `-`
        titleBoothNo.textContent = booth?.booth_code || `-`

        top.appendChild(titleTop)
        top.appendChild(titleQueueNo)
        bottom.appendChild(titleBottom)
        bottom.appendChild(titleBoothNo)
        gridItem.appendChild(top)
        gridItem.appendChild(bottom)
        gridContainer.appendChild(gridItem)
    }

    const headers = document.createElement('div')
    const row1 = document.createElement('p')
    const row2 = document.createElement('p')

    headers.classList.add('queue-header')

    row1.textContent = "ANTRIAN"
    row2.textContent = "BOOTH"

    headers.appendChild(row1)
    headers.appendChild(row2)
    listMask.appendChild(headers)

    for (let j = 0; j < STATES.queues?.length; j++) {

        const queue = document.createElement('div')
        const title = document.createElement('div')
        const queueTitle = document.createElement('p')
        const ic = document.createElement('i')
        const boothTitle = document.createElement('p')

        queue.classList.add('queue-container')
        if (STATES.queues[j]?.serve_by_booth) ic.classList.add('bx', 'bx-chevron-right', 'bx-md')
        else ic.classList.add('bx', 'bx-chevron-up', 'bx-md')
        ic.style.color = '#0B4E9B'

        title.style.display = 'flex'
        title.style.flexDirection = 'row'
        title.style.alignItems = 'center'

        queueTitle.textContent = STATES.queues[j]?.queue_code
        boothTitle.textContent = STATES.queues[j]?.booth?.booth_code ?? ""
        
        title.appendChild(ic)
        title.appendChild(queueTitle)
        queue.appendChild(title)
        if (STATES.queues[j]?.serve_by_booth) queue.appendChild(boothTitle)
        listMask.appendChild(queue)
    }

    root.innerHTML = ''
    marqueeContent.textContent = `
        PERATURAN ANTRIAN PASPOR :
        ⁠PESERTA MENUJU REGISTRASI
        ATAU PRA LAYANAN PASPOR
        • PESERTA MEMBERIKAN INFO NAMA LENGKAP
        NO TLP/WHATSSAPP DAN INFO LAINNYA
        • PESERTA MENDAPATKAN DIGITAL TICKET 
        VIA WHATSSAPP.
        • PESERTA MENUNGGU ANTRIAN DI TEMPAT 
        DUDUK YANG DISEDIAKAN.
        • PESERTA MEMPERHATIKAN MONITOR ANTRIAN DAN ARAHAN PETUGAS
        • PESERTA MENDAPATKAN PELAYANAN PEMBUATAN
        PASPOR.
    `

    titleImi1.textContent = "LAYANAN"
    titleImi2.textContent = "ANTRIAN PASPOR"
    titleDescImi1.textContent = "DITJEN IMIGRASI"
    titleDescImi2.textContent = "@2024 Allrigths Reserved"

    rightBottomContent.appendChild(listMask)
    containerImifest.appendChild(titleImi1)
    containerImifest.appendChild(titleImi2)
    containerImifest.appendChild(titleDescImi1)
    containerImifest.appendChild(titleDescImi2)
    rightTopContent.appendChild(imgImigration)
    rightTopContent.appendChild(imgImifest)
    rightTopContent.appendChild(containerImifest)
    leftContent.appendChild(gridContainer)
    rightContent.appendChild(rightTopContent)
    rightContent.appendChild(rightBottomContent)
    content.appendChild(leftContent)
    content.appendChild(rightContent)
    marqueeContainer.appendChild(marqueeContent)
    root.appendChild(content)
    root.appendChild(marqueeContainer)
}

// Register

window.addEventListener('load', handlerOnLoad)
window.addEventListener('unload', handlerUnLoad)

Start()