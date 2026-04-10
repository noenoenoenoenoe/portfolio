import * as THREE from 'three'

// Stylized toon ocean shader with animated caustics and foam highlights
export function createOceanMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeepColor: { value: new THREE.Color('#0891b2') },
      uMidColor: { value: new THREE.Color('#22d3ee') },
      uShallowColor: { value: new THREE.Color('#a5f3fc') },
      uFoamColor: { value: new THREE.Color('#e0f7fa') },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vPosition;
      varying float vHeight;
      varying vec3 vWorldPos;

      void main() {
        vec3 pos = position;

        // Gentle rounded waves
        float height =
          sin(pos.x * 0.08 + uTime * 0.5) * 0.12 +
          sin(pos.y * 0.07 + uTime * 0.35) * 0.08 +
          sin((pos.x + pos.y) * 0.05 + uTime * 0.25) * 0.06;

        pos.z = height;
        vHeight = height;
        vPosition = pos;
        vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uDeepColor;
      uniform vec3 uMidColor;
      uniform vec3 uShallowColor;
      uniform vec3 uFoamColor;

      varying vec3 vPosition;
      varying float vHeight;
      varying vec3 vWorldPos;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      void main() {
        // Height-based color gradient (4 stops)
        float factor = (vHeight + 0.26) / 0.52;
        vec3 waterColor;
        if (factor > 0.8) {
          waterColor = mix(uShallowColor, uFoamColor, (factor - 0.8) * 5.0);
        } else if (factor > 0.45) {
          waterColor = mix(uMidColor, uShallowColor, (factor - 0.45) / 0.35);
        } else {
          waterColor = mix(uDeepColor, uMidColor, factor / 0.45);
        }

        // Animated caustic pattern
        vec2 uv = vWorldPos.xz * 0.15;
        float caustic1 = noise(uv * 3.0 + uTime * 0.3);
        float caustic2 = noise(uv * 5.0 - uTime * 0.2 + 10.0);
        float caustic = caustic1 * caustic2;
        caustic = smoothstep(0.15, 0.35, caustic);

        // Bright caustic highlights
        waterColor += vec3(0.06, 0.1, 0.12) * caustic;

        // Subtle foam lines on wave peaks
        float foam = smoothstep(0.18, 0.22, vHeight);
        float foamPattern = noise(vWorldPos.xz * 4.0 + uTime * 0.5);
        foam *= smoothstep(0.4, 0.6, foamPattern);
        waterColor = mix(waterColor, uFoamColor, foam * 0.4);

        // Toon banding — subtle
        float band = floor(factor * 5.0) / 5.0;
        waterColor = mix(waterColor, mix(uDeepColor, uShallowColor, band), 0.1);

        // Sparkle highlights
        float sparkle = noise(vWorldPos.xz * 20.0 + uTime * 2.0);
        sparkle = smoothstep(0.92, 0.95, sparkle);
        waterColor += vec3(0.15, 0.18, 0.2) * sparkle;

        gl_FragColor = vec4(waterColor, 1.0);
      }
    `,
  })
}
