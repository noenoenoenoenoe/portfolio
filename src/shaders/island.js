import * as THREE from 'three'

// Procedural toon island shader — grass, sand, cliff with stylized detail
export function createIslandMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vColor;

      attribute vec3 color;

      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vColor = color;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vColor;

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

      float fbm(vec2 p) {
        float v = 0.0;
        v += noise(p) * 0.5;
        v += noise(p * 2.1) * 0.25;
        v += noise(p * 4.3) * 0.125;
        return v;
      }

      void main() {
        vec3 baseColor = vColor;
        float y = vPosition.y;

        // Detect zone from vertex color brightness/hue
        float greenness = baseColor.g - max(baseColor.r, baseColor.b);
        float isGrass = smoothstep(0.05, 0.15, greenness);
        float isSand = smoothstep(0.15, 0.2, y) * (1.0 - isGrass) * step(0.0, y);

        // Grass detail: tiny blade-like noise pattern
        if (isGrass > 0.5) {
          float grassNoise = fbm(vPosition.xz * 25.0);
          float grassBlades = noise(vPosition.xz * 60.0);
          // Vary green intensity with noise
          baseColor = mix(baseColor, baseColor * 1.15, grassNoise * 0.4);
          baseColor = mix(baseColor, baseColor * 0.85, grassBlades * 0.2);
          // Tiny bright grass highlights
          float highlight = smoothstep(0.65, 0.7, grassBlades);
          baseColor = mix(baseColor, baseColor + vec3(0.08, 0.12, 0.02), highlight * 0.5);
        }

        // Sand detail: granular speckle
        if (isSand > 0.3) {
          float sandNoise = noise(vPosition.xz * 40.0);
          float sandGrain = noise(vPosition.xz * 100.0);
          baseColor = mix(baseColor, baseColor * 1.08, sandNoise * 0.3);
          baseColor = mix(baseColor, baseColor * 0.92, sandGrain * 0.15);
        }

        // Rock detail: craggy noise
        if (isGrass < 0.3 && y < 0.05) {
          float rockNoise = fbm(vPosition.xz * 12.0 + vPosition.y * 8.0);
          float crack = smoothstep(0.45, 0.5, rockNoise);
          baseColor = mix(baseColor, baseColor * 0.75, crack * 0.4);
          baseColor = mix(baseColor, baseColor * 1.1, (1.0 - rockNoise) * 0.2);
        }

        // Toon lighting — 3-step
        float NdotL = dot(vWorldNormal, normalize(vec3(8.0, 14.0, 5.0)));
        float toon;
        if (NdotL > 0.5) toon = 1.0;
        else if (NdotL > 0.1) toon = 0.78;
        else toon = 0.58;

        vec3 finalColor = baseColor * (toon * 0.75 + 0.25);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    vertexColors: true,
  })
}
