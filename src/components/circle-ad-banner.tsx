"use client";

import { useLayoutEffect, useRef } from "react";

const slides = [
  {
    id: "spoken",
    kicker: "AI Speaking Lab",
    title: "口语 7 天冲刺",
    subtitle: "音素纠错 + 每日打卡",
    cta: "立即训练",
    colors: ["#8b5cf6", "#06b6d4", "#f5d0fe"]
  },
  {
    id: "exam",
    kicker: "Exam Resource",
    title: "中考真题资料包",
    subtitle: "授权后解锁 PDF",
    cta: "领取资料",
    colors: ["#2563eb", "#14b8a6", "#dbeafe"]
  },
  {
    id: "event",
    kicker: "Live Event",
    title: "台州升学规划讲座",
    subtitle: "线上/线下名师专场",
    cta: "预约席位",
    colors: ["#f59e0b", "#ef4444", "#ffedd5"]
  }
] as const;

export function CircleAdBanner() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    let cleanup = () => {};

    async function animateBanner() {
      const { gsap } = await import("gsap");
      const root = rootRef.current;
      if (!root) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const context = gsap.context(() => {
        const slides = gsap.utils.toArray<HTMLElement>(".circle-ad-slide");
        const fullClip = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
        const closedRightClip = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
        const thirdRightClip = "polygon(67% 0%, 100% 0%, 100% 100%, 52% 100%)";
        const closedLeftClip = "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";

        gsap.set(slides, {
          autoAlpha: 0,
          clipPath: closedRightClip,
          zIndex: 1
        });
        gsap.set(slides[0], {
          autoAlpha: 1,
          clipPath: fullClip,
          zIndex: 2
        });
        gsap.set(slides[0].querySelectorAll(".circle-ad-copy, .circle-ad-logo, .circle-ad-cta"), {
          autoAlpha: 1,
          y: 0,
          scale: 1
        });

        if (reduceMotion) {
          gsap.set(slides, { autoAlpha: 0 });
          gsap.set(slides[0], { autoAlpha: 1, clipPath: fullClip });
          return;
        }

        const tl = gsap.timeline({
          repeat: -1,
          defaults: { overwrite: "auto" }
        });
        slides.forEach((current, index) => {
          const next = slides[(index + 1) % slides.length];
          const nextCopy = next.querySelectorAll(".circle-ad-copy");
          const nextLogo = next.querySelector(".circle-ad-logo");
          const nextCta = next.querySelector(".circle-ad-cta");
          const currentCopy = current.querySelectorAll(".circle-ad-copy, .circle-ad-logo, .circle-ad-cta");
          const currentArt = current.querySelector(".circle-ad-art");

          tl.set(current, {
              autoAlpha: 1,
              clipPath: fullClip,
              zIndex: 2
            })
            .set(currentCopy, { autoAlpha: 1, y: 0, scale: 1 })
            .set(currentArt, { x: 0, scale: 1 })
            .to({}, { duration: 3 })
            .set(next, {
              autoAlpha: 1,
              clipPath: closedRightClip,
              zIndex: 3
            })
            .set(nextCopy, { autoAlpha: 0, y: 12 })
            .set([nextLogo, nextCta], { autoAlpha: 0, y: 8, scale: 0.96 })
            .to(next, {
              duration: 0.86,
              clipPath: thirdRightClip,
              ease: "sine.inOut"
            })
            .to(currentCopy, {
              duration: 0.38,
              autoAlpha: 0,
              y: -6,
              ease: "sine.out"
            }, "-=0.42")
            .to(next, {
              duration: 0.92,
              clipPath: fullClip,
              ease: "sine.inOut"
            })
            .fromTo(next.querySelector(".circle-ad-art"),
              { x: 8, scale: 1.01 },
              { duration: 0.92, x: 0, scale: 1, ease: "sine.out" },
              "-=0.92"
            )
            .to(nextCopy, {
              duration: 0.48,
              autoAlpha: 1,
              y: 0,
              ease: "sine.out"
            }, "-=0.62")
            .to([nextLogo, nextCta], {
              duration: 0.42,
              autoAlpha: 1,
              y: 0,
              scale: 1,
              ease: "sine.out"
            }, "-=0.34")
            .set(current, {
              autoAlpha: 0,
              clipPath: closedLeftClip,
              zIndex: 1
            })
            .set(next, { zIndex: 2 });
        });
      }, root);

      cleanup = () => context.revert();
    }

    animateBanner();
    return () => cleanup();
  }, []);

  return (
    <div className="circle-ad-banner" ref={rootRef}>
      {slides.map((slide, index) => (
        <div aria-hidden={index !== 0} className="circle-ad-slide" key={slide.id}>
          <svg className="circle-ad-frame" role="img" viewBox="0 0 360 142" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id={`circle-ad-${slide.id}-glow`} cx="72%" cy="22%" r="72%">
                <stop offset="0%" stopColor="white" stopOpacity="0.72" />
                <stop offset="44%" stopColor={slide.colors[2]} stopOpacity="0.72" />
                <stop offset="100%" stopColor={slide.colors[0]} />
              </radialGradient>
              <linearGradient id={`circle-ad-${slide.id}-panel`} x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor={slide.colors[0]} />
                <stop offset="100%" stopColor={slide.colors[1]} />
              </linearGradient>
            </defs>
            <rect width="360" height="142" rx="24" fill={`url(#circle-ad-${slide.id}-glow)`} />
            <g className="circle-ad-art">
              <path d="M0 0h206l-58 142H0Z" fill={`url(#circle-ad-${slide.id}-panel)`} />
              <path d="M247 0h113v142H190Z" fill="rgba(255,255,255,0.78)" />
              <path d="M220 18h92c17.7 0 32 14.3 32 32v74H188l32-106Z" fill={slide.colors[2]} opacity="0.95" />
              <path d="M264 14l64 0 0 118-118 0 54-118Z" fill={slide.colors[0]} opacity="0.16" />
              <circle cx="68" cy="38" r="68" fill="rgba(255,255,255,0.18)" />
              <circle cx="116" cy="122" r="82" fill="rgba(17,24,39,0.12)" />
            </g>
            <g className="circle-ad-copy">
              <text x="22" y="36" fill="white" className="circle-ad-kicker">
                {slide.kicker}
              </text>
            </g>
            <g className="circle-ad-copy">
              <text x="22" y="72" fill="white" className="circle-ad-title">
                {slide.title}
              </text>
            </g>
            <g className="circle-ad-copy">
              <text x="24" y="99" fill="rgba(255,255,255,0.82)" className="circle-ad-subtitle">
                {slide.subtitle}
              </text>
            </g>
            <g className="circle-ad-logo" transform="translate(278 28)">
              <circle cx="24" cy="24" r="24" fill={slide.colors[0]} opacity="0.18" />
              <path d="M15 30h18l-9 9-9-9Zm9-22 15 15H27l-3-3-3 3H9L24 8Z" fill={slide.colors[0]} />
            </g>
            <g className="circle-ad-cta">
              <rect x="232" y="94" width="100" height="32" rx="16" fill="#111827" />
              <text x="250" y="115" fill="white" className="circle-ad-cta-text">
                {slide.cta}
              </text>
              <path d="M313 106l6 5-6 5" fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
}
