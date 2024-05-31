const root = document.getElementById('root')

const renderLanding = () => {
    
    const wrapper = document.createElement('div')
    const title = document.createElement('h1')
    const btnAdmin = document.createElement('button')
    const btnCounter = document.createElement('button')
    const btnBooth = document.createElement('button')

    wrapper.classList.add('column')
    title.classList.add('animate__heartBeat')
    btnAdmin.classList.add('btn')
    btnCounter.classList.add('btn')
    btnBooth.classList.add('btn')

    title.style.color = "white"
    title.style.marginBottom = "2em"
    title.style.fontSize = "3em"

    title.textContent = "Wich you are ?"
    btnAdmin.textContent = "ADMIN"
    btnCounter.textContent = "COUNTER"
    btnBooth.textContent = "BOOTH"
    
    wrapper.appendChild(title)
    wrapper.appendChild(btnAdmin)
    wrapper.appendChild(btnCounter)
    wrapper.appendChild(btnBooth)
    root.appendChild(wrapper)

    btnAdmin.onclick = () => window.location.href = "/admin"
    btnCounter.onclick = () => window.location.href = "/counter"
    btnBooth.onclick = () => window.location.href = "/booth"

}

renderLanding()