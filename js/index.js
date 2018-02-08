"use strict";

paper.install(window);

$(document).ready(function(){
    $('.parallax').parallax();
    $('.collapsible').collapsible();
    $('select').material_select();
    editPhoto();
});


$('#photo_selector_color').change(function () {
    paper.clear();
    $('#canvas').remove();
    //paper.setup('canvas');
    var text = $("#photo_selector_color option:selected").text();
    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas');
    //canvas.setAttribute('background-image', 'url("../img/main_image.jpg")')
    //console.log(canvas);
    var img = document.createElement('img');
    img.src = '../img/' + text + '.jpg';
    img.setAttribute('id', 'img1');
    canvas.appendChild(img);
    $('#dynamic_canvas_container_color').append(canvas);
    paper.setup('canvas');
    sampleColor();
});

function sampleColor() {
    var raster = new Raster('img1');

    var layer1 = new paper.Layer();
    var raster1 = new Raster('img1');
    raster.opacity = 0.5;
    raster1.opacity = 0.7;

    raster.position = view.center;
    raster.scale(0.4);
    raster1.position = view.center;
    raster1.scale(0.4);
    layer1.addChild(raster1);



    raster.visible = false;

    var colors = [];

    document.getElementById('clear_color').addEventListener('click', function () {
        paper.clear();
        $('#canvas').remove();

        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'canvas');

        $('#dynamic_canvas_container_color').append(canvas);
    });

    var layer = new Layer();

    raster.opacity = 0.5;

    var radius = 60;

    document.getElementById('range').addEventListener('input', function (obj) {
        radius = this.value;
    });

    var tool = new Tool();
    tool.fixedDistance = 25;


    tool.onMouseMove = function (event){
        var path = new paper.Path.Circle({
            center: event.middlePoint,
            radius: radius/5,
            strokeColor: 'white'
        });
        var color = raster.getAverageColor(path);

        var obj = new Object();
        obj.red =  color._components[0]*255;
        obj.green = color._components[1]*255;
        obj.blue = color._components[2]*255;
        path.fillColor = raster.getAverageColor(path);
        colors.push(obj);
    }


}

$('#photo_selector_pixel').change(function () {
    paper.clear();
    $('#canvas').remove();

    var text = $("#photo_selector_pixel option:selected").text();
    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas');
    var img = document.createElement('img');

    img.src = '../img/' + text + '.jpg';
    img.setAttribute('id', 'img1');

    canvas.appendChild(img);
    $('#dynamic_canvas_container_pixel').append(canvas);
    paper.setup('canvas');

    pixelate();
});

function pixelate() {
    var raster = new Raster('img1');

    raster.visible = false;

    var layer = new Layer();

    var tool = new Tool();
    tool.minDistance = 5;

    document.getElementById('stop').addEventListener('click', function (ev) {
        paper.clear();
        $('#canvas').remove();

        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'canvas');
        $('#dynamic_canvas_container_pixel').append(canvas);
    });


    tool.onMouseMove = function (event) {
        // Each drag event, iterate through the children of group:
        for (var i = 0; i < layer.children.length; i++) {
            var child = layer.children[i];
            var bounds = child.bounds;

            if (bounds.contains(event.point)) {
                // If the mouse position intersects with the bounding
                // box of the path, we're going to split it into two paths:

                var size = bounds.size;
                var isLandscape = size.width > size.height;

                // If the path is in landscape orientation, we're going to
                // split the path horizontally, otherwise vertically:
                if (isLandscape) {
                    size.width /= 2;
                } else {
                    size.height /= 2;
                }

                var topLeft = bounds.topLeft;

                var path = new paper.Path.Rectangle(topLeft, size.ceil());
                path.fillColor = raster.getAverageColor(path);
                /* view.draw(); */
                path.moveBelow(child);


                var secondPath = path.clone();
                size = size.floor();

                var delta = isLandscape
                    ? [size.width, 0]
                    : [0, size.height];
                secondPath.position = secondPath.position.add(delta);
                var color = secondPath.fillColor;

                view.onFrame = function (event) {
                    secondPath.fillColor.hue += 5;
                };

                secondPath.fillColor = color;

                secondPath.fillColor = raster.getAverageColor(secondPath);
                /* view.draw(); */
                secondPath.moveBelow(path);

                // Remove the path which was split:
                child.remove();
                // Avoid continuing looping through the rest of the items:
                return;
            }
        }
    };
    view.onResize = function (event) {
        layer.removeChildren();
        // Transform the raster so that it fills the bounding rectangle
        // of the view:
        raster.fitBounds(view.bounds, true);

        // Create a path that fills the view, and fill it with
        // the average color of the raster:
        var path = new Path.Rectangle(view.bounds);
        path.fillColor = raster.getAverageColor(path);
        view.draw();
    };
    paper.view.onResize();
}

$('ul.tabs li a').click(function(obj){
    paper.clear();
    $('#canvas').remove();

    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas');

    if (obj.target.id === 'tab2'){
        $('#dynamic_canvas_container_pixel').append(canvas);
    }
    else if (obj.target.id === 'tab3'){
        $('#dynamic_canvas_container_color').append(canvas);
    }
});

function editPhoto() {

    var palette = ['#69d2e7','#a7dbd8','#e0e4cc','#f38630','#fa6900'];

    var img = Caman("#canvas2", "../img/" + 'Ocean' + ".jpg", function() {
        this.render();
    });

    $('input[type=range]').change(applyFilters);

    function applyFilters() {
        var brightness = parseInt($('#brightness').val());
        var contrast = parseInt($('#contrast').val());
        var exposure = parseInt($('#exposure').val());
        var hue = parseInt($('#hue').val());
        var sepia = parseInt($('#sepia').val());
        var vibrance = parseInt($('#vibrance').val());

        img.revert(false);
        img.brightness(brightness);
        img.contrast(contrast);
        img.exposure(exposure);
        img.sepia(sepia);
        img.vibrance(vibrance);
        img.hue(hue);
        img.render();
    }

    $('#photo_selector').change(function () {
        var text = $("#photo_selector option:selected").text();

        $("#canvas2").removeAttr("data-caman-id");

        img = Caman("#canvas2", "../img/" + text + ".jpg", function() {
            this.render();
        });
    });
}
