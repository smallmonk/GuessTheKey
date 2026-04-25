import { useEffect, useRef } from 'react';

interface StaffDisplayProps {
  clef: string;
  vexKey: string;
  animateKey: boolean;
}

export default function StaffDisplay({ clef, vexKey, animateKey }: StaffDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous drawing
    containerRef.current.innerHTML = '';

    // Dynamically import vexflow core to avoid the warning since the main module brings in everything
    Promise.all([
      import('vexflow/core'),
      import('vexflow/bravura')
    ]).then(([VexFlowCore]) => {
        const { Renderer, Stave, VexFlow } = VexFlowCore;
        VexFlow.setFonts('Bravura', 'Bravura');

        if (!containerRef.current) return;
        document.fonts.ready.then(() => {
          if (!containerRef.current) return;
          // Clear previous drawing just in case it wasn't clear
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
        });
    });

  }, [clef, vexKey]);

  return (
    <div 
      className={`staff-container ${animateKey ? 'slide-in' : ''}`}
      ref={containerRef} 
    />
  );
}
