"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./NarrativeSection.module.css";
import Image from "next/image";
import historyIcon from "@/public/parchment.png";
import inkPenIcon from "@/public/fountain-pen.png";
import privacyIcon from "@/public/private.png";
import legacyIcon from "@/public/open-book.png";
// Fades a section in the first time it scrolls into view (mirrors the
// original IntersectionObserver behavior from the mockup).
function FadeIn({
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as any}
      className={`${styles.fadeSection} ${inView ? styles.inView : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default function NarrativeSection() {
  return (
    <div className={styles.wrapper}>
      {/* Introductory Narrative Section */}
      <FadeIn as="section" className={styles.narrativeSection}>
        <img
          alt="Vintage botanical accents"
          className={styles.narrativeDecor}
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEGvtfaglx5WzB0Um734fA2QfoIfM8vxfk66oAG4tpBW4xf7Mo9NyCs-fiqOZW5Le5Y8cp0RJIxri8hCJfah8wmRu9h0GoV__npcJlkfK10EFKnSH9STRuP-NAyCdQnqqWICacPopq2tLr569BbcwRQHHPBHZAYE9eWDj6TKECXu3dRFiHQxEibTfokVu6eANQ48NuvP-BV_sonuur4WGnNiHbTvH9nHy0AKFP74iXE5g3ndyRnMBSYw"
        />

        <div className={styles.narrativeGrid}>
          <div className={styles.narrativeCol}>
            <div className={styles.narrativeCard}>
              <div className={styles.narrativeBadge}>
                <Image
                  src={historyIcon}
                  alt="Icon for the primary call-to-action"
                  style={{ width: 18, height: 18 }}
                />
              </div>

              <h2 className={styles.narrativeTitle}>The Art of Slow Writing</h2>
              <div className={styles.narrativeRule} />

              <div className={styles.narrativeBody}>
                <p>
                  In an age of instant ephemeral messaging, we have lost the
                  tactile intimacy of the written word. Memoire was conceived as
                  a rejection of the frantic; a digital vellum where thoughts
                  are given the space to breathe and mature.
                </p>
                <p>
                  We believe that the medium shapes the message. By providing a
                  workspace that mimics the focused serenity of a private study,
                  we invite you to rediscover the nuance of your own voice. It
                  is not just about recording information—it is about the
                  ceremony of reflection.
                </p>
              </div>

              <div className={styles.narrativeSignoff}>
                <span className={styles.narrativeSignoffText}>
                  — From the Desk of the Curator
                </span>
              </div>
            </div>
          </div>

          <div className={styles.narrativeSidebar}>
            <div className={styles.sidebarImageFrame}>
              <div className={styles.sidebarImageDots} />
              <img
                className={styles.sidebarImage}
                alt="A macro close-up of a vintage fountain pen nib touching textured cream-colored paper, warm sunlight casting long shadows across the page."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC1Lj6jD9KV4KVtn3kWRmbpOdQ6AxVj3u8elwZju_yP_R89WRTcCMDj-GunKqCNbS2M6kSSquUMy16qRxcQraJPN3cYPYzL0hKNEXsKKYPAjTGcwKQIjJ3FOv4Tp4jIf1iqkNZhwuUItPQVhGtQDUulVKPzP1Q2KY6LDTYs2mRANdwgQnoOheUAsg6LFeZPl13iVcKldWtcQ3frM_6ny8y_QmiWvFLPsPd-cqfoE3oRbbQ4kR1I46e_A"
              />
              <div className={styles.sidebarImageCaption}>The Archive</div>
            </div>
            <p className={styles.sidebarCaption}>Crafted for permanence</p>
          </div>
        </div>
      </FadeIn>

      {/* Interactive Flourish / Philosophy Section */}
      <FadeIn as="section" className={styles.philosophySection}>
        <div className={styles.philosophyInner}>
          <div className={styles.philosophyEyebrowRow}>
            <div className={styles.philosophyLine} />
            <span className={styles.philosophyEyebrow}>Our Philosophy</span>
            <div className={styles.philosophyLine} />
          </div>

          <h3 className={styles.philosophyQuote}>
            &ldquo;Writing is the painting of the voice.&rdquo;
          </h3>

          <div className={styles.philosophyGrid}>
            <div className={styles.philosophyItem}>
              <Image
                  src={inkPenIcon}
                  alt="Icon for the primary call-to-action"
                  style={{ width: 18, height: 18 }}
                />
              <span className={styles.philosophyLabel}>Tactile Feel</span>
            </div>
            <div className={styles.philosophyItem}>
              <Image
                  src={privacyIcon}
                  alt="Icon for the primary call-to-action"
                  style={{ width: 18, height: 18 }}
                />
              <span className={styles.philosophyLabel}>Focused Privacy</span>
            </div>
            <div className={styles.philosophyItem}>
              <Image
                  src={legacyIcon}
                  alt="Icon for the primary call-to-action"
                  style={{ width: 18, height: 18 }}
                />
              <span className={styles.philosophyLabel}>Digital Legacy</span>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
