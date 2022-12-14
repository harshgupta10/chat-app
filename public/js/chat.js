const socket = io()
// Elements

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username , room}=Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () =>{
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight- newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageMargin)
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a,MMM Do')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username:message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a,MMM Do')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData',({room,users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value



    socket.emit('sendMessage', message, (message) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus();

        console.log(message)
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})


socket.emit('join',{username , room}, (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
})