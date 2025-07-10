#version 300 es
precision highp float;

in vec2 uv;
out vec4 out_color;

uniform vec2  u_resolution;
uniform float u_time;

float sdBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}

vec3 getNormal(vec3 p) {
    const float e = 0.0005;
    return normalize(vec3(
        sdBox(p + vec3(e,0,0), vec3(1.0)) - sdBox(p - vec3(e,0,0), vec3(1.0)),
        sdBox(p + vec3(0,e,0), vec3(1.0)) - sdBox(p - vec3(0,e,0), vec3(1.0)),
        sdBox(p + vec3(0,0,e), vec3(1.0)) - sdBox(p - vec3(0,0,e), vec3(1.0))
    ));
}

mat3 rotationEuler(vec3 a) {
    float cx = cos(a.x), sx = sin(a.x);
    float cy = cos(a.y), sy = sin(a.y);
    float cz = cos(a.z), sz = sin(a.z);
    mat3 Rx = mat3(
        1.,   0.,  0.,
        0.,  cx, -sx,
        0.,  sx,  cx
    );
    mat3 Ry = mat3(
        cy, 0., sy,
         0., 1., 0.,
       -sy, 0., cy
    );
    mat3 Rz = mat3(
        cz, -sz, 0.,
        sz,  cz, 0.,
        0.,   0., 1.
    );
    return Rz * Ry * Rx;
}

void main() {
    vec2 p  = (uv * 2.0 - 1.0) * vec2(u_resolution.x / u_resolution.y, 1.0);
    vec3 ro = vec3(0.0, 0.0, 4.0);
    vec3 rd = normalize(vec3(p, -1.5));

    float ax = sin(u_time * 0.6 + 0.3) * 3.14159;
    float ay = sin(u_time * 0.9 + 1.1) * 3.14159;
    float az = sin(u_time * 0.4 + 2.5) * 3.14159;
    mat3 R  = rotationEuler(vec3(ax, ay, az));

    float t = 0.0;
    const float tMax = 10.0;
    for (int i = 0; i < 80; i++) {
        vec3 pos = R * (ro + rd * t);
        float d  = sdBox(pos, vec3(1.0));
        if (d < 0.0005) break;
        t += d;
        if (t > tMax) break;
    }

    vec3 color = vec3(0.05, 0.07, 0.1); // background color
    if (t < tMax) {
        vec3 pos  = R * (ro + rd * t);
        vec3 N    = getNormal(pos);
        vec3 V    = normalize(-rd);
        float F   = pow(1.0 - clamp(dot(V, N), 0.0, 1.0), 3.0);
        vec3 Rdir = reflect(V, N);

        vec3 envTop = vec3(0.6, 0.8, 0.9);
        vec3 envBot = vec3(0.1, 0.2, 0.3);
        float m     = clamp(Rdir.z * 0.5 + 0.5, 0.0, 1.0);
        vec3 env    = mix(envBot, envTop, m);

        vec3 baseTeal = vec3(0.0, 0.7, 0.7);
        float gs = pow(clamp(V.z, 0.0, 1.0), 32.0) * 0.4;
        vec3 globalSpec = vec3(1.0) * gs;

        color = mix(baseTeal, env, F) + globalSpec;
    }

    out_color = vec4(color, 1.0);
}
