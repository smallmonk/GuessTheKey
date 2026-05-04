import { useEffect, useRef } from 'react';

import { Note } from '../utils/intervals';
import { RhythmNote, TimeSignature } from '../utils/timeSignatures';
import { OrnamentVoiceConfig } from '../utils/ornaments';
import { CadenceNote } from '../utils/cadences';
import { QuestionType } from '../App';

interface StaffDisplayProps {
  clef: string;
  vexKey?: string;
  intervalNotes?: [Note, Note];
  timeSignatureNotes?: RhythmNote[];
  timeSignature?: TimeSignature;
  ornamentNotes?: RhythmNote[];
  ornamentVoiceConfig?: OrnamentVoiceConfig;
  cadenceChords?: CadenceNote[];
  questionType?: QuestionType;
  animateKey: boolean;
}

export default function StaffDisplay({ clef, vexKey, intervalNotes, timeSignatureNotes, timeSignature, ornamentNotes, ornamentVoiceConfig, cadenceChords, questionType = 'keys', animateKey }: StaffDisplayProps) {
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

          const isTimeSignature = questionType === 'timeSignatures';
          const isOrnament = questionType === 'ornaments';
          const isCadence = questionType === 'cadences';
          const scale = 1.5;

          // For time signatures and ornaments, calculate dynamic width based on number of notes
          let numNotes = 0;
          if (isTimeSignature && timeSignatureNotes) {
             numNotes = timeSignatureNotes.length;
          } else if (isOrnament && ornamentNotes) {
             numNotes = ornamentNotes.length;
          } else if (isCadence && cadenceChords) {
             numNotes = cadenceChords.length;
          }

          // Minimum width + space per note. We want a more compact style.
          let dynamicStaveWidth = 140;
          if (isTimeSignature || isOrnament || isCadence) {
             // Increase space per note from 25 to 17.5 to prevent crowding
             // Increase base width from 60 to 80
             dynamicStaveWidth = Math.max(150, 80 + (numNotes * 17.5));
          }

          // Renderer width must accommodate the stave width * scale + padding
          // Increased padding from 20 to 40 to prevent left/right cutoff
          const rendererWidth = (dynamicStaveWidth + 40) * scale;

          // Configure the renderer size
          // Increase height to prevent bottom of treble clef from being cut off
          renderer.resize(rendererWidth, 200);

          // Make the SVG scale down rather than overflow or get clipped
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.setAttribute('viewBox', `0 0 ${rendererWidth} 200`);
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
          }

          const context = renderer.getContext();

          // Increase size via SVG transform for better readability
          context.scale(scale, scale);

          // Create a stave on the canvas
          // Shifted x-position from 10 to 20 to prevent left edge cutoff of the clef
          const stave = new Stave(20, 20, dynamicStaveWidth);

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

            const { Voice } = VexFlowCore;
            const voice = new Voice({ numBeats: 4, beatValue: 4 });
            voice.addTickables([staveNote]);

            formatter.joinVoices([voice]).formatToStave([voice], stave);

            voice.draw(context, stave);
          } else if (questionType === 'timeSignatures' && timeSignatureNotes && timeSignature) {
            stave.setContext(context).draw();

            const { StaveNote, Formatter, Voice, Beam } = VexFlowCore;

            const staveNotes = timeSignatureNotes.map(n => {
              return new StaveNote({
                keys: n.keys,
                duration: n.duration,
                clef: clef
              });
            });

            // Need to specify the correct time signature to the voice for verification
            const voice = new Voice({
              numBeats: timeSignature.numBeats,
              beatValue: timeSignature.beatValue
            });
            voice.addTickables(staveNotes);

            // Apply beaming using vexflow's auto-beaming feature.
            // VexFlow's generateBeams handles time signature groupings if we pass a standard configuration.
            // But we don't necessarily have all standard groupings. Let's just pass the notes and no config for auto default.
            const beams = Beam.generateBeams(staveNotes);

            const formatter = new Formatter();
            formatter.joinVoices([voice]).formatToStave([voice], stave);

            voice.draw(context, stave);

            beams.forEach(b => b.setContext(context).draw());
          } else if (questionType === 'ornaments' && ornamentNotes && ornamentVoiceConfig) {
            stave.setContext(context).draw();

            const { StaveNote, Formatter, Voice, Beam } = VexFlowCore;

            const staveNotes = ornamentNotes.map(n => {
              return new StaveNote({
                keys: n.keys,
                duration: n.duration,
                clef: clef
              });
            });

            const voice = new Voice({
              numBeats: ornamentVoiceConfig.numBeats,
              beatValue: ornamentVoiceConfig.beatValue
            });
            voice.addTickables(staveNotes);

            const beams = Beam.generateBeams(staveNotes);

            const formatter = new Formatter();
            formatter.joinVoices([voice]).formatToStave([voice], stave);

            voice.draw(context, stave);

            beams.forEach(b => b.setContext(context).draw());
          } else if (questionType === 'cadences' && cadenceChords && vexKey) {
            stave.addKeySignature(vexKey);
            stave.setContext(context).draw();

            const { StaveNote, Accidental, Formatter, Voice } = VexFlowCore;

            const staveNotes = cadenceChords.map(chord => {
              return new StaveNote({
                keys: chord.keys,
                duration: chord.duration,
                clef: clef
              });
            });

            // Cadence typically 2 half notes = 4 beats
            const voice = new Voice({
              numBeats: 4,
              beatValue: 4
            });
            voice.addTickables(staveNotes);

            Accidental.applyAccidentals([voice], vexKey);

            const formatter = new Formatter();
            formatter.joinVoices([voice]).formatToStave([voice], stave);

            voice.draw(context, stave);
          }
        });
    });

  }, [clef, vexKey, intervalNotes, timeSignatureNotes, timeSignature, ornamentNotes, ornamentVoiceConfig, cadenceChords, questionType]);

  return (
    <div 
      className={`staff-container ${animateKey ? 'slide-in' : ''}`}
      ref={containerRef} 
      role="img"
      aria-label="Musical staff"
    />
  );
}
