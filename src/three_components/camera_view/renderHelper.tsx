import { useCallback, useMemo } from 'react';
import {
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
} from 'three';

const useRender = (disable = false) => {
  const [postScene, postMaterial, postCamera] = useMemo(() => {
    if (disable) return [null, null, null];
    const pcam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const pmat = new MeshBasicMaterial();

    // setup the scene for rendering the post FX
    const postPlane = new PlaneGeometry(2, 2);
    const postQuad = new Mesh(postPlane, pmat);
    const pscn = new Scene();
    pscn.add(postQuad);

    return [pscn, pmat, pcam];
  }, []);

  // todo: clean up.
  // depthTexture contains the relevant info
  const renderFn = useCallback(
    ({ renderer, texture }) => {
      if (!postMaterial) return;

      if (postMaterial.map !== texture) {
        postMaterial.map?.dispose();
        postMaterial.map = texture;
        postMaterial.needsUpdate = true;
      }

      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
    },
    [disable],
  );

  return renderFn;
};

export { useRender };