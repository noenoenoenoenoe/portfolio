import * as THREE from 'three'

// Realistic procedural wood shader — elongated grain lines (sawn plank look)
// grainDir: 0=along Z, 1=along X, 2=along Y
export function createWoodMaterial({
  baseColor = '#b8885a',
  darkColor = '#6a4828',
  lightColor = '#d4a868',
  grainDir = 0,
  plankScale = 3.0,
  toonLighting = true,
} = {}) {
  const axes = [
    { along: 'z', cross1: 'x', cross2: 'y' },
    { along: 'x', cross1: 'z', cross2: 'y' },
    { along: 'y', cross1: 'x', cross2: 'z' },
  ]
  const ax = axes[grainDir] || axes[0]

  return new THREE.ShaderMaterial({
    uniforms: {
      uBaseColor: { value: new THREE.Color(baseColor) },
      uDarkColor: { value: new THREE.Color(darkColor) },
      uLightColor: { value: new THREE.Color(lightColor) },
      uPlankScale: { value: plankScale },
    },
    vertexShader: /* glsl */ `
      varying vec3 vPosition;
      varying vec3 vWorldNormal;

      void main() {
        vPosition = position;
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uBaseColor;
      uniform vec3 uDarkColor;
      uniform vec3 uLightColor;
      uniform float uPlankScale;

      varying vec3 vPosition;
      varying vec3 vWorldNormal;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1,0)), f.x),
          mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
          f.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += noise(p) * a;
          p *= 2.1;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        // Grain runs along "${ax.along}" axis
        float along = vPosition.${ax.along};
        float cross1 = vPosition.${ax.cross1};
        float cross2 = vPosition.${ax.cross2};

        // === Elongated grain lines ===
        // The key: stretch noise heavily along grain direction
        // so lines run parallel to the plank length

        // Main grain: long wavy lines across the cross-section
        float grainY = cross2 * 15.0; // across the plank width/height
        // Slight waviness along the grain direction
        grainY += fbm(vec2(along * 2.0, cross2 * 3.0)) * 2.5;
        // Create the line pattern
        float grain = sin(grainY) * 0.5 + 0.5;
        grain = smoothstep(0.3, 0.7, grain);

        // Secondary finer grain lines
        float fineGrainY = cross2 * 40.0 + fbm(vec2(along * 4.0, cross2 * 8.0)) * 3.0;
        float fineGrain = sin(fineGrainY) * 0.5 + 0.5;
        fineGrain = smoothstep(0.35, 0.65, fineGrain);

        // Very fine detail grain
        float microGrain = sin(cross2 * 100.0 + along * 5.0 + noise(vec2(along * 10.0, cross2 * 20.0)) * 6.0) * 0.5 + 0.5;

        // === Color mixing — subtle, light ===
        vec3 woodColor = mix(uBaseColor, uLightColor, grain * 0.4 + 0.3);
        woodColor = mix(woodColor, mix(uBaseColor, uDarkColor, 0.3), (1.0 - fineGrain) * 0.15);
        woodColor = mix(woodColor, woodColor * 0.94, (1.0 - microGrain) * 0.08);

        // Slow color variation along the plank (heartwood/sapwood)
        float longVar = fbm(vec2(along * 0.8, cross1 * 0.5)) * 0.5 + 0.5;
        woodColor = mix(woodColor, woodColor * vec3(1.06, 1.0, 0.92), longVar * 0.2);

        // === Knots (subtle) ===
        vec2 knotPos1 = vec2(along - 0.5, cross2 + 0.1);
        float knot1 = length(knotPos1);
        if (knot1 < 0.1) {
          float knotRing = sin(knot1 * 50.0) * 0.5 + 0.5;
          float knotFade = 1.0 - smoothstep(0.0, 0.1, knot1);
          woodColor = mix(woodColor, uDarkColor * 0.8, knotFade * 0.35 * mix(0.6, 1.0, knotRing));
        }

        // === Plank seams ===
        float plankCoord = cross1 * uPlankScale;
        float plankFract = fract(plankCoord);
        float seam = 1.0 - smoothstep(0.0, 0.02, plankFract)
                         * (1.0 - smoothstep(0.98, 1.0, plankFract));
        woodColor = mix(woodColor, uDarkColor * 0.7, seam * 0.6);

        // Per-plank slight color offset
        float plankId = floor(plankCoord);
        woodColor *= 1.0 + (hash(vec2(plankId, 7.0)) * 0.12 - 0.06);

        // === Lighting ===
        ${toonLighting ? `
        float NdotL = dot(vWorldNormal, normalize(vec3(8.0, 14.0, 5.0)));
        float toon;
        if (NdotL > 0.65) toon = 1.0;
        else if (NdotL > 0.3) toon = 0.8;
        else if (NdotL > 0.0) toon = 0.62;
        else toon = 0.48;
        vec3 finalColor = woodColor * (toon * 0.7 + 0.3);
        ` : `
        vec3 finalColor = woodColor;
        `}

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  })
}
