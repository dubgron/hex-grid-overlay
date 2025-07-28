const FRAGMENT_SHADER = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform float u_grid_size;
uniform vec2 u_grid_offset;
uniform float u_grid_thickness;
uniform vec3 u_grid_color;

varying vec2 v_tex_coords;

#define SQRT_3 1.7320508

vec2 hex_side = vec2(SQRT_3, 1);

float hex_dist(vec2 p)
{
    p = abs(p);
    return 1.0 - 2.0 * max(dot(p, hex_side * 0.5), p.y);
}

vec4 hex_coords(vec2 p)
{
    vec4 hc = floor(vec4(p, p - vec2(hex_side.x / 2.0, 0.5)) / hex_side.xyxy) + 0.5;
    vec4 rg = vec4(p - hc.xy * hex_side, p - (hc.zw + 0.5) * hex_side);

    if (dot(rg.xy, rg.xy) < dot(rg.zw, rg.zw)) return vec4(rg.xy, hc.xy);
    else return vec4(rg.zw, hc.zw + 0.5);
}

void main()
{
    vec2 uv = gl_FragCoord.xy - u_resolution.xy * 0.5;

    float hex_per_pixel = 1.0 / u_grid_size;

    vec2 p = (uv - u_grid_offset) * hex_per_pixel;
    vec4 h = hex_coords(p);
    float d = hex_dist(h.xy);

    float t = 2.0 * (u_grid_thickness - 1.0) * hex_per_pixel;
    float s = smoothstep(t, t + hex_per_pixel, d);

    vec4 grid = vec4(u_grid_color, 1.0);
    vec4 background = texture2D(u_texture, v_tex_coords);

    gl_FragColor = mix(grid, background, s);
}
`;
