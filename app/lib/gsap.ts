import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register once; safe to import from any client component.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
