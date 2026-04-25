import { useEffect, useRef } from 'react';

import { Note } from '../utils/intervals';
import { QuestionType } from '../App';

interface StaffDisplayProps {
  clef: string;
  vexKey?: string;
  intervalNotes?: [Note, Note];
  questionType?: QuestionType;
  animateKey: boolean;
}

export default function StaffDisplay({ clef, vexKey, intervalNotes, questionType = 'keys', animateKey }: StaffDisplayProps) {
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
          // Increase height to prevent bottom of treble clef from being cut off
          renderer.resize(250, 200);
          const context = renderer.getContext();
          // Context styling for a modern look

          // Increase size via SVG transform for better readability
          context.scale(1.5, 1.5);

          // Create a stave of width 150 on the canvas.
          const stave = new Stave(10, 20, 140);

          stave.addClef(clef);

          if (questionType === 'keys' && vexKey) {
            stave.addKeySignature(vexKey);
            stave.setContext(context).draw();
          } else if (questionType === 'intervals' && intervalNotes) {
            stave.setContext(context).draw();

            const { StaveNote, Accidental, Formatter } = VexFlowCore;

            const noteStr1 = `${intervalNotes[0].name}/${intervalNotes[0].octave}`;
            const noteStr2 = `${intervalNotes[1].name}/${intervalNotes[1].octave}`;

            // Draw as a chord (harmonic interval)
            const staveNote = new StaveNote({
              keys: [noteStr1, noteStr2],
              duration: "w",
              clef: clef
            });

            if (intervalNotes[0].accidental) {
              staveNote.addModifier(new Accidental(intervalNotes[0].accidental), 0);
            }
            if (intervalNotes[1].accidental) {
              staveNote.addModifier(new Accidental(intervalNotes[1].accidental), 1);
            }




            const formatter = new Formatter();

            const voice = new VexFlowCore.Voice({ numBeats: 4, beatValue: 4 });
            voice.addTickables([staveNote]);

            formatter.joinVoices([voice]).formatToStave([voice], stave);

            voice.draw(context, stave);
          }
        });
    });

  }, [clef, vexKey, intervalNotes, questionType]);

  return (
    <div 
      className={`staff-container ${animateKey ? 'slide-in' : ''}`}
      ref={containerRef} 
    />
  );
}
