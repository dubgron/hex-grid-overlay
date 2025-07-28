
const mile_size_input = document.getElementById("mile_size_input");
const mile_size_slider = document.getElementById("mile_size_slider");
mile_size_input.disabled = mile_size_slider.disabled = true;

const hex_size_input = document.getElementById("hex_size_input");
const hex_size_slider = document.getElementById("hex_size_slider");
hex_size_input.disabled = hex_size_slider.disabled = true;

const offset_x_input = document.getElementById("offset_x_input");
const offset_x_slider = document.getElementById("offset_x_slider");
offset_x_input.disabled = offset_x_slider.disabled = true;

const offset_y_input = document.getElementById("offset_y_input");
const offset_y_slider = document.getElementById("offset_y_slider");
offset_y_input.disabled = offset_y_slider.disabled = true;

const thickness_input = document.getElementById("thickness_input");
const thickness_slider = document.getElementById("thickness_slider");
thickness_input.disabled = thickness_slider.disabled = true;

const color_input = document.getElementById("color_input");
color_input.disabled = true;

const orientation_horizontal_input = document.getElementById("orientation_horizontal");
const orientation_vertical_input = document.getElementById("orientation_vertical");
orientation_horizontal_input.disabled = orientation_vertical_input.disabled = true;

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

const VERTICES = new Float32Array([
    -1.0, -1.0, 0.0, 1.0,
    1.0, -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0, 0.0]);

const vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);

const INDICES = new Uint16Array([0, 1, 2, 2, 3, 0]);

const index_buffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, INDICES, gl.STATIC_DRAW);

const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertex_shader, VERTEX_SHADER);
gl.compileShader(vertex_shader);

const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragment_shader, FRAGMENT_SHADER);
gl.compileShader(fragment_shader);

const program = gl.createProgram();
gl.attachShader(program, vertex_shader);
gl.attachShader(program, fragment_shader);
gl.linkProgram(program);

gl.useProgram(program);

const position_location = gl.getAttribLocation(program, "position");
gl.vertexAttribPointer(position_location, 2, gl.FLOAT, false, 16, 0);
gl.enableVertexAttribArray(position_location);

const tex_coords_location = gl.getAttribLocation(program, "tex_coords");
gl.vertexAttribPointer(tex_coords_location, 2, gl.FLOAT, true, 16, 8);
gl.enableVertexAttribArray(tex_coords_location);

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

img = new Image();
img.onload = init_hex_grid;

function init_hex_grid()
{
    canvas.width = img.width;
    canvas.height = img.height;

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    draw_hex_grid();

    mile_size_input.disabled = mile_size_slider.disabled = false;
    hex_size_input.disabled = hex_size_slider.disabled = false;
    offset_x_input.disabled = offset_x_slider.disabled = false;
    offset_y_input.disabled = offset_y_slider.disabled = false;
    thickness_input.disabled = thickness_slider.disabled = false;
    color_input.disabled = false;
    orientation_horizontal_input.disabled = orientation_vertical_input.disabled = false;
}

function hex_to_rgb(hex)
{
    const bigint = parseInt(hex.slice(1), 16);
    const r = ((bigint >> 16) & 0xff) / 255.0;
    const g = ((bigint >> 8) & 0xff) / 255.0;
    const b = (bigint & 0xff) / 255.0;
    return { r, g, b };
}

function draw_hex_grid()
{
    const texture_location = gl.getUniformLocation(program, "u_texture");
    gl.uniform1i(texture_location, texture);

    const resolution_location = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolution_location, img.width, img.height);

    const grid_size_location = gl.getUniformLocation(program, "u_grid_size");
    gl.uniform1f(grid_size_location, mile_size_input.value * hex_size_input.value);

    const grid_offset_location = gl.getUniformLocation(program, "u_grid_offset");
    gl.uniform2f(grid_offset_location, offset_x_input.value, offset_y_input.value);

    const grid_thickness_location = gl.getUniformLocation(program, "u_grid_thickness");
    gl.uniform1f(grid_thickness_location, thickness_input.value);

    const color = hex_to_rgb(color_input.value);
    const grid_color_location = gl.getUniformLocation(program, "u_grid_color");
    gl.uniform3f(grid_color_location, color.r, color.g, color.b);

    const hex_orientation_location = gl.getUniformLocation(program, "u_hex_orientation");
    gl.uniform1i(hex_orientation_location, orientation_vertical_input.checked);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function on_file_selected(event)
{
    var selected_file = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function(event) { img.src = event.target.result; };
    reader.readAsDataURL(selected_file);
}

function on_mile_size_input_changed(value)
{
    mile_size_slider.value = value;
    draw_hex_grid();
}

function on_mile_size_slider_changed(value)
{
    mile_size_input.value = value;
    draw_hex_grid();
}

function on_hex_size_input_changed(value)
{
    hex_size_slider.value = value;
    draw_hex_grid();
}

function on_hex_size_slider_changed(value)
{
    hex_size_input.value = value;
    draw_hex_grid();
}

function on_offset_x_input_changed(value)
{
    offset_x_slider.value = value;
    draw_hex_grid();
}

function on_offset_x_slider_changed(value)
{
    offset_x_input.value = value;
    draw_hex_grid();
}

function on_offset_y_input_changed(value)
{
    offset_y_slider.value = value;
    draw_hex_grid();
}

function on_offset_y_slider_changed(value)
{
    offset_y_input.value = value;
    draw_hex_grid();
}

function on_thickness_input_changed(value)
{
    thickness_slider.value = value;
    draw_hex_grid();
}

function on_thickness_slider_changed(value)
{
    thickness_input.value = value;
    draw_hex_grid();
}
