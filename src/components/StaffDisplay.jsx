import React, { useEffect, useRef } from 'react';
import { Renderer, Stave } from 'vexflow';

export default function StaffDisplay({ clef, vexKey, animateKey }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous drawing
    containerRef.current.innerHTML = '';

    
    // Create an SVG renderer and attach it to the DIV element.
    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    
    // Configure the renderer size
    renderer.resize(250, 150);
    const context = renderer.getContext();
    // Context styling for a modern look
    
    // Increase size via SVG transform for better readability
    context.scale(1.5, 1.5);
    
    // Create a stave of width 150 on the canvas.
    const stave = new Stave(10, 10, 140);
    
    // Add clef and key signature
    stave.addClef(clef).addKeySignature(vexKey);
    
    // Connect it to the rendering context and draw
    stave.setContext(context).draw();

  }, [clef, vexKey]);

  return (
    <div 
      className={`staff-container ${animateKey ? 'slide-in' : ''}`}
      ref={containerRef} 
    />
  );
}
