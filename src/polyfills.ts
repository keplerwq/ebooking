polyfills()

export default function polyfills() {
    
  if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
  }
}
