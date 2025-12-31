// global.d.ts
export {};

declare global {
  interface HTMLElement {
    inert?: boolean;
  }

  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement> & { inert?: boolean },
        HTMLDivElement
      >;
    }
  }
}
