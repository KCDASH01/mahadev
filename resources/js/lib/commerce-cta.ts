/**

 * Semantic CTA styles inspired by Flipkart / Myntra / Amazon India patterns,

 * using the Mahadev brand palette.

 */

const base =

    'inline-flex items-center justify-center gap-2 font-bold tracking-wide uppercase transition disabled:cursor-not-allowed disabled:opacity-60';



/** Outlined cart action — Add to Cart */

export const addToCartCtaClass = `${base} border-2 border-[#062A4D] bg-[#FCFAF5] text-[#062A4D] hover:bg-[#062A4D] hover:text-white`;



/** Outlined — View Cart */

export const viewCartCtaClass = `${base} border-2 border-[#062A4D] bg-white text-[#062A4D] hover:bg-[#062A4D] hover:text-white`;



/** Primary solid — Buy Now */

export const buyNowCtaClass = `${base} bg-[#062A4D] text-white shadow-sm hover:bg-[#041F3A]`;



/** Primary solid — Proceed to Checkout */

export const checkoutCtaClass = `${base} bg-[#062A4D] text-white shadow-sm hover:bg-[#041F3A]`;



/** Brand primary solid — Pay Now (online payment) */

export const payNowCtaClass = `${base} bg-[#062A4D] text-white shadow-sm hover:bg-[#041F3A]`;



/** Brand primary solid — Place Order (COD) */

export const placeOrderCtaClass = `${base} bg-[#062A4D] text-white shadow-sm hover:bg-[#041F3A]`;



/** Neutral secondary — Continue Shopping */

export const continueShoppingCtaClass = `${base} border border-slate-300 bg-white text-slate-700 hover:border-[#062A4D] hover:text-[#062A4D]`;



export function checkoutActionCtaClass(method: 'razorpay' | 'cod'): string {

    return method === 'cod' ? placeOrderCtaClass : payNowCtaClass;

}



/** Selected size chip */

export const selectedSizeClass = 'border-[#062A4D] bg-[#062A4D] text-white shadow-sm';



/** Selected color swatch ring */

export const selectedColorSwatchClass = 'border-[#062A4D] ring-2 ring-[#062A4D]/35';


