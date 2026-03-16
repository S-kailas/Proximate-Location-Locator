let map = L.map('map').setView([8.54,76.90],12)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map)

let markers = []

function clearMarkers(){

markers.forEach(m => map.removeLayer(m))
markers = []

}

async function uploadFile(){

let fileInput = document.getElementById("excelFile")

if(!fileInput.files.length){

alert("Upload Excel File")
return

}

let formData = new FormData()

formData.append("file",fileInput.files[0])

let response = await fetch("http://localhost:8000/upload",{

method:"POST",
body:formData

})

let data = await response.json()

displayClusters(data.clusters)

}

function displayClusters(locations){

clearMarkers()

let colors = [
"red",
"blue",
"green",
"orange",
"purple",
"black"
]

locations.forEach(loc => {

let color = colors[loc.cluster % colors.length]

let marker = L.circleMarker([loc.lat,loc.lng],{

radius:8,
color:color,
fillColor:color,
fillOpacity:0.8

}).addTo(map)

marker.bindPopup("Cluster: "+loc.cluster)

markers.push(marker)

})

}

function downloadExcel(){

window.open("http://localhost:8000/download")

}
