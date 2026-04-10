import * as THREE from 'three'

// Ocean shader — 3 modes: toon (Pokemon), realistic (AC), painted (Ghibli)
export function createOceanMaterial({
  deep = '#0891b2',
  mid = '#22d3ee',
  shallow = '#a5f3fc',
  foam = '#e0f7fa',
  waveHeight = 1.0,
  waveSpeed = 1.0,
  causticIntensity = 1.0,
  sparkleIntensity = 1.0,
  toonBanding = true,
  specularSun = false,
} = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeepColor: { value: new THREE.Color(deep) },
      uMidColor: { value: new THREE.Color(mid) },
      uShallowColor: { value: new THREE.Color(shallow) },
      uFoamColor: { value: new THREE.Color(foam) },
      uWaveHeight: { value: waveHeight },
      uWaveSpeed: { value: waveSpeed },
      uCausticIntensity: { value: causticIntensity },
      uSparkleIntensity: { value: sparkleIntensity },
      uToonBanding: { value: toonBanding ? 1.0 : 0.0 },
      uSpecularSun: { value: specularSun ? 1.0 : 0.0 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uWaveHeight;
      uniform float uWaveSpeed;
      varying vec3 vPosition;
      varying float vHeight;
      varying vec3 vWorldPos;

      void main() {
        vec3 pos = position;
        float t = uTime * uWaveSpeed;

        float height = (
          sin(pos.x * 0.08 + t * 0.5) * 0.12 +
          sin(pos.y * 0.07 + t * 0.35) * 0.08 +
          sin((pos.x + pos.y) * 0.05 + t * 0.25) * 0.06
        ) * uWaveHeight;

        // Extra wave detail for realistic mode (high waveHeight)
        if (uWaveHeight > 1.2) {
          height += sin(pos.x * 0.15 + t * 0.7) * 0.04 * uWaveHeight;
          height += sin(pos.y * 0.12 - t * 0.45) * 0.03 * uWaveHeight;
        }

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
      uniform float uCausticIntensity;
      uniform float uSparkleIntensity;
      uniform float uToonBanding;
      uniform float uSpecularSun;
      uniform float uWaveSpeed;

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
        float factor = (vHeight + 0.26) / 0.52;
        vec3 waterColor;
        if (factor > 0.8) {
          waterColor = mix(uShallowColor, uFoamColor, (factor - 0.8) * 5.0);
        } else if (factor > 0.45) {
          waterColor = mix(uMidColor, uShallowColor, (factor - 0.45) / 0.35);
        } else {
          waterColor = mix(uDeepColor, uMidColor, factor / 0.45);
        }

        float t = uTime * uWaveSpeed;

        // Caustics
        vec2 uv = vWorldPos.xz * 0.15;
        float caustic1 = noise(uv * 3.0 + t * 0.3);
        float caustic2 = noise(uv * 5.0 - t * 0.2 + 10.0);
        float caustic = caustic1 * caustic2;
        caustic = smoothstep(0.15, 0.35, caustic);
        waterColor += vec3(0.06, 0.1, 0.12) * caustic * uCausticIntensity;

        // Foam lines
        float foam = smoothstep(0.18, 0.22, vHeight);
        float foamPattern = noise(vWorldPos.xz * 4.0 + t * 0.5);
        foam *= smoothstep(0.4, 0.6, foamPattern);
        waterColor = mix(waterColor, uFoamColor, foam * 0.4);

        // Toon banding (Pokemon/Ghibli)
        if (uToonBanding > 0.5) {
          float band = floor(factor * 5.0) / 5.0;
          waterColor = mix(waterColor, mix(uDeepColor, uShallowColor, band), 0.1);
        }

        // Sparkle / sun reflection
        float sparkle = noise(vWorldPos.xz * 20.0 + uTime * 2.0);
        sparkle = smoothstep(0.92, 0.95, sparkle);
        waterColor += vec3(0.15, 0.18, 0.2) * sparkle * uSparkleIntensity;

        // Sun specular disc (AC Odyssey realistic mode)
        if (uSpecularSun > 0.5) {
          vec3 sunDir = normalize(vec3(12.0, 20.0, 6.0));
          vec3 viewDir = normalize(vec3(10.0, 10.0, 10.0) - vWorldPos);
          vec3 waveNormal = normalize(vec3(
            noise(vWorldPos.xz * 0.3 + t * 0.2) * 0.5 - 0.25,
            1.0,
            noise(vWorldPos.zx * 0.3 - t * 0.15) * 0.5 - 0.25
          ));
          vec3 reflDir = reflect(-sunDir, waveNormal);
          float spec = pow(max(dot(viewDir, reflDir), 0.0), 120.0);
          waterColor += vec3(1.0, 0.95, 0.8) * spec * 2.5;

          // Broader soft specular glow
          float softSpec = pow(max(dot(viewDir, reflDir), 0.0), 8.0);
          waterColor += vec3(0.4, 0.35, 0.25) * softSpec * 0.3;
        }

        gl_FragColor = vec4(waterColor, 1.0);
      }
    `,
  })
}
