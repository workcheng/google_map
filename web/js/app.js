var filterText = ko.observable("");
var map, infoWindow;
var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
url += '?' + $.param({
        'api-key': "1c8c883401bb42faafd24b774e918db8"
    })

var placesData = [{
    position: {lat: 21.023418, lng: 105.8516438},
    title: "Vietnamese Women's Museum"
},
    {
        position: {lat: 21.030708, lng: 105.852405},
        title: "Hoan Kiem Lake"
    },
    {
        position: {lat: 21.035302, lng: 105.849257},
        title: "Old Quarter"
    },
    {
        position: {lat: 21.036713, lng: 105.834731},
        title: "Ho Chi Minh Mausoleum"
    }
]


var Place = function (data) {
    var self = this;
    this.position = data.position;
    this.title = data.title;

    this.visible = ko.computed(function () {
        var re = filterText().toLowerCase();
        var placeName = self.title.toLowerCase();
        return (placeName.indexOf(re) != -1);
    });

    this.marker = new google.maps.Marker({
        position: self.position,
        title: self.title,
        animation: google.maps.Animation.DROP

    });

    google.maps.event.addListener(self.marker, "click", function () {
        //open infoWindow
        infoWindow.setContent(self.title)
        infoWindow.open(map, self.marker);

        if (self.marker.getAnimation() != null) {
            self.marker.setAnimation(null);
        } else {
            self.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                self.marker.setAnimation(null);
            }, 2000);
        }

        //ajax load data
        $.ajax({
            url: url + "&q＝" + self.title,
            dataType: "json",
            // method: 'GET',
            timeout: 5000
        }).done(function (data) {
            console.info(data)
            infoWindow.setContent(data.response.docs[0].snippet);
            infoWindow.open(map, self.marker)
        }).fail(function (err) {
            alert("加载api失败！");
        });
        ;
    })
}

var viewModel = function () {
    var self = this;
    this.placeList = [];

    placesData.forEach(function (place) {
        self.placeList.push(new Place(place))
    });

    this.placeList.forEach(function (place) {
        place.marker.setMap(map, place.position)
    });

    this.filteredList = ko.computed(function () {
        var result = [];
        self.placeList.forEach(function (place) {
            if (place.visible()) {
                result.push(place)
                place.marker.setMap(map, place.position)
            } else {
                place.marker.setMap(null);
            }
        });
        return result;
    });

    this.listClick = function (place) {
        google.maps.event.trigger(place.marker, "click");
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {center: placesData[1].position, zoom: 13})
    infoWindow = new google.maps.InfoWindow();
    ko.applyBindings(new viewModel());
}

