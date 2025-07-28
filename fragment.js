const FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 u_canvas_size;
uniform sampler2D u_texture;
uniform float u_grid_size;
uniform vec2 u_grid_offset;
uniform float u_grid_thickness;
uniform vec3 u_grid_color;
uniform int u_hex_orientation; // 0 = horizontal, 1 = vertical

varying vec2 v_tex_coords;

#define SQRT_3 1.7320508

bool orientation_vertical = (u_hex_orientation == 1);
vec2 hex_side = orientation_vertical ? vec2(1, SQRT_3) : vec2(SQRT_3, 1);

float hex_dist(vec2 p)
{
    p = abs(p);
    float min_dist = orientation_vertical ? p.x : p.y;
    return 1.0 - 2.0 * max(dot(p, hex_side * 0.5), min_dist);
}

vec2 hex_coords(vec2 p)
{
    vec4 hc = floor(vec4(p, p - hex_side * 0.5) / hex_side.xyxy) + 0.5;
    vec4 rg = vec4(p - hc.xy * hex_side, p - (hc.zw + 0.5) * hex_side);

    if (dot(rg.xy, rg.xy) < dot(rg.zw, rg.zw))
        return rg.xy;
    else
        return rg.zw;
}

void main()
{
    vec2 uv = gl_FragCoord.xy - u_canvas_size * 0.5;

    float hex_per_pixel = 1.0 / u_grid_size;

    vec2 p = (uv - u_grid_offset) * hex_per_pixel;
    vec2 h = hex_coords(p);
    float d = hex_dist(h);

    float t = 2.0 * (u_grid_thickness - 1.0) * hex_per_pixel;
    float s = smoothstep(t, t + hex_per_pixel, d);

    vec4 grid = vec4(u_grid_color, 1.0);
    vec4 background = texture2D(u_texture, v_tex_coords);

    gl_FragColor = mix(grid, background, s);
}
`;
