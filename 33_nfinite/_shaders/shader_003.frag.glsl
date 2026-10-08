
	uniform sampler2D tMap;
	uniform vec2 uResolution;

	varying vec2 vUv;

	vec4 fxaa(sampler2D tex, vec2 uv, vec2 resolution) {
		vec2 pixel = vec2(1) / resolution;

		vec3 l = vec3(0.299, 0.587, 0.114);
		float lNW = dot(texture2D(tex, uv + vec2(-1, -1) * pixel).rgb, l);
		float lNE = dot(texture2D(tex, uv + vec2( 1, -1) * pixel).rgb, l);
		float lSW = dot(texture2D(tex, uv + vec2(-1,  1) * pixel).rgb, l);
		float lSE = dot(texture2D(tex, uv + vec2( 1,  1) * pixel).rgb, l);
		float lM  = dot(texture2D(tex, uv).rgb, l);
		float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
		float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));

		vec2 dir = vec2(
			-((lNW + lNE) - (lSW + lSE)),
			((lNW + lSW) - (lNE + lSE))
		);

		float dirReduce = max((lNW + lNE + lSW + lSE) * 0.03125, 0.0078125);
		float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
		dir = min(vec2(8, 8), max(vec2(-8, -8), dir * rcpDirMin)) * pixel;

		vec3 rgbA = 0.5 * (
			texture2D(tex, uv + dir * (1.0 / 3.0 - 0.5)).rgb +
			texture2D(tex, uv + dir * (2.0 / 3.0 - 0.5)).rgb);

		vec3 rgbB = rgbA * 0.5 + 0.25 * (
			texture2D(tex, uv + dir * -0.5).rgb +
			texture2D(tex, uv + dir * 0.5).rgb);

		float lB = dot(rgbB, l);

		return mix(
			vec4(rgbB, 1),
			vec4(rgbA, 1),
			max(sign(lB - lMin), 0.0) * max(sign(lB - lMax), 0.0)
		);
	}

	void main() {
		gl_FragColor = fxaa(tMap, vUv, uResolution);
	}
`;class Vec4 extends Array{constructor(t=0,e=t,i=t,r=t){return super(t,e,i,r),this}get x(){return this[0]}get y(){return this[1]}get z(){return this[2]}get w(){return this[3]}set x(t){this[0]=t}set y(t){this[1]=t}set z(t){this[2]=t}set w(t){this[3]=t}set(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:t,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:t,r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:t;return t.length?this.copy(t):(set1(this,t,e,i,r),this)}copy(t){return copy1(this,t),this}normalize(){return normalize1(this,this),this}multiply(t){return scale1(this,this,t),this}dot(t){return dot1(this,t)}fromArray(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;return this[0]=t[e],this[1]=t[e+1],this[2]=t[e+2],this[3]=t[e+3],this}toArray(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;return t[e]=this[0],t[e+1]=this[1],t[e+2]=this[2],t[e+3]=this[3],t}}function forceCast(t){return t}function isEmpty(t){return null==t}function isObject$1(t){return null!==t&&"object"==typeof t}function isRecord(t){return null!==t&&"object"==typeof t}function deepEqualsArray(t,e){if(t.length!==e.length)return!1;for(let i=0;i<t.length;i++)if(t[i]!==e[i])return!1;return!0}function deepMerge(t,e){return Array.from(new Set([...Object.keys(t),...Object.keys(e)])).reduce((i,r)=>{let s=t[r],n=e[r];return isRecord(s)&&isRecord(n)?Object.assign(Object.assign({},i),{[r]:deepMerge(s,n)}):Object.assign(Object.assign({},i),{[r]:r in e?n:s})},{})}function isBinding(t){return!!isObject$1(t)&&"target"in t}let CREATE_MESSAGE_MAP={alreadydisposed:()=>"View has been already disposed",invalidparams:t=>`Invalid parameters for 