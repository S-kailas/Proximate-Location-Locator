// ================= CONFIG =================
const BASE_URL = "http://Localhost:8000"   // 
// =========================================


// Initialize map
let map = L.map('map').setView([8.54, 76.90], 12)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map)

let markers = []
let polylines = []


// Clear map
function clearMap() {
    markers.forEach(m => map.removeLayer(m))
    polylines.forEach(p => map.removeLayer(p))

    markers = []
    polylines = []
}


// Upload file
async function uploadFile() {

    const fileInput = document.getElementById("excelFile")
    const radiusInput = document.getElementById("radius")

    if (!fileInput || !fileInput.files.length) {
        alert("Upload Excel File")
        return
    }

    // -------- SAFE RADIUS PARSE --------
    let radius = 3

    if (radiusInput && radiusInput.value.trim() !== "") {
        const parsed = parseFloat(radiusInput.value)
        if (!isNaN(parsed)) {
            radius = parsed
        }
    }

    console.log("Sending radius:", radius)

    // -------- FORM DATA --------
    const formData = new FormData()
    formData.append("file", fileInput.files[0])
    formData.append("radius", radius.toString())   

    try {

        const response = await fetch(`${BASE_URL}/upload`, {
            method: "POST",
            body: formData
        })

        if (!response.ok) {
            alert("Upload failed")
            return
        }

        const data = await response.json()

        if (!data.clusters) {
            alert("Invalid response from server")
            return
        }

        displayClusters(data.clusters)

    } catch (error) {
        console.error(error)
        alert("Server error")
    }
}


// Display clusters
function displayClusters(clusters) {

    clearMap()

    const colors = ["red", "blue", "green", "orange", "purple", "black"]

    let allPoints = []

    clusters.forEach((cluster, index) => {

        const color = colors[index % colors.length]

        // ---------- MARKERS ----------
        cluster.points.forEach(p => {

            const latlng = [p.lat, p.lng]

            const marker = L.circleMarker(latlng, {
                radius: 8,
                color: color,
                fillColor: color,
                fillOpacity: 0.8
            }).addTo(map)

            marker.bindPopup(`Cluster ${cluster.cluster_id}<br>Order: ${p.order}`)

            markers.push(marker)
            allPoints.push(latlng)
        })

        // ---------- ROUTE ----------
        if (cluster.geometry && cluster.geometry.length > 0) {

            const polyline = L.polyline(cluster.geometry, {
                color: color,
                weight: 4
            }).addTo(map)

            polylines.push(polyline)

        } else {

            const fallback = cluster.points
                .sort((a, b) => a.order - b.order)
                .map(p => [p.lat, p.lng])

            const polyline = L.polyline(fallback, {
                color: color,
                dashArray: "5,5",
                weight: 3
            }).addTo(map)

            polylines.push(polyline)
        }

    })

    // ---------- AUTO ZOOM ----------
    if (allPoints.length > 0) {
        map.fitBounds(allPoints)
    }
}


// Download Excel
function downloadExcel() {
    window.open(`${BASE_URL}/download`)
}
