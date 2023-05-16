var map = L.map('map');
map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var targetPin = undefined;

map.on('click', (e) => {
    if (targetPin != undefined) {
        map.removeLayer(targetPin)
    }
    targetPin = L.marker(e.latlng).addTo(map);
    targetPin.bindPopup("<b>Pod Location</b>").openPopup();
    $('#lat').val(e.latlng.lat);
    $('#lng').val(e.latlng.lng);
})