
		precision highp float;

		${simplexNoise3d}
		${remap1}

		#define PI 3.14159265359
		#define TWO_PI 6.28318530718

		attribute vec3 position;
		attribute vec3 targetPosition;
		attribute vec4 random;

		uniform mat4 modelMatrix;
		uniform mat4 viewMatrix;
		uniform mat4 projectionMatrix;
		uniform float uTime;
		uniform float uIdleTime;
		uniform float uSize; // tq({ value: 1.5, range: [0, 20], step: 0.1 })
		uniform vec2 uSpread; // tq({ value: [0.01, -0.01], range: [-1, 1], step: 0.01 })
		uniform float uNoiseFrequency; // tq({ value: 8, range: [0, 10], step: 0.001 })
		uniform float uNoiseStrength; // tq({ value: 0.25, range: [0, 2], step: 0.001 })
		uniform float uDelay; // tq({ value: 0.3, range: [0, 1], step: 0.001 })
		uniform float uProgress; // tq({ value: 0, range: [0, 1], step: 0.001 })
		uniform float uValidityThreshold; // tq({ value: 0.0001, range: [0, 0.1], step: 0.0001 })
		uniform vec2 uIdleRadius; // tq({ value: [0.01, 0.05], range: [0, 5], step: 0.01 })
		uniform float uIdleSpeed; // tq({ value: 0.8, range: [0, 5], step: 0.01 })

		varying vec4 vRandom;
		varying vec3 vDebug;
		varying float vIsValid;
		varying float vFadeAlpha;

		void main() {
				vRandom = random;

				// Check if particle is valid (not exactly 0,0,0 in texture)
				float isStartZero = (1.0 - step(0.00001, abs(position.x))) * (1.0 - step(0.00001, abs(position.y))) * (1.0 - step(0.00001, abs(position.z)));
				float isEndZero = (1.0 - step(0.00001, abs(targetPosition.x))) * (1.0 - step(0.00001, abs(targetPosition.y))) * (1.0 - step(0.00001, abs(targetPosition.z)));

				// Discard if both are zero (leftover particles)
				vIsValid = 1.0 - (isStartZero * isEndZero);

				// Replace (0,0,0) positions with center (0.5,0.5,0.5) for better morphing
				vec3 startPos = mix(position, vec3(0.5, 0.5, 0.5), isStartZero);
				vec3 endPos = mix(targetPosition, vec3(0.5, 0.5, 0.5), isEndZero);

				float noiseStart = snoise(startPos * uNoiseFrequency);
				float noiseTarget = snoise(endPos * uNoiseFrequency);
				float noise = smoothstep(-1.0, 1.0, mix(noiseStart, noiseTarget, uProgress));

				float duration = 1.0 - uDelay;
				float start = (1.0 - duration) * noise;
				float end = duration + start;
				float progress = smoothstep(start, end, uProgress);

				// Fade in/out based on which endpoint is zero, using the delayed progress
				if (isStartZero > 0.5) {
					// Fading in from center - use progress for alpha
					vFadeAlpha = progress;
				} else if (isEndZero > 0.5) {
					// Fading out to center - use inverse progress for alpha
					vFadeAlpha = remap(progress, 0.0, 0.5, 1.0, 0.0);
				} else {
					// Both valid - full alpha
					vFadeAlpha = 1.0;
				}

				vec3 mixedPosition = mix(startPos, endPos, progress);

				mixedPosition = mix(
					mixedPosition,
					mixedPosition + ((random.xyz * (noise * 2.0 - 1.0)) * uNoiseStrength),
					1.0 - abs(uProgress * 2.0 - 1.0)
				);

				// positions are 0->1, so make -1->1
				// vec3 pos = length(targetPosition) < 0.01
				// 	? vec3(0)
				// 	: mixedPosition * 2.0 - 1.0;
				vec3 pos = mixedPosition * 2.0 - 1.0;

				// modelMatrix is one of the automatically attached uniforms when using the Mesh class
				vec4 mPos = modelMatrix * vec4(pos, 1.0);

				vec3 spreadFactor = random.xwz * 2.0 - 1.0;

				// add Add some spread
				mPos.x += mix(uSpread.x, uSpread.y, spreadFactor.x);
				mPos.y += mix(uSpread.x, uSpread.y, spreadFactor.y);
				mPos.z += mix(uSpread.x, uSpread.y, spreadFactor.z);

				// Idle animation - circular motion using sin/cos
				float t = uIdleTime * uIdleSpeed;
				float radius = mix(uIdleRadius.x, uIdleRadius.y, random.x);
				mPos.x += sin(t * random.z + TWO_PI * random.w) * radius;
				mPos.y += cos(t * random.y + TWO_PI * random.x) * radius;

				// get the model view position so that we can scale the points off into the distance
				vec4 mvPos = viewMatrix * mPos;
				// Hide invalid particles here because fragment discard fails on iPhone 16 iOS Chrome
				gl_PointSize = vIsValid < 0.5 ? 0.0 : max(2.0, uSize / length(mvPos.xyz) * (random.x + 0.1));
				gl_Position = projectionMatrix * mvPos;

				vDebug = vec3(noise);
		}
