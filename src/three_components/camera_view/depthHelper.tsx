import { useCallback, useMemo } from 'react';
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
} from 'three';

const useDepthRender = (disable = false) => {
  const [postScene, postMaterial, postCamera] = useMemo(() => {
    if (disable) return [null, null, null];
    const pcam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const pmat = new ShaderMaterial({
      vertexShader: `
      varying vec2 vUv;
      void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      fragmentShader: `
      #include <packing>
    
      varying vec2 vUv;
      uniform sampler2D tDepth;
      uniform float cameraNear;
      uniform float cameraFar;
      
      float readDepth( sampler2D depthSampler, vec2 coord ) {
        float fragCoordZ = texture2D( depthSampler, coord ).x;
        float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
        return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
      }
      
      void main() {
        float depth = readDepth( tDepth, vUv );
        
        gl_FragColor.rgb = 1.0 - vec3( depth );
        gl_FragColor.a = 1.0;

        // this works. 
        // float d_normal = depth;
        // 
        // // Initialize the color as black
        // vec3 color = vec3(0.0);

        // // Calculate RGB values based on the normalized depth
        // if (d_normal <= 0.167) {
        //   color.r = 1.0;
        //   color.g = d_normal;
        // } else if (d_normal < 0.333) {
        //   color.r = 0.333 - d_normal;
        //   color.g = 1.0;
        // } else if (d_normal < 0.5) {
        //   color.g = 1.0;
        //   color.b = d_normal - 0.5;
        // } else if (d_normal < 0.667) {
        //   color.g = 0.667 - d_normal;
        //   color.b = 1.0;
        // } else if (d_normal < 0.833) {
        //   color.r = d_normal - 0.833;
        //   color.b = 1.0;
        // } else {
        //   color.r = 1.0;
        //   color.b = 1.0 - d_normal;
        // }

        // // Set the fragment's color
        // gl_FragColor.rgb = color;
        
      }`,
      uniforms: {
        cameraNear: { value: 0.1 },
        cameraFar: { value: 10 },
        tDepth: { value: null },
      },
    });

    // setup the scene for rendering the post FX
    const postPlane = new PlaneGeometry(2, 2);
    const postQuad = new Mesh(postPlane, pmat);
    const pscn = new Scene();
    pscn.add(postQuad);

    return [pscn, pmat, pcam];
  }, [disable]);

  const renderFn = useCallback(
    ({ renderer, depthTexture, near, far }) => {
      if (!postMaterial) return;

      postMaterial.uniforms.tDepth.value = depthTexture;
      postMaterial.uniforms.cameraNear.value = near;
      postMaterial.uniforms.cameraFar.value = far;

      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
    },
    [disable],
  );

  return renderFn;
};

export { useDepthRender };