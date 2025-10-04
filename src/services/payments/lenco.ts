declare global {
  interface Window {
    LencoPay?: {
      getPaid: (options: any) => void;
    };
  }
}

const LENCOPAY_SCRIPT_URLS = {
  sandbox: 'https://pay.sandbox.lenco.co/js/v1/inline.js',
  live: 'https://pay.lenco.co/js/v1/inline.js',
};

let scriptLoaded: 'none' | 'sandbox' | 'live' = 'none';
let currentScript: HTMLScriptElement | null = null;

export async function ensureLencoScript(env: 'sandbox' | 'live' = 'sandbox'): Promise<void> {
  if (window.LencoPay && scriptLoaded === env) return;

  if (scriptLoaded !== 'none' && scriptLoaded !== env) {
    if (currentScript && currentScript.parentNode) {
      currentScript.parentNode.removeChild(currentScript);
    }
    window.LencoPay = undefined;
    scriptLoaded = 'none';
  }

  if (scriptLoaded === env && window.LencoPay) return;

  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = LENCOPAY_SCRIPT_URLS[env];
    s.async = true;
    s.onload = () => {
      scriptLoaded = env;
      currentScript = s;
      resolve();
    };
    s.onerror = () => reject(new Error('Failed to load LencoPay script'));
    document.head.appendChild(s);
  });
}

export type LencoChannels = Array<'card' | 'mobile-money'>;

export interface LencoCheckoutOptions {
  key: string; // public key
  reference: string;
  email: string;
  amount: number; // can include decimals
  currency: string; // e.g. 'ZMW'
  channels: LencoChannels;
  customer?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

type LencoCheckoutStatus = 'success' | 'pending' | 'cancelled';

export async function openLencoCheckout(opts: LencoCheckoutOptions, env: 'sandbox' | 'live' = 'sandbox'): Promise<{ reference: string; status: LencoCheckoutStatus }>{
  await ensureLencoScript(env);
  if (!window.LencoPay) throw new Error('LencoPay is unavailable');

  return new Promise((resolve, reject) => {
    try {
      window.LencoPay!.getPaid({
        key: opts.key,
        reference: opts.reference,
        email: opts.email,
        amount: opts.amount,
        currency: opts.currency,
        channels: opts.channels,
        customer: opts.customer,
        onSuccess: (response: any) => {
          if (response && response.reference) {
            resolve({ reference: response.reference, status: 'success' });
          } else {
            reject(new Error('Payment completed but missing reference'));
          }
        },
        onClose: () => {
          resolve({ reference: opts.reference, status: 'cancelled' });
        },
        onConfirmationPending: (pendingResponse: any) => {
          const pendingRef = pendingResponse?.reference ?? opts.reference;
          resolve({ reference: pendingRef, status: 'pending' });
        },
      });
    } catch (e) {
      reject(e);
    }
  });
}
