import { Annotation, type AnnotationType } from '@codemirror/state';

/** Marks a document change that should reach observers without calling `onValueChange`. */
export const ExternalChange: AnnotationType<boolean> = Annotation.define<boolean>();
