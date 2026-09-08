import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ResponsiveCameraProps {
  baseZ?: number;
  baseY?: number;
  targetWidth?: number; // Desired horizontal width visible at z=0 (default 8.6)
  minZ?: number;
  maxZ?: number;
}

export function ResponsiveCamera({
  baseZ = 5.2,
  baseY = 0.8,
  targetWidth = 8.6,
  minZ = 5.0,
  maxZ = 11.5,
}: ResponsiveCameraProps) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const aspect = size.width / Math.max(size.height, 1);
    const fovRad = THREE.MathUtils.degToRad(camera.fov);
    const halfFovTan = Math.tan(fovRad / 2);

    // Visible width at distance Z is: W = 2 * Z * tan(fov / 2) * aspect
    // To ensure W >= targetWidth: Z >= targetWidth / (2 * halfFovTan * aspect)
    const requiredZ = targetWidth / (2 * halfFovTan * aspect);
    const newZ = THREE.MathUtils.clamp(Math.max(baseZ, requiredZ), minZ, maxZ);

    // On narrow screens (mobile portrait), shift camera down so lower plane
    // objects (airplane, Capy on the ground) stay comfortably visible.
    let newY = baseY;
    if (aspect < 0.55) {
      // Very narrow phone (e.g. 375px wide, 812px tall)
      newY = baseY - 0.45;
    } else if (aspect < 0.7) {
      // Normal portrait phone (e.g. 390×844)
      newY = baseY - 0.25;
    } else if (aspect < 0.85) {
      // Wide phone / small tablet portrait (e.g. 768×1024)
      newY = baseY - 0.12;
    }

    camera.position.z = newZ;
    camera.position.y = newY;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, baseZ, baseY, targetWidth, minZ, maxZ]);

  return null;
}
