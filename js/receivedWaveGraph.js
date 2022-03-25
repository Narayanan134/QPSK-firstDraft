let encodedWaveCanvas = document.getElementById('recvWaveCanvas');
let encodedWaveCtx = encodedWaveCanvas.getContext('2d');

let canvas_width = encodedWaveCanvas.parentElement.clientWidth || 1100;
let canvas_height = 250;
let orgx = 50;
let orgy = canvas_height / 2;

encodedWaveCanvas.width = canvas_width;
encodedWaveCanvas.height = canvas_height;

const wave_amplitude_element = document.getElementById("swamplitude");
const wave_frequency_element = document.getElementById("swfrequency");
const sampling_frequency_element = document.getElementById("safrequency")
const vertical_scale_element = document.getElementById("recv_vertical_scale_factor");
const horizontal_scale_element = document.getElementById("recv_horizontal_scale_factor");
const bl_scale_element = document.getElementById("bit_length_factor");
const check_quantized_points = document.getElementById("quantized_points");

// Draws the axes for the graph
function drawAxes(ctx, orgx, orgy, line_start, line_end) {
    ctx.beginPath();
    // Vertical line
    ctx.moveTo(orgx, line_start);
    ctx.lineTo(orgx, line_end);
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Horizontal line
    ctx.moveTo(orgx, line_end);
    ctx.lineTo(canvas_width - 50, line_end);
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Base line
    ctx.moveTo(orgx, (line_start + line_end) / 2);
    ctx.lineTo(canvas_width - 50, (line_start + line_end) / 2);
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Amplitude", orgx + 10, line_start + 10, 90);
    ctx.fillText("Time", canvas_width - 100, line_end + 20, 70);
    ctx.closePath();
}

function drawPoint(ctx, x, y) {
    var radius = 3.0;
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.lineWidth = 1;
    ctx.arc(x, y, radius*1.3, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.closePath();
}

/*
 * Returns an array of values starting with value *start* ending
 * at value *stop* and with an increment of *step*.
 * xrange(1, 3, 0.5) will return [1, 1.5, 2, 2.5, 3]
 */
function xrange(start, stop, step) {
    var res = [];
    var i = start;
    while (i <= stop) {
        res.push(i);
        i += step;
    }
    return res;
}


// Will draw the sine wave starting from loc xOffset, yOffset
function plotSine(ctx, amplitude, frequency, xOffset, yOffset, vertical_scaling_factor, horizontal_scaling_factor) {
    var width = 1000;
    var Fs = sampling_frequency_element.value;
    var Ts = 1 / sampling_frequency_element.value;
    var StopTime = 1;
    var dt = 1 / Fs;
    var t = xrange(0, StopTime + dt, dt);

    // First bit - 
    //var input_arr = [1, 0, 0, 1, 1, 1, 0, 0];
    var input_arr = [];
    for (let i = 1; i <= 8; i++) {
        input_arr.push(parseInt(document.getElementById(`bit${i}`).value));
    }

    var cos_wave = [];
    amplitude = Math.sqrt(2 * Fs) * 0.5;
    t.forEach((val) => {
        cos_wave.push(amplitude * Math.cos(2 * Math.PI * frequency * val));
    });

    var sin_wave = [];
    t.forEach((val) => {
        sin_wave.push(amplitude * Math.sin(2 * Math.PI * frequency * val));
    });

    // sqrt(2 / Ts) * cos(2 pi fc t)
    var x = [];
    let odd_sig = []
    let even_sig = []
    for (var i = 0; i < input_arr.length - 1; i+=2) {
        // All even positions must be multiplied by cos
        let bit1 = input_arr[i];
        let bit2 = input_arr[i + 1];

        cos_wave.forEach((val) => {
            odd_sig.push((bit1 == 1) ? val : -val);
        })
        sin_wave.forEach((val) => {
            even_sig.push((bit2 == 1) ? val : -val);
        })
    }

    //console.assert(odd_sig.length == even_sig.length);

    for (var i = 0; i < odd_sig.length; i++) {
        x.push(odd_sig[i] + even_sig[i]);
    }


    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";

    var idx = 0;
        while (idx < width) {
            ctx.lineTo(xOffset + idx * horizontal_scaling_factor, yOffset - vertical_scaling_factor * x[idx]);
            idx++;
        }
    ctx.stroke();
    ctx.save();
}

let size_set = false;

export function drawDecoderWave() {
    var wave_amplitude = wave_amplitude_element.value*2;
    var wave_frequency = wave_frequency_element.value;
    var vertical_scaling_factor = vertical_scale_element.value;
    var horizontal_scaling_factor = horizontal_scale_element.value;

    canvas_height = encodedWaveCanvas.parentElement.clientHeight;
    canvas_width = encodedWaveCanvas.parentElement.clientWidth;
    if (canvas_height > 100 && !size_set) {
        canvas_height = encodedWaveCanvas.parentElement.clientHeight;
        canvas_width = encodedWaveCanvas.parentElement.clientWidth;
        encodedWaveCtx.canvas.width = canvas_width;
        encodedWaveCtx.canvas.height = canvas_height;
        size_set = true;
    }

    // Clear the screen
    encodedWaveCtx.fillStyle = "white";
    encodedWaveCtx.fillRect(0, 0, canvas_width, canvas_height);

    // Vertical line start and end
    var line_start = 20;
    var line_end = canvas_height - 50;
    var mid_of_line = (line_start + line_end) / 2;

    drawAxes(encodedWaveCtx, orgx, orgy, line_start, line_end);
    plotSine(encodedWaveCtx, wave_amplitude, wave_frequency, orgx, mid_of_line, vertical_scaling_factor, horizontal_scaling_factor,mid_of_line);
    requestAnimationFrame(drawDecoderWave);
}