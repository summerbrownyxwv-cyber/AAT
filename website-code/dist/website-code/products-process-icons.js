const drawing = markup => `<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${markup}</g>`;

// One outline per form keeps the illustrations clear at both overview and detail sizes.
export const processIcons = {
  brief: drawing(`
    <path d="M24 12 L58 12 L76 30 L76 88 L24 88 Z M58 12 L58 30 L76 30"/>
    <path d="M36 43 L64 43 M36 55 L64 55 M36 67 L54 67"/>
  `),
  research: drawing(`
    <path d="M30 20 L20 20 L20 86 L48 86 M56 20 L66 20 L66 42"/>
    <rect x="30" y="12" width="26" height="16" rx="3"/>
    <path d="M30 40 L54 40 M30 52 L44 52 M77 73 L87 83"/>
    <circle cx="66" cy="62" r="15"/>
  `),
  review: drawing(`
    <path d="M14 32 L14 22 L40 22 L48 32 L86 32 L86 82 L14 82 Z M14 40 L86 40"/>
    <path d="M34 59 L46 71 L68 49"/>
  `),
  design: drawing(`
    <rect x="14" y="20" width="72" height="54" rx="4"/>
    <path d="M50 74 L50 86 M34 86 L66 86"/>
    <rect x="30" y="34" width="30" height="26" rx="2"/>
    <path d="M66 34 L74 34 M66 46 L74 46 M66 58 L74 58"/>
  `),
  test: drawing(`
    <rect x="14" y="20" width="72" height="58" rx="4"/>
    <path d="M26 49 C38 32 62 32 74 49 C62 66 38 66 26 49 Z"/>
    <circle cx="50" cy="49" r="8"/>
    <path d="M36 88 L64 88 M50 78 L50 88"/>
  `),
  confirm: drawing(`
    <circle cx="36" cy="30" r="14"/>
    <path d="M14 84 L14 70 C14 57 24 50 36 50 C48 50 58 57 58 70 L58 84 Z M27 52 L36 64 L45 52"/>
    <circle cx="76" cy="70" r="14"/>
    <path d="M69 70 L74 75 L83 65"/>
  `),
  sample: drawing(`
    <rect x="20" y="18" width="60" height="50" rx="3"/>
    <path d="M20 68 L12 82 L88 82 L80 68 M40 76 L60 76"/>
    <path d="M34 34 L50 27 L66 34 L66 53 L50 60 L34 53 Z M34 34 L50 42 L66 34 M50 42 L50 60"/>
  `),
  risk: drawing(`
    <path d="M46 16 C48 12 52 12 54 16 L88 77 C90 81 87 86 83 86 L17 86 C13 86 10 81 12 77 Z"/>
    <path d="M50 35 L50 59"/>
    <circle cx="50" cy="72" r="2"/>
  `),
  handshake: drawing(`
    <path d="M12 34 L24 22 L36 33 L22 52 Z M88 34 L76 22 L64 33 L78 52 Z"/>
    <path d="M34 35 L44 30 L52 33 M66 35 L55 30 L38 45 C34 49 38 55 43 52 L53 44 L75 64 C79 68 73 75 69 71 L55 59 M69 71 C70 76 64 80 60 76 L48 66 M60 76 C60 81 54 84 50 80 L40 72 M22 52 L38 69 M78 52 L72 59"/>
    <path d="M33 60 L27 66 C24 70 29 75 33 72 L39 66 M39 66 L33 72 C30 76 35 81 39 78 L45 72 M45 72 L40 78 C37 82 42 86 46 83 L50 79"/>
  `),
  production: drawing(`
    <circle cx="32" cy="28" r="11"/><circle cx="68" cy="28" r="11"/>
    <path d="M17 64 L17 52 C17 44 24 39 32 39 C40 39 47 44 47 52 L47 64 M53 64 L53 52 C53 44 60 39 68 39 C76 39 83 44 83 52 L83 64"/>
    <rect x="12" y="66" width="76" height="20" rx="10"/>
    <path d="M24 76 L24 76 M41 76 L41 76 M59 76 L59 76 M76 76 L76 76 M24 86 L24 90 M76 86 L76 90"/>
  `),
  quote: drawing(`
    <path d="M48 86 L24 86 L24 14 L74 14 L74 48"/>
    <path d="M36 30 L62 30 M36 42 L62 42 M36 54 L46 54"/>
    <circle cx="69" cy="71" r="18"/>
    <path d="M61 61 L69 70 L77 61 M69 70 L69 82 M61 73 L77 73 M61 78 L77 78"/>
  `),
  odmDesign: drawing(`
    <path d="M17 28 L28 17 L83 72 L72 83 Z M34 23 L28 29 M45 34 L39 40 M56 45 L50 51 M67 56 L61 62"/>
    <path d="M17 75 L72 20 L81 29 L26 84 L14 87 Z M17 75 L26 84 M66 26 L75 35"/>
  `),
  odmConfirm: drawing(`
    <path d="M48 86 L24 86 L24 14 L57 14 L74 31 L74 48 M57 14 L57 31 L74 31"/>
    <path d="M36 43 L58 43 M36 55 L46 55"/>
    <circle cx="69" cy="71" r="18"/>
    <path d="M60 71 L67 78 L79 64"/>
  `),
  odmModify: drawing(`
    <path d="M18 65 L66 17 C69 14 72 14 75 17 L82 24 C85 27 85 30 82 33 L34 81 L14 85 Z M18 65 L34 81 M61 22 L77 38"/>
    <path d="M45 85 L86 85 M57 72 L86 72 M70 59 L86 59"/>
  `),
  odmTest: drawing(`
    <path d="M22 16 L22 34 M22 50 L22 86 M50 16 L50 56 M50 72 L50 86 M78 16 L78 25 M78 41 L78 86"/>
    <circle cx="22" cy="42" r="8"/><circle cx="50" cy="64" r="8"/><circle cx="78" cy="33" r="8"/>
  `),
  odmProduction: drawing(`
    <path d="M48 86 L18 86 L18 24 L78 24 L78 48 M18 39 L78 39 M32 14 L32 30 M64 14 L64 30 M30 53 L46 53 M30 65 L42 65"/>
    <circle cx="69" cy="71" r="18"/>
    <path d="M69 60 L69 71 L78 76"/>
  `)
};
