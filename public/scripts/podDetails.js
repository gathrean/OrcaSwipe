var modal = `
<div class="modal" tabindex="-1" id="pod-details">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Modal title</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn blue-button" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>`
$('body').append(modal);

var mapCSS = `
<style>
        #map {
            width: 80vw;
            max-width: 90%;
            height: 40vh;
            margin: 0 auto;
        }
</style>`
$('body').append(mapCSS);



const setup = () => {
    $('.see-details').on('click', function (e) {
        var podName = $(this).attr('id');
        var pod = findPod(pods, podName);
        var tags = Object.keys(pod.tags);
        for (var i = 0; i < tags.length; i++) {
            if (!pod.tags[tags[i]]) {
                tags.splice(i, 1);
                i--;
            }
        }
        $('.modal-title').empty().append(`<b>${podName}<b>`);
        $('.modal-body').empty().append(`
            <div><b>Description</b></div>
            <div>${pod.eventDescription}</div>
            <br>
            <div><b>Tags</b></div>
            <ul>
                ${tags.map((tag) => { return `<li>${tag}</li>` }).join('')}
            </ul>
            <div><b>Location</b></div>
            <div id="map"></div>
        `)
        var location = L.latLng(pod.location.lat, pod.location.lng);
        var map = L.map('map').setView(location, 16);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        var targetPin;
        if (targetPin != undefined) {
            map.removeLayer(targetPin)
        }
        targetPin = L.marker(location).addTo(map);
    })

}

function findPod(pods, podName) {
    for (var i = 0; i < pods.length; i++) {
        if (pods[i].name == podName) {
            return pods[i];
        }
    }
    return null;
}

$(document).ready(setup);