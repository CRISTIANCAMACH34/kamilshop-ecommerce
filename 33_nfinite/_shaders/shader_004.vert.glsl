#version 300 es
	in vec3 position;
	in vec3 normal;
	in vec2 uv;

	uniform mat4 modelViewMatrix;
	uniform mat4 projectionMatrix;
	uniform mat3 normalMatrix;
	uniform mat4 modelMatrix;

	out vec2 vUv;
	out vec3 vWorldPosition;

	void main() {
		vUv = uv;
		vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
