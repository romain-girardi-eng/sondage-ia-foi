'use client';

import { useRef, useMemo, useSyncExternalStore, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useTheme } from '@/lib/theme/ThemeContext';
import Link from 'next/link';

gsap.registerPlugin(SplitText, useGSAP);

// Hook to safely detect client-side rendering
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// Hook to track visibility and idle state for shader optimization
function useShaderPause(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [isPaused, setIsPaused] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisibleRef = useRef(true);
  const IDLE_TIMEOUT = 10000; // 10 seconds of inactivity

  // Reset idle timer on user interaction - doesn't set state directly
  const handleInteraction = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    // Only unpause if visible
    if (isVisibleRef.current) {
      setIsPaused(false);
    }
    idleTimerRef.current = setTimeout(() => {
      setIsPaused(true);
    }, IDLE_TIMEOUT);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // IntersectionObserver for visibility
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisibleRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          setIsPaused(true);
          if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
          }
        } else {
          // Trigger idle detection for visible state
          handleInteraction();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);

    // User interaction listeners for idle detection
    const interactionEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    interactionEvents.forEach((event) => {
      window.addEventListener(event, handleInteraction, { passive: true });
    });

    // Start idle timer after a brief delay to avoid initial setState during render
    const initialTimer = setTimeout(() => {
      idleTimerRef.current = setTimeout(() => {
        setIsPaused(true);
      }, IDLE_TIMEOUT);
    }, 100);

    return () => {
      observer.disconnect();
      interactionEvents.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      clearTimeout(initialTimer);
    };
  }, [containerRef, handleInteraction]);

  return isPaused;
}

// ===================== SPIRITUAL SHADER =====================
// Modified CPPN shader with warmer, more ethereal colors
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  #ifdef GL_ES
    precision lowp float;
  #endif
  uniform float iTime;
  uniform vec2 iResolution;
  uniform float uDarkMode;
  varying vec2 vUv;

  vec4 buf[8];

  vec4 sigmoid(vec4 x) { return 1. / (1. + exp(-x)); }

  vec4 cppn_fn(vec2 coordinate, float in0, float in1, float in2) {
    // layer 1
    buf[6] = vec4(coordinate.x, coordinate.y, 0.3948333106474662 + in0, 0.36 + in1);
    buf[7] = vec4(0.14 + in2, sqrt(coordinate.x * coordinate.x + coordinate.y * coordinate.y), 0., 0.);

    // layer 2
    buf[0] = mat4(vec4(6.5404263, -3.6126034, 0.7590882, -1.13613), vec4(2.4582713, 3.1660357, 1.2219609, 0.06276096), vec4(-5.478085, -6.159632, 1.8701609, -4.7742867), vec4(6.039214, -5.542865, -0.90925294, 3.251348))
    * buf[6]
    + mat4(vec4(0.8473259, -5.722911, 3.975766, 1.6522468), vec4(-0.24321538, 0.5839259, -1.7661959, -5.350116), vec4(0.0, 0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0))
    * buf[7]
    + vec4(0.21808943, 1.1243913, -1.7969975, 5.0294676);

    buf[1] = mat4(vec4(-3.3522482, -6.0612736, 0.55641043, -4.4719114), vec4(0.8631464, 1.7432913, 5.643898, 1.6106541), vec4(2.4941394, -3.5012043, 1.7184316, 6.357333), vec4(3.310376, 8.209261, 1.1355612, -1.165539))
    * buf[6]
    + mat4(vec4(5.24046, -13.034365, 0.009859298, 15.870829), vec4(2.987511, 3.129433, -0.89023495, -1.6822904), vec4(0.0, 0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0))
    * buf[7]
    + vec4(-5.9457836, -6.573602, -0.8812491, 1.5436668);

    buf[0] = sigmoid(buf[0]);
    buf[1] = sigmoid(buf[1]);

    // layer 3
    buf[2] = mat4(vec4(-15.219568, 8.095543, -2.429353, -1.9381982), vec4(-5.951362, 4.3115187, 2.6393783, 1.274315), vec4(-7.3145227, 6.7297835, 5.2473326, 5.9411426), vec4(5.0796127, 8.979051, -1.7278991, -1.158976))
    * buf[6]
    + mat4(vec4(-11.967154, -11.608155, 6.1486754, 11.237008), vec4(2.124141, -6.263192, -1.7050359, -0.7021966), vec4(0.0, 0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0))
    * buf[7]
    + vec4(-4.17164, -3.2281182, -4.576417, -3.6401186);

    buf[3] = mat4(vec4(3.1832156, -13.738922, 1.879223, 3.233465), vec4(0.64300746, 12.768129, 1.9141049, 0.50990224), vec4(-0.049295485, 4.4807224, 1.4733979, 1.801449), vec4(5.0039253, 13.000481, 3.3991797, -4.5561905))
    * buf[6]
    + mat4(vec4(-0.1285731, 7.720628, -3.1425676, 4.742367), vec4(0.6393625, 3.714393, -0.8108378, -0.39174938), vec4(0.0, 0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0))
    * buf[7]
    + vec4(-1.1811101, -21.621881, 0.7851888, 1.2329718);

    buf[2] = sigmoid(buf[2]);
    buf[3] = sigmoid(buf[3]);

    // layer 5 & 6
    buf[4] = mat4(vec4(5.214916, -7.183024, 2.7228765, 2.6592617), vec4(-5.601878, -25.3591, 4.067988, 0.4602802), vec4(-10.57759, 24.286327, 21.102104, 37.546658), vec4(4.3024497, -1.9625226, 2.3458803, -1.372816))
    * buf[0]
    + mat4(vec4(-17.6526, -10.507558, 2.2587414, 12.462782), vec4(6.265566, -502.75443, -12.642513, 0.9112289), vec4(-10.983244, 20.741234, -9.701768, -0.7635988), vec4(5.383626, 1.4819539, -4.1911616, -4.8444734))
    * buf[1]
    + mat4(vec4(12.785233, -16.345072, -0.39901125, 1.7955981), vec4(-30.48365, -1.8345358, 1.4542528, -1.1118771), vec4(19.872723, -7.337935, -42.941723, -98.52709), vec4(8.337645, -2.7312303, -2.2927687, -36.142323))
    * buf[2]
    + mat4(vec4(-16.298317, 3.5471997, -0.44300047, -9.444417), vec4(57.5077, -35.609753, 16.163465, -4.1534753), vec4(-0.07470326, -3.8656476, -7.0901804, 3.1523974), vec4(-12.559385, -7.077619, 1.490437, -0.8211543))
    * buf[3]
    + vec4(-7.67914, 15.927437, 1.3207729, -1.6686112);

    buf[5] = mat4(vec4(-1.4109162, -0.372762, -3.770383, -21.367174), vec4(-6.2103205, -9.35908, 0.92529047, 8.82561), vec4(11.460242, -22.348068, 13.625772, -18.693201), vec4(-0.3429052, -3.9905605, -2.4626114, -0.45033523))
    * buf[0]
    + mat4(vec4(7.3481627, -4.3661838, -6.3037653, -3.868115), vec4(1.5462853, 6.5488915, 1.9701879, -0.58291394), vec4(6.5858274, -2.2180402, 3.7127688, -1.3730392), vec4(-5.7973905, 10.134961, -2.3395722, -5.965605))
    * buf[1]
    + mat4(vec4(-2.5132585, -6.6685553, -1.4029363, -0.16285264), vec4(-0.37908727, 0.53738135, 4.389061, -1.3024765), vec4(-0.70647055, 2.0111287, -5.1659346, -3.728635), vec4(-13.562562, 10.487719, -0.9173751, -2.6487076))
    * buf[2]
    + mat4(vec4(-8.645013, 6.5546675, -6.3944063, -5.5933375), vec4(-0.57783127, -1.077275, 36.91025, 5.736769), vec4(14.283112, 3.7146652, 7.1452246, -4.5958776), vec4(2.7192075, 3.6021907, -4.366337, -2.3653464))
    * buf[3]
    + vec4(-5.9000807, -4.329569, 1.2427121, 8.59503);

    buf[4] = sigmoid(buf[4]);
    buf[5] = sigmoid(buf[5]);

    // layer 7 & 8
    buf[6] = mat4(vec4(-1.61102, 0.7970257, 1.4675229, 0.20917463), vec4(-28.793737, -7.1390953, 1.5025433, 4.656581), vec4(-10.94861, 39.66238, 0.74318546, -10.095605), vec4(-0.7229728, -1.5483948, 0.7301322, 2.1687684))
    * buf[0]
    + mat4(vec4(3.2547753, 21.489103, -1.0194173, -3.3100595), vec4(-3.7316632, -3.3792162, -7.223193, -0.23685838), vec4(13.1804495, 0.7916005, 5.338587, 5.687114), vec4(-4.167605, -17.798311, -6.815736, -1.6451967))
    * buf[1]
    + mat4(vec4(0.604885, -7.800309, -7.213122, -2.741014), vec4(-3.522382, -0.12359311, -0.5258442, 0.43852118), vec4(9.6752825, -22.853785, 2.062431, 0.099892326), vec4(-4.3196306, -17.730087, 2.5184598, 5.30267))
    * buf[2]
    + mat4(vec4(-6.545563, -15.790176, -6.0438633, -5.415399), vec4(-43.591583, 28.551912, -16.00161, 18.84728), vec4(4.212382, 8.394307, 3.0958717, 8.657522), vec4(-5.0237565, -4.450633, -4.4768, -5.5010443))
    * buf[3]
    + mat4(vec4(1.6985557, -67.05806, 6.897715, 1.9004834), vec4(1.8680354, 2.3915145, 2.5231109, 4.081538), vec4(11.158006, 1.7294737, 2.0738268, 7.386411), vec4(-4.256034, -306.24686, 8.258898, -17.132736))
    * buf[4]
    + mat4(vec4(1.6889864, -4.5852966, 3.8534803, -6.3482175), vec4(1.3543309, -1.2640043, 9.932754, 2.9079645), vec4(-5.2770967, 0.07150358, -0.13962056, 3.3269649), vec4(28.34703, -4.918278, 6.1044083, 4.085355))
    * buf[5]
    + vec4(6.6818056, 12.522166, -3.7075126, -4.104386);

    buf[7] = mat4(vec4(-8.265602, -4.7027016, 5.098234, 0.7509808), vec4(8.6507845, -17.15949, 16.51939, -8.884479), vec4(-4.036479, -2.3946867, -2.6055532, -1.9866527), vec4(-2.2167742, -1.8135649, -5.9759874, 4.8846445))
    * buf[0]
    + mat4(vec4(6.7790847, 3.5076547, -2.8191125, -2.7028968), vec4(-5.743024, -0.27844876, 1.4958696, -5.0517144), vec4(13.122226, 15.735168, -2.9397483, -4.101023), vec4(-14.375265, -5.030483, -6.2599335, 2.9848232))
    * buf[1]
    + mat4(vec4(4.0950394, -0.94011575, -5.674733, 4.755022), vec4(4.3809423, 4.8310084, 1.7425908, -3.437416), vec4(2.117492, 0.16342592, -104.56341, 16.949184), vec4(-5.22543, -2.994248, 3.8350096, -1.9364246))
    * buf[2]
    + mat4(vec4(-5.900337, 1.7946124, -13.604192, -3.8060522), vec4(6.6583457, 31.911177, 25.164474, 91.81147), vec4(11.840538, 4.1503043, -0.7314397, 6.768467), vec4(-6.3967767, 4.034772, 6.1714606, -0.32874924))
    * buf[3]
    + mat4(vec4(3.4992442, -196.91893, -8.923708, 2.8142626), vec4(3.4806502, -3.1846354, 5.1725626, 5.1804223), vec4(-2.4009497, 15.585794, 1.2863957, 2.0252278), vec4(-71.25271, -62.441242, -8.138444, 0.50670296))
    * buf[4]
    + mat4(vec4(-12.291733, -11.176166, -7.3474145, 4.390294), vec4(10.805477, 5.6337385, -0.9385842, -4.7348723), vec4(-12.869276, -7.039391, 5.3029537, 7.5436664), vec4(1.4593618, 8.91898, 3.5101583, 5.840625))
    * buf[5]
    + vec4(2.2415268, -6.705987, -0.98861027, -2.117676);

    buf[6] = sigmoid(buf[6]);
    buf[7] = sigmoid(buf[7]);

    // layer 9 - output with spiritual color mapping
    buf[0] = mat4(vec4(1.6794263, 1.3817469, 2.9625452, 0.0), vec4(-1.8834411, -1.4806935, -3.5924516, 0.0), vec4(-1.3279216, -1.0918057, -2.3124623, 0.0), vec4(0.2662234, 0.23235129, 0.44178495, 0.0))
    * buf[0]
    + mat4(vec4(-0.6299101, -0.5945583, -0.9125601, 0.0), vec4(0.17828953, 0.18300213, 0.18182953, 0.0), vec4(-2.96544, -2.5819945, -4.9001055, 0.0), vec4(1.4195864, 1.1868085, 2.5176322, 0.0))
    * buf[1]
    + mat4(vec4(-1.2584374, -1.0552157, -2.1688404, 0.0), vec4(-0.7200217, -0.52666044, -1.438251, 0.0), vec4(0.15345335, 0.15196142, 0.272854, 0.0), vec4(0.945728, 0.8861938, 1.2766753, 0.0))
    * buf[2]
    + mat4(vec4(-2.4218085, -1.968602, -4.35166, 0.0), vec4(-22.683098, -18.0544, -41.954372, 0.0), vec4(0.63792, 0.5470648, 1.1078634, 0.0), vec4(-1.5489894, -1.3075932, -2.6444845, 0.0))
    * buf[3]
    + mat4(vec4(-0.49252132, -0.39877754, -0.91366625, 0.0), vec4(0.95609266, 0.7923952, 1.640221, 0.0), vec4(0.30616966, 0.15693925, 0.8639857, 0.0), vec4(1.1825981, 0.94504964, 2.176963, 0.0))
    * buf[4]
    + mat4(vec4(0.35446745, 0.3293795, 0.59547555, 0.0), vec4(-0.58784515, -0.48177817, -1.0614829, 0.0), vec4(2.5271258, 1.9991658, 4.6846647, 0.0), vec4(0.13042648, 0.08864098, 0.30187556, 0.0))
    * buf[5]
    + mat4(vec4(-1.7718065, -1.4033192, -3.3355875, 0.0), vec4(3.1664357, 2.638297, 5.378702, 0.0), vec4(-3.1724713, -2.6107926, -5.549295, 0.0), vec4(-2.851368, -2.249092, -5.3013067, 0.0))
    * buf[6]
    + mat4(vec4(1.5203838, 1.2212278, 2.8404984, 0.0), vec4(1.5210563, 1.2651345, 2.683903, 0.0), vec4(2.9789467, 2.4364579, 5.2347264, 0.0), vec4(2.2270417, 1.8825914, 3.8028636, 0.0))
    * buf[7]
    + vec4(-1.5468478, -3.6171484, 0.24762098, 0.0);

    buf[0] = sigmoid(buf[0]);

    // Dark mode: deep purples, warm golds, soft blues
    float darkR = buf[0].x * 0.4 + buf[0].z * 0.3 + 0.08;
    float darkG = buf[0].y * 0.25 + buf[0].x * 0.15 + 0.05;
    float darkB = buf[0].z * 0.5 + buf[0].x * 0.2 + 0.15;

    // Light mode: soft pastels on light background - same pattern, inverted and lighter
    float lightR = 0.95 - buf[0].x * 0.15 - buf[0].z * 0.1;
    float lightG = 0.93 - buf[0].y * 0.12 - buf[0].x * 0.08;
    float lightB = 0.97 - buf[0].z * 0.18 - buf[0].x * 0.08;

    // Mix between light and dark based on uDarkMode (0.0 = light, 1.0 = dark)
    float r = mix(lightR, darkR, uDarkMode);
    float g = mix(lightG, darkG, uDarkMode);
    float b = mix(lightB, darkB, uDarkMode);

    return vec4(r, g, b, 1.0);
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0; uv.y *= -1.0;
    // Slightly faster, flowing animation
    gl_FragColor = cppn_fn(uv, 0.08 * sin(0.35 * iTime), 0.08 * sin(0.55 * iTime), 0.08 * sin(0.42 * iTime));
  }
`;

const SpiritualShaderMaterial = shaderMaterial(
  { iTime: 0, iResolution: new THREE.Vector2(1, 1), uDarkMode: 1.0 },
  vertexShader,
  fragmentShader
);

extend({ SpiritualShaderMaterial });

interface ShaderPlaneProps {
  isPaused?: boolean;
  isDarkMode?: boolean;
}

function ShaderPlane({ isPaused = false, isDarkMode = true }: ShaderPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRef = useRef<any>(null!);
  const lastTimeRef = useRef(0);
  const { viewport } = useThree();

  useFrame((state) => {
    if (!materialRef.current) return;

    // Skip time updates when paused to reduce GPU usage
    if (!isPaused) {
      lastTimeRef.current = state.clock.elapsedTime;
    }

    materialRef.current.iTime = lastTimeRef.current;
    materialRef.current.uDarkMode = isDarkMode ? 1.0 : 0.0;
    const { width, height } = state.size;
    materialRef.current.iResolution.set(width, height);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <spiritualShaderMaterial ref={materialRef} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ShaderBackground() {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const isClient = useIsClient();
  const isPaused = useShaderPause(canvasRef);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const camera = useMemo(() => ({
    position: [0, 0, 1] as [number, number, number],
    fov: 75,
    near: 0.1,
    far: 1000
  }), []);

  useGSAP(
    () => {
      if (!canvasRef.current) return;

      gsap.set(canvasRef.current, {
        filter: 'blur(20px)',
        autoAlpha: 0
      });

      gsap.to(canvasRef.current, {
        filter: 'blur(0px)',
        autoAlpha: 1,
        duration: 1.5,
        ease: 'power2.out',
        delay: 0.1
      });
    },
    { scope: canvasRef, dependencies: [isClient] }
  );

  const shaderStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 0,
    padding: 0,
    zIndex: -10,
  };

  if (!isClient) {
    return (
      <div
        className="bg-gradient-to-br from-slate-100 via-purple-100/30 to-slate-100 dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950"
        style={shaderStyle}
      />
    );
  }

  return (
    <div ref={canvasRef} style={shaderStyle} aria-hidden>
      <Canvas
        camera={camera}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
        style={{ display: 'block', width: '100%', height: '100%' }}
        // Reduce frame rate when paused for battery/GPU savings
        frameloop={isPaused ? "demand" : "always"}
      >
        <ShaderPlane isPaused={isPaused} isDarkMode={isDarkMode} />
      </Canvas>
    </div>
  );
}

// ===================== SPIRITUAL HERO COMPONENT =====================
interface FeatureItem {
  icon: string;
  text: string;
  link?: string;
}

interface SpiritualHeroProps {
  title: string;
  subtitle?: string;
  description: string;
  badgeText?: string;
  badgeLabel?: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  onPrimaryClick: () => void;
  onSecondaryClick?: () => void;
  features?: FeatureItem[];
  consentGiven?: boolean;
  onConsentChange?: (consent: boolean) => void;
  consentLabel?: string;
  privacyLink?: string;
  privacyLinkText?: string;
  // Author credits
  authorName?: string;
  authorLabel?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export default function SpiritualShaderHero({
  title,
  subtitle,
  description,
  badgeText,
  badgeLabel,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
  features = [],
  consentGiven = false,
  onConsentChange,
  consentLabel,
  privacyLink,
  privacyLinkText = "Learn more",
  authorName,
  authorLabel,
  githubUrl,
  linkedinUrl,
}: SpiritualHeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const paraRef = useRef<HTMLParagraphElement | null>(null);
  const consentRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const isClient = useIsClient();

  useGSAP(
    () => {
      if (!headerRef.current || !isClient) return;

      document.fonts.ready.then(() => {
        const split = new SplitText(headerRef.current!, {
          type: 'lines',
          linesClass: 'overflow-hidden',
        });

        gsap.set(split.lines, {
          filter: 'blur(12px)',
          yPercent: 100,
          autoAlpha: 0,
        });

        if (badgeRef.current) {
          gsap.set(badgeRef.current, { autoAlpha: 0, y: -12, scale: 0.95 });
        }
        if (subtitleRef.current) {
          gsap.set(subtitleRef.current, { autoAlpha: 0, y: 12 });
        }
        if (paraRef.current) {
          gsap.set(paraRef.current, { autoAlpha: 0, y: 16 });
        }
        if (consentRef.current) {
          gsap.set(consentRef.current, { autoAlpha: 0, y: 16 });
        }
        if (ctaRef.current) {
          gsap.set(ctaRef.current, { autoAlpha: 0, y: 16 });
        }
        if (featuresRef.current) {
          gsap.set(featuresRef.current.children, { autoAlpha: 0, y: 12 });
        }

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          delay: 0.5
        });

        if (badgeRef.current) {
          tl.to(badgeRef.current, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 }, 0);
        }

        tl.to(
          split.lines,
          {
            filter: 'blur(0px)',
            yPercent: 0,
            autoAlpha: 1,
            duration: 1,
            stagger: 0.12,
          },
          0.2
        );

        if (subtitleRef.current) {
          tl.to(subtitleRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.5');
        }
        if (paraRef.current) {
          tl.to(paraRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.4');
        }
        if (consentRef.current) {
          tl.to(consentRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.3');
        }
        if (ctaRef.current) {
          tl.to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.3');
        }
        if (featuresRef.current && featuresRef.current.children.length > 0) {
          tl.to(featuresRef.current.children, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08
          }, '-=0.2');
        }
      });
    },
    { scope: sectionRef, dependencies: [isClient] }
  );

  return (
    <section ref={sectionRef} className="relative min-h-[100dvh] w-full">
      <ShaderBackground />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-4xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        {/* Badge */}
        {(badgeLabel || badgeText) && (
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-4 py-2 backdrop-blur-sm"
          >
            {badgeLabel && (
              <>
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-primary">
                  {badgeLabel}
                </span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              </>
            )}
            {badgeText && (
              <span className="text-xs font-light tracking-wide text-muted-foreground">
                {badgeText}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h1
          ref={headerRef}
          className="max-w-3xl text-4xl font-extralight leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            ref={subtitleRef}
            className="max-w-xl text-lg font-light leading-relaxed text-muted-foreground sm:text-xl"
          >
            {subtitle}
          </p>
        )}

        {/* Description */}
        <p
          ref={paraRef}
          className="max-w-xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg"
        >
          {description}
        </p>

        {/* Consent Checkbox */}
        {onConsentChange && consentLabel && (
          <div ref={consentRef} className="max-w-md">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => onConsentChange(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded border-2 border-slate-600 bg-white dark:border-white/30 dark:bg-white/5 transition-all peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500/30">
                  {consentGiven && (
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-muted-foreground text-left leading-relaxed group-hover:text-foreground transition-colors">
                {consentLabel}
                {privacyLink && (
                  <>
                    {' '}
                    <a
                      href={privacyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {privacyLinkText}
                    </a>
                  </>
                )}
              </span>
            </label>
          </div>
        )}

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onPrimaryClick}
            disabled={onConsentChange && !consentGiven}
            className="group relative overflow-hidden rounded-2xl bg-foreground px-8 py-4 text-base font-medium text-background transition-all duration-300 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="relative z-10">{primaryButtonText}</span>
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-purple-200 to-blue-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </button>

          {secondaryButtonText && onSecondaryClick && (
            <button
              onClick={onSecondaryClick}
              className="rounded-2xl border border-border bg-background/50 px-8 py-4 text-base font-light text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {secondaryButtonText}
            </button>
          )}
        </div>

        {/* Features & Credits - Unified compact section */}
        {(features.length > 0 || authorName) && (
          <div
            ref={featuresRef}
            className="mt-6 flex flex-col items-center gap-3"
          >
            {/* Features row */}
            {features.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm font-light text-muted-foreground">
                {features.map((feature, index) => (
                  feature.link ? (
                    <Link
                      key={index}
                      href={feature.link}
                      className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-400 hover:text-blue-300 hover:border-blue-400/50 hover:bg-blue-500/20 transition-all duration-300 overflow-hidden"
                    >
                      {/* Shimmer effect */}
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      {/* Pulse glow */}
                      <span className="absolute inset-0 rounded-full animate-pulse-glow opacity-50" />
                      <span className="relative text-base">{feature.icon}</span>
                      <span className="relative">{feature.text}</span>
                      <svg
                        className="relative w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-base">{feature.icon}</span>
                      <span>{feature.text}</span>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Author credits row */}
            {authorName && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                {authorLabel && <span>{authorLabel}</span>}
                <span className="font-medium">{authorName}</span>
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                    aria-label="GitHub"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </section>
  );
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    spiritualShaderMaterial: {
      ref?: React.Ref<THREE.ShaderMaterial>;
      side?: THREE.Side;
      iTime?: number;
      iResolution?: THREE.Vector2;
      uDarkMode?: number;
    };
  }
}
