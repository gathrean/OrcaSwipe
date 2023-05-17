var modal = `
<div class="modal" tabindex="-1" id="pod-details">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Modal title</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Modal body text goes here.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn blue-button" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
`
$('body').append(modal);

const setup = () => {
    $('.see-details').on('click', function(e){
        var podName = $(this).attr('id');
        var pod = findPod(pods, podName);
        var tags = Object.keys(pod.tags);
        $('.modal-title').empty().append(podName);
        $('.modal-body').empty().append(`
            <span>Description</span>
            <ul>
                ${pod.eventDescription}
            </ul>
            <span>Tags</span>
            <ul>
                ${tags.map((tag) => {return `<li>${tag}</li>`}).join('')}
            </ul>
        `)
    })
}

function findPod(pods, podName){
    for (var i = 0; i < pods.length; i++){
        if (pods[i].name == podName){
            return pods[i];
        }
    }
    return null;
}

$(document).ready(setup);