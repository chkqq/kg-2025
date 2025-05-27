import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { ThreeMFLoader } from 'three-stdlib';
import { MTLLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { TDSLoader } from 'three/examples/jsm/Addons.js';
const ThreeDSViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<string>('No model loaded');

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(hemisphereLight);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);
    
    // Axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    // Mount the renderer
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);
  
  const loadModel = async (file: File) => {
    if (!file) return;
    
    setLoading(true);
    setProgress(0);
    setError(null);
    
    try {
      const scene = new THREE.Scene();
      const loader = new TDSLoader();
      
      // Set up loading manager for progress tracking
      const loadingManager = new THREE.LoadingManager(
        () => {
          setLoading(false);
          setModelInfo(`Loaded: ${file.name}`);
        },
        (item, loaded, total) => {
          setProgress((loaded / total) * 100);
        },
        (error) => {
          setError(`Error loading model: ${error}`);
          setLoading(false);
        }
      );
      
      loader.setPath('');
      loader.setLoadingManager(loadingManager);
      
      // Read file as array buffer
      const arrayBuffer = await readFileAsArrayBuffer(file);
      
      // Load the 3DS model
      const object = loader.parse(arrayBuffer);
      
      // Traverse the model and apply smooth shading where needed
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Check if the material has smooth shading flag
          if (child.material && child.material.flatShading === false) {
            child.geometry.computeVertexNormals();
          }
          
          // Enable casting and receiving shadows
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Add the model to the scene
      scene.add(object);
      
      // Center the model in the scene
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center);
      
      // Replace the current scene with the new one
      if (mountRef.current) {
        const currentRenderer = mountRef.current.querySelector('canvas')?.renderer;
        if (currentRenderer) {
          currentRenderer.render(scene, currentRenderer.getCamera());
        }
      }
    } catch (err) {
      setError(`Failed to load model: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };
  
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result instanceof ArrayBuffer) {
          resolve(event.target.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      reader.onerror = () => {
        reject(new Error('File reading error'));
      };
      reader.readAsArrayBuffer(file);
    });
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      loadModel(files[0]);
    }
  };
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Overlay controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        color: 'white',
        zIndex: 100,
      }}>
        <h2>3DS Model Viewer</h2>
        <input type="file" accept=".3ds" onChange={handleFileChange} />
        
        {loading && (
          <div>
            <p>Loading: {progress.toFixed(0)}%</p>
            <progress value={progress} max="100" />
          </div>
        )}
        
        {error && (
          <div style={{ color: 'red' }}>
            <p>{error}</p>
          </div>
        )}
        
        <p>{modelInfo}</p>
        
        <div style={{ marginTop: '10px' }}>
          <p>Controls:</p>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li>Left mouse: Rotate</li>
            <li>Right mouse: Pan</li>
            <li>Scroll: Zoom</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThreeDSViewer;