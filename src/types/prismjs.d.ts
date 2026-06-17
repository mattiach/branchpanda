declare module 'prismjs' {
  export interface Grammar {
    [key: string]: unknown;
  }

  export const languages: Record<string, Grammar>;

  export function highlight(code: string, grammar: Grammar, language: string): string;

  const Prism: {
    languages: Record<string, Grammar>;
    highlight: typeof highlight;
  };

  export default Prism;
}

declare module 'prismjs/components/*';
