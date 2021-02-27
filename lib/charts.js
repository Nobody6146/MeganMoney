function ChartOptions() {
    this.width = width;
    this.height = height;
}

function Chart(rootElement, options) {
    this.rootElement = rootElement;
    this.options = options;
}

function ChartData (label, value, color) {
    this.label = label;
    this.value = value;
    this.color = color;
}

Chart.prototype.drawPieChart = function(data) {
    this.data = data;

    let total = data.reduce((total, x) => total + Math.abs(x.value), 0);
    let size = this.options.width;
    let radius = size/2;
    let circum = 2 * Math.PI *radius;

    let svg = document.createElement("svg");
    svg.setAttributeNS(null, "height", size);
    svg.setAttributeNS(null, "width", size);
    svg.setAttributeNS(null, "viewBox", "0 0 " + size + " " + size);

    let progress = 0;

    data.forEach(x => {
        let percentage = Math.abs(x.value) / total;
        let width = percentage * circum;
        let rotation = progress*360;
        let radians = (rotation)*Math.PI/180;
        //Create element
        let circ = document.createElement("circle");
        circ.setAttribute("r", radius);
        circ.setAttribute("cx", radius);
        circ.setAttribute("cy", radius);
        circ.setAttribute("transform", "rotate(" + rotation + ") translate(" + Math.cos(radians)*size + " " + Math.sin(radians)*size +")");
        //Fill the pie slice
        circ.setAttribute("fill", "transparent");
        circ.setAttribute("stroke", x.color);
        circ.setAttribute("stroke-width", radius);
        circ.setAttribute("stroke-dasharray", width + " " + circum);
        //Add slice
        svg.appendChild(circ);
        progress += percentage;
    });
    this.rootElement.appendChild(svg);
}