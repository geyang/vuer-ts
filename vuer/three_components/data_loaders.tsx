import {
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Collada,
  ColladaLoader,
  GLTF,
  GLTFLoader,
  MTLLoader,
  OBJLoader,
  PCDLoader,
  PLYLoader,
  STLLoader,
} from 'three-stdlib';
import URDFLoader, { URDFRobot } from 'urdf-loader';
import {
  BufferGeometry,
  Group,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Points,
} from 'three'; // todo: pass reference
import {
  GltfView,
  ObjView,
  PcdView,
  PlyView,
  UrdfView,
  UrdfViewProps,
} from './components';
import { AppContext, ClientEvent } from '../vuer';
import { useSocket } from '../vuer';

// todo: pass reference
type Props = PropsWithChildren<{
  _key?: string;
  src?: string;
  text?: string;
  buff?: ArrayBuffer;
  mtl?: string;
  hide?: boolean;
  encoding?: string;
  onLoad?: () => void | string;
  [key: string]: unknown;
}>;

/**
 * Load a 3D object from a file or text.
 *
 * @param _key
 * @param src
 * @param text
 * @param buff
 * @param mtl
 * @param hide
 * @param encoding
 * @param onLoad: When this is a string, it will emit a LOAD event containing the key to this component.
 *                When this is a function, the function will be called.
 * @param rest
 * @constructor
 */
export function Obj({
  _key,
  src,
  text,
  buff,
  mtl,
  hide,
  encoding = 'ascii',
  onLoad,
  ...rest
}: Props) {
  const [data, setData] = useState<Group | undefined>();
  useEffect(() => {
    if (!data && hide) return;
    const loader = new OBJLoader();
    if (!!mtl) {
      const mtlLoader = new MTLLoader();
      mtlLoader.load(mtl, (materials) => {
        materials.preload();
        loader.setMaterials(materials);
        if (buff) text = new TextDecoder(encoding).decode(buff);
        if (text) setData(loader.parse(text));
        else if (src) loader.load(src, setData);
      });
    } else {
      if (buff) text = new TextDecoder(encoding).decode(buff);
      if (text) setData(loader.parse(text));
      else if (src) loader.load(src, setData);
    }
  }, [src, hide]);
  const { sendMsg } = useSocket();
  useEffect(() => {
    if (!data) return;
    if (typeof onLoad === 'function') onLoad();
    if (typeof onLoad === 'string')
      sendMsg({
        ts: Date.now(),
        etype: 'LOAD',
        key: _key,
        value: onLoad,
      } as ClientEvent);
  }, [data]);
  if (!data) return null;
  return <ObjView data={data} hide={hide} {...rest} />;
}

export function Pcd({
  _key,
  src,
  text,
  buff,
  hide,
  encoding = 'ascii',
  onLoad,
  ...rest
}: Props) {
  const [data, setData] = useState<Points>();
  useEffect(() => {
    if (!data && hide) return;
    const loader = new PCDLoader();
    if (buff) text = new TextDecoder(encoding).decode(buff);
    if (text) setData(loader.parse(text, '') as Points);
    else if (src) loader.load(src as string, setData);
  }, [src, hide]);
  const { sendMsg } = useSocket();
  useEffect(() => {
    if (!data) return;
    if (typeof onLoad === 'function') onLoad();
    if (typeof onLoad === 'string')
      sendMsg({
        ts: Date.now(),
        etype: 'LOAD',
        key: _key,
        value: onLoad,
      } as ClientEvent);
  }, [data]);
  if (!data) return null;
  return <PcdView data={data} hide={hide} {...rest} />;
}

export function Ply({
  _key,
  src,
  text,
  buff,
  hide,
  encoding = 'ascii',
  onLoad,
  ...rest
}: Props) {
  const [data, setData] = useState<BufferGeometry>();
  useEffect(() => {
    if (!data && hide) return;
    const loader = new PLYLoader();
    if (buff) {
      const decoder = new TextDecoder(encoding);
      text = decoder.decode(buff);
    }
    if (text) {
      const parsed = loader.parse(text);
      setData(parsed);
    } else if (src) loader.load(src, setData);
  }, [src, hide]);
  const { sendMsg } = useSocket();
  useEffect(() => {
    if (!data) return;
    if (typeof onLoad === 'function') onLoad();
    if (typeof onLoad === 'string')
      sendMsg({
        ts: Date.now(),
        etype: 'LOAD',
        key: _key,
        value: onLoad,
      } as ClientEvent);
  }, [data]);
  if (!data) return null;
  return <PlyView data={data} hide={hide} {...rest} />;
}

export function Glb({
  _key,
  src,
  text,
  buff,
  hide,
  encoding = 'ascii',
  onLoad,
  ...rest
}: Props) {
  const [data, setData] = useState<GLTF>();
  useEffect(() => {
    if (!data && hide) return;
    const loader = new GLTFLoader();
    if (buff) text = new TextDecoder(encoding).decode(buff);
    if (text) loader.parse(text, '', setData);
    else if (src) loader.load(src, setData);
  }, [src, hide]);
  const { sendMsg } = useSocket();
  useEffect(() => {
    if (!data) return;
    if (typeof onLoad === 'function') onLoad();
    if (typeof onLoad === 'string')
      sendMsg({
        ts: Date.now(),
        etype: 'LOAD',
        key: _key,
        value: onLoad,
      } as ClientEvent);
  }, [data]);
  if (!data) return null;
  return <GltfView data={data} hide={hide} {...rest} />;
}

type URDFProps = Props & {
  fetchOptions?;
  workingPath?: string;
  parseVisual?: boolean;
  parseCollision?: boolean;
  packages?:
    | string
    | { [key: string]: string }
    | ((targetPkg: string) => string);
} & UrdfViewProps;

export function Urdf({
  _key,
  src,
  text,
  buff,
  hide,
  encoding = 'ascii',
  jointValues,
  workingPath,
  fetchOptions,
  parseVisual,
  parseCollision,
  packages,
  onLoad,
  ...rest
}: URDFProps) {
  const [data, setData] = useState<URDFRobot>();
  const { showError, showInfo } = useContext(AppContext);
  const loader: URDFLoader = useMemo(() => {
    const _loader = new URDFLoader();
    if (!!workingPath) _loader.workingPath = workingPath;
    if (!!fetchOptions) _loader.fetchOptions = fetchOptions;
    if (!!parseVisual) _loader.parseVisual = parseVisual;
    if (!!parseCollision) _loader.parseCollision = parseCollision;
    if (!!packages && packages.length) _loader.packages = packages;

    _loader.loadMeshCb = function (
      path: string,
      manager: LoadingManager,
      onLoad: (mesh: Object3D, err?: Error) => void,
    ) {
      if (typeof path !== 'string') return;
      const _path = path.toLowerCase();
      const onError = (err) => {
        showError(`Failed to load mesh: ${path}`);
        onLoad(undefined, err);
      };
      if (_path.endsWith('.obj'))
        new OBJLoader(manager).load(path, onLoad, undefined, onError);
      else if (_path.endsWith('.stl'))
        new STLLoader(manager).load(
          path,
          (o) => onLoad(new Mesh(o, new MeshStandardMaterial())),
          undefined,
          onError,
        );
      else if (_path.endsWith('.glb'))
        new GLTFLoader(manager).load(
          path,
          (o: GLTF) => onLoad(o.scene),
          undefined,
          onError,
        );
      else if (_path.endsWith('.gltf'))
        new GLTFLoader(manager).load(
          path,
          (o: GLTF) => onLoad(o.scene),
          undefined,
          onError,
        );
      else if (_path.endsWith('.pcd'))
        new PCDLoader(manager).load(path, onLoad, undefined, onError);
      else if (_path.endsWith('.dae'))
        new ColladaLoader(manager).load(
          path,
          (o: Collada) => onLoad(o.scene),
          undefined,
          onError,
        );
      else showInfo(`Unknown mesh type: ${path}`);
    };
    return _loader;
  }, [workingPath, fetchOptions, parseVisual, parseCollision, packages]);

  useEffect(() => {
    if (!data && hide) return;
    if (buff) text = new TextDecoder(encoding).decode(buff);
    if (text) setData(loader.parse(text));
    else if (src) loader.load(src, setData);
  }, [loader, src, hide]);
  const { sendMsg } = useSocket();
  useEffect(() => {
    if (!data) return;
    if (typeof onLoad === 'function') onLoad();
    if (typeof onLoad === 'string')
      sendMsg({
        ts: Date.now(),
        etype: 'LOAD',
        key: _key,
        value: onLoad,
      } as ClientEvent);
  }, [data]);
  if (!data) return null;
  return (
    <UrdfView robot={data} jointValues={jointValues} hide={hide} {...rest} />
  );
}
