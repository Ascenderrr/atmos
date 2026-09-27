import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { getFlightCurve } from './FlightPath';

// Path visualization for the ?showPath=1 debug mode. Built as a THREE.Line
// primitive (avoids JSX intrinsic type conflicts) and disposed on unmount.
// Never rendered in normal production mode.
export default function FlightPathDebug() {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(getFlightCurve().getPoints(220));
    const material = new THREE.LineBasicMaterial({
      color: '#ffd166',
      transparent: true,
      opacity: 0.85,
    });
    return new THREE.Line(geometry, material);
  }, []);

  useEffect(() => {
    return () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    };
  }, [line]);

  return <primitive object={line} />;
}
