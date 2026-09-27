uniform vec3 topColor;
uniform vec3 horizonColor;
uniform vec3 bottomColor;
uniform vec3 sunDirection;
uniform vec3 sunColor;
uniform float uTime;
uniform float uStars;

varying vec3 vDirection;

float hash13(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash13(i);
  float n100 = hash13(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash13(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash13(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash13(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash13(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash13(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash13(i + vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
    mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
    f.z
  );
}

void main() {
  vec3 dir = normalize(vDirection);

  vec3 sky = mix(horizonColor, topColor, smoothstep(-0.05, 0.65, dir.y));
  sky = mix(sky, bottomColor, smoothstep(-0.05, -0.5, dir.y));

  float sunAmt = max(dot(dir, normalize(sunDirection)), 0.0);
  sky += sunColor * (pow(sunAmt, 800.0) * 2.0 + pow(sunAmt, 10.0) * 0.25);

  float grain = vnoise(dir * 6.0 + vec3(0.0, uTime * 0.015, 0.0)) - 0.5;
  sky += grain * 0.035;

  vec3 cell = floor(dir * 220.0);
  float star = step(0.9985, hash13(cell)) * uStars * smoothstep(0.05, 0.4, dir.y);
  sky += vec3(star) * (0.6 + 0.4 * sin(uTime * 2.0 + hash13(cell) * 6.2831));

  gl_FragColor = vec4(sky, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
