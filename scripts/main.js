const API_KEY = "WBNsYIjlICGeGp91mrUwRasjA6KwIrZm"
const START_DATE_KEY = 'startDateTime'
const END_DATE_KEY = 'endDateTime'
const PROXY_URL = "https://cors-anywhere.herokuapp.com/"
const BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json"

var now = new Date()
var formattedDate = formatDate(now)
document.getElementById(START_DATE_KEY).value = formattedDate
document.getElementById(END_DATE_KEY).value = formattedDate
var events = []

const btn = document.querySelector('button');
addOrUpdateEvents()

function addOrUpdateEvents() {
    var eventList = document.getElementById('eventList')
    var listBody = document.createElement('tbody')
    listBody.appendChild(createTableHeader())
    events.flatMap(function (event) {
        return createListCells(event)
    }).forEach(function (row) {
        listBody.appendChild(row)
    })
    if (eventList == undefined) {
        eventList = document.createElement('table')
        eventList.setAttribute("border","1")
        eventList.setAttribute("width","100%")
        eventList.setAttribute("cellpadiing", "5")
        eventList.id = "eventList"
        eventList.appendChild(listBody)
        var body = document.getElementsByTagName('body')[0]
        body.appendChild(eventList)
    } else {
        eventList.replaceChild(listBody, eventList.firstChild)
    }
}

function createTableHeader() {
    var header = document.createElement('tr')
    var properties = ["Название", "Информация", "Город", "Адрес", "Дата начала", "Дата окончания", "Время"]
    properties.forEach(property => {
        var headerCell = document.createElement("th")
        var cellText = document.createTextNode(property)
        headerCell.appendChild(cellText)
        header.appendChild(headerCell)
    })
    return header
}

function formatDate(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

function addTimezone(date) {
    return date + 'T00:00:00Z'
}

var responseHandler = function handleResponse(response) {
    console.log(response)
    var events = JSON.parse(response)._embedded.events
    this.events = events
    addOrUpdateEvents()
}

function createListCells(event) {
    var rows = []
    event._embedded?.venues.forEach(venue => {
        var row = document.createElement("tr")
        var venues = event._embedded.venues
        var properties = [event.name, event.info || "Нет информации", 
                          venue.city.name, venue.address.line1, event.dates.start.localDate, 
                          event.dates.end?.localDate || "Неизвестно",
                          event.dates.start.localTime || "Неизвестно"]
        properties.forEach(property => {
            var cell = document.createElement("td")
            var cellText = document.createTextNode(property)
            cell.appendChild(cellText)
            row.appendChild(cell)
            rows.push(row)
        })
    })
    return rows
}

var sendData = function () {
    const XHR = new XMLHttpRequest();


    var url = new URL(BASE_URL)

    let startDate = document.getElementById(START_DATE_KEY).value
    let endDate = document.getElementById(END_DATE_KEY).value

    url.searchParams.set(START_DATE_KEY, addTimezone(startDate))
    url.searchParams.set(END_DATE_KEY, addTimezone(endDate))
    url.searchParams.set('apikey', encodeURIComponent(API_KEY))

    // Define what happens in case of error
    XHR.onload = function () {
        if (this.status != 200) {
            return
        }
        responseHandler(this.response)
    }

    XHR.onerror = function () {
        let error = 'Did receice error!\n' + 'Code: ' + this.status + '\n' + 'Message: ' + this.statusText
        alert(error)
    }

    // Set up our request
    XHR.open('GET', PROXY_URL + url.toString());
    XHR.setRequestHeader("Access-Control-Allow-Origin", "*")

    // Finally, send our data.
    XHR.send();
    console.log('Did start request: ' + url.toString());
}

btn.addEventListener('click', sendData)
