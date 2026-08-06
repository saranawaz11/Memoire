"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import heroImage from "@/public/hero-image.png";
import editNoteIcon from "@/public/edit_light.png";
import InkSection from "../components/InkSection";
import checkIcon from "@/public/checked.png";
import NarrativeSection from "@/app/home/components/NarativeSection";
import Link from "next/link";
import styles from "@/app/home/home.module.css";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import waxSealIcon from "@/public/wax-seal.png";
import encryptedIcon from "@/public/shield.png";
import inkPenIcon from "@/public/pen.png";
import scriptIcon from "@/public/script.png";
// Fades a section in when it scrolls into view, mirroring the original
function FadeSection({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setInView(true);
        });
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${styles.fadeSection} ${inView ? styles.inView : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function ScribeReveal() {
  const containerRef = useRef(null);
  const [percentage, setPercentage] = useState(50);

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;
    if (pct >= 0 && pct <= 100) setPercentage(pct);
  };

  return (
    <div
      ref={containerRef}
      className={styles.revealBox}
      onMouseMove={handleMouseMove}
    >
      <div className={styles.revealBase}>
        <img
          className={styles.revealBaseImg}
          alt="A clean digital version of a handwritten journal page, elegant serif typography, crisp green ink on white digital paper, perfectly aligned text."
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiokmPW19Xa4HnC-Bl0nbwtl20QTJ3MYSnDV5g1Na31BO7EGyuY5BOzswlq2I1Rt_zSZBDVcJypV14-RFD92UmZXkHY3ncZP72p2P1s_R2V-qMdPvaTi96keuLRawkgs03nsb8SXXLoT0UDePInoOVy7sNC_2aRUoJSXyopXjaugW3t73lgCgrjQuUqjzTZngE5uUnDKZc84GLyTaZVtF9KUfbOF4W67lLu2zLPF1Lut9RyGaozYhGPw"
        />
      </div>
      <div className={styles.revealHandle} style={{ left: `${percentage}%` }}>
        <div className={styles.revealHandleDot}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            unfold_more
          </span>
        </div>
      </div>
      <div className={styles.revealOverlay} style={{ width: `${percentage}%` }}>
        <img
          className={styles.revealOverlayImg}
          alt="A close-up of a rustic, antique handwritten letter on yellowed parchment with messy ink blots and organic textures, vintage fountain pen style."
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1FqHCFXZ9uyaIIjCmpJ0Wq1NRDf7S5RDhNKuqawlo8B7emx9jlj423VDyzW3GL8wFaFJvyE4APjxbB6rAJAhw_o1rUK6ZOicbMzYsEcjK_OVEiioeMqliX9fXQ8Z1_R4phxV90K2bbRYVmpXgcUoV3pTuQdn7fGk6YWpV6ZlmDWaJE5jGvtpkKlV_KV1ZYlPrPGAFYv3aK68x9r6vf3eduRQ0HoOmAwbNXTzG2XWOjkJoGT0S4uzRLg"
        />
      </div>
    </div>
  );
}

function WaxSeal() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleScroll = () => setRotation(window.scrollY / 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.waxSealWrap}>
      <Image 
        src={waxSealIcon} 
        alt="Wax Seal Icon" 
        className={styles.waxSeal} 
        width={40}
        height={40}
        style={{transform: `rotate(${rotation}deg)`}}/>
      {/* <img
        alt="Green Wax Seal with Golden M"
        className={styles.waxSeal}
        style={{ transform: `rotate(${rotation}deg)` }}
        src="https://lh3.googleusercontent.com/aida/AP1WRLv-Z2z6DKGtji5FOy4U2Z4W7EsqokmprDW-oG42FxsqtFkJjKxM_w6XWdyt-cpw8P-7GtLPjgqyne4nIch4cHJVdItixGO_YQV5GMJmIniDTptOs-cAbb_vzcwhLQ-EYEl9V5Gyj-1AOdBkplyXaUTLn6uKwFkf1uMZxWzb3bE0HEP3DH0jl8C3ewUIsCaMcKZndVMnen3ickVl5574i1XAZjqV4radWnHEyCxypBWOfAJ63YzLY3AWWQ3E"
      /> */}
    </div>
  );
}
import { useRouter } from "next/navigation";
export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  return (
    <div className={`${styles.page} flex-1 min-h-0 overlow-y-auto`}>
      <header className={styles.header}>
        <Link href="/" className={styles.headerBrand}>
          <img
            alt="Memoire Wax Seal Logo"
            className={styles.headerLogo}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8J_VGJpBQ_NY5DWqC44BFrtD687LsXdR40CW4cbESs79NdHEgmTqywn3eL6GJlaVmgxwFAOCll6YBDtTk0pjFht5cbOn7E-qZax77t64JpffTOeQuV1Yg330n0Bac9kNT5X5SIpk4RseIoR5Kri7OMHDh3EYNEPw7RAf31HTTzZy2rYlGHv9TW_3aZG_P9-NWmoG9kraysMj5jDN4PSFbVWQUW5O6ln4qzFkhsuF6D6Z8lrzzHc-tZA"
          />
          <span className={styles.headerBrandName}>Memoire</span>
        </Link>


        <div className={styles.headerActions}>

          {isLoaded && !isSignedIn && (
            <>

            
                <Button size="lg" className={styles.signInBtn} onClick={() => {router.push("/sign-up")}}>
                  Join the Guild
                </Button>
                <Button className={styles.joinBtn} onClick={() => {router.push("/sign-in")}}>
                  Get started
                </Button>
            </>
          )}

          {isLoaded && isSignedIn && (
            <>
              <Link href="/notes" className={styles.joinBtn}>
                Enter Your Study
              </Link>
              <UserButton afterSwitchSessionUrl="/" />
            </>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.flowRoot}>
          {/* Hero Section */}
          <section className={styles.hero}>
            <div className={`${styles.heroBg} ${styles.fadeSectionAlways}`}>
              <Image
                src={heroImage}
                alt="Cinematic background of a vintage writing desk"
                className={styles.heroBgImg}
              />
              <div className={styles.heroGradient} />
            </div>

            <div
              className={`${styles.heroContent} ${styles.fadeSectionAlways}`}
            >
              <span className={styles.eyebrow}>ESTABLISHED MMXXIV</span>
              <h1 className={styles.heroTitle}>
                The Art of{" "}
                <span className={styles.heroTitleItalic}>Slow Digital</span>{" "}
                Writing
              </h1>
              <p className={styles.heroSubtitle}>
                Reconnect with the tactile weight of your thoughts. Memoire
                preserves the intimacy of ink on parchment within a secure
                digital sanctuary.
              </p>
              <div className={styles.heroCtaWrap}>
                <button className={styles.primaryBtn} onClick={() => {router.push("/sign-up")}}>
                  BEGIN YOUR FIRST MEMOIR
                  <span className={styles.primaryBtnIcon}>
                    <Image
                      src={editNoteIcon}
                      alt="Icon for the primary call-to-action"
                      style={{ width: 18, height: 18 }}
                    />
                  </span>
                </button>
              </div>
            </div>

            <div className={`${styles.heroDecor} ${styles.fadeSectionAlways}`}>
              <img
                className={styles.heroDecorImg}
                alt="A detailed, hyper-realistic close-up of dried lavender sprigs and small white baby's breath flowers on a light parchment surface, soft natural light, macro photography, muted tones."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7OQ2b_6PiW1ApdpXPZxN1YGQ2AaDcUViJpnDSXyE_J07pSHaYGmAAyGzH6tjX5oiabtNmh0Pcr9uIHVuvI1Q1ymD0l1qS_P4vuiZNy9YQlRAN1qPnx91PFFZlvyDSjRmJSSnj0bPve7xq99qukA5JgkRMT5WMzuASmNmd2Jb7oBEtM2JC3cd4qUhyuRurDf-ifuoqtG3bFwvIUz1v5kJ9P75A1rNwGQKwLb1wlUxAr04my_Rq4XDwqw"
              />
            </div>
          </section>

          {/* Neural Ink Digitization */}
          {/* <section className={`${styles.section} ${styles.sectionBg}`}>
            <FadeSection className={styles.sectionInner}>
              <div className={styles.twoColGrid}>
                <div className={styles.textBlock}>
                  <div className={styles.rule} />
                  <h2 className={styles.headlineLg}>Neural Ink Digitization</h2>
                  <p className={styles.bodyLgMuted}>
                    Our proprietary Scribe engine captures the nuance of your natural
                    handwriting. Every pressure point and fluid stroke is preserved, turning
                    the physical act of writing into a searchable, eternal digital record.
                  </p>
                  <div className={styles.statsRow}>
                    <div className={styles.statCol}>
                      <span className={styles.statNumber}>99.8%</span>
                      <span className={styles.statLabel}>Accuracy</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.statCol}>
                      <span className={styles.statNumber}>Instant</span>
                      <span className={styles.statLabel}>Indexing</span>
                    </div>
                  </div>
                </div>

                <ScribeReveal />
              </div>
            </FadeSection>
          </section> */}

          {/* <InkSection/> */}
          <NarrativeSection />

          {/* Heritage Vault */}
          <section className={`${styles.section} ${styles.sectionBgPrimary}`}>
            <FadeSection className={styles.vaultInner}>
              <WaxSeal />
              <h2 className={styles.vaultTitle}>The Heritage Vault</h2>
              <p className={styles.vaultSubtitle}>
                Your legacy is sovereign. We employ zero-knowledge encryption to
                ensure that only you hold the keys to your history. Once a
                memoir is sealed, it is etched into your private heritage
                blockchain.
              </p>
              <div className={styles.vaultGrid}>
                <div className={styles.vaultCard}>
                  <Image
                      src={encryptedIcon}
                      alt="Icon for the primary call-to-action"
                      style={{ width: 18, height: 18 }}
                    />
                  <h3 className={styles.vaultCardTitle}>
                    Sovereign Encryption
                  </h3>
                  <p className={styles.vaultCardBody}>
                    Total privacy, where even we cannot peek into your sealed
                    letters.
                  </p>
                </div>
                <div className={styles.vaultCard}>
                  <Image
                      src={scriptIcon}
                      alt="Icon for the primary call-to-action"
                      style={{ width: 18, height: 18 }}
                    />
                  <h3 className={styles.vaultCardTitle}>Generational Export</h3>
                  <p className={styles.vaultCardBody}>
                    Format-agnostic archives designed to be readable for the
                    next 100 years.
                  </p>
                </div>
                <div className={styles.vaultCard}>
                  <Image
                      src={inkPenIcon}
                      alt="Icon for the primary call-to-action"
                      style={{ width: 18, height: 18 }}
                    />
                  <h3 className={styles.vaultCardTitle}>Proof of Ink</h3>
                  <p className={styles.vaultCardBody}>
                    Verify the authenticity of your digital manuscripts via
                    unique neural signatures.
                  </p>
                </div>
              </div>
            </FadeSection>
            <div className={styles.textureLayer} />
          </section>

          {/* Cartography of Thought */}
          <section className={`${styles.section} ${styles.sectionBgLow}`}>
            <FadeSection className={styles.sectionInner}>
              <div className={styles.cartographyFlex}>
                <div className={styles.cartographyText}>
                  <span className={styles.eyebrowMuted}>
                    Network Visualization
                  </span>
                  <h2 className={styles.headlineLgTight}>
                    The Cartography of Thought
                  </h2>
                  <p
                    className={styles.bodyLgMuted}
                    style={{ fontSize: 16, lineHeight: "24px" }}
                  >
                    Watch your ideas blossom into a constellation of memories.
                    Our cartography engine visualizes the threads connecting
                    your letters, themes, and life events across time.
                  </p>
                  <button className={styles.linkBtn}>EXPLORE THE ATLAS</button>
                </div>

                <div className={styles.mapPanel}>
                  <svg className={styles.mapSvg} viewBox="0 0 800 500">
                    <path
                      d="M100,250 Q200,50 400,250 T700,250"
                      fill="none"
                      stroke="var(--primary)"
                      strokeOpacity="0.2"
                      strokeWidth="1"
                    />
                    <circle cx="100" cy="250" r="4" fill="var(--primary)" />
                    <circle
                      cx="400"
                      cy="250"
                      r="6"
                      fill="var(--tertiary-fixed-dim)"
                    />
                    <circle cx="700" cy="250" r="4" fill="var(--primary)" />
                    <text
                      x="110"
                      y="240"
                      fontSize="10"
                      fill="var(--on-surface-variant)"
                    >
                      Arrival in Florence
                    </text>
                    <text
                      x="380"
                      y="230"
                      fontSize="10"
                      fill="var(--on-surface-variant)"
                    >
                      The Great Idea
                    </text>
                    <text
                      x="680"
                      y="240"
                      fontSize="10"
                      fill="var(--on-surface-variant)"
                    >
                      Return Home
                    </text>
                  </svg>
                  <div
                    className={styles.mapBgPhoto}
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuByc1jYiG0vSS1R9TQyPtSZzzkiiJnrlK1XZuaBxLPBpQx9n2tpUOkzYqWLSMm1UPuXeyOpJXwcGyriRVotSXcrkuDCjbf2q5Q8hSnQR0AaMRLBFbIxqYgVhUCK9ZI1m8P_ZzD-qhCSSN99JZRysq0AJ6X4LpKSYQjwlUCh1QiOSXJtaleFbMDlVPrPvEuBW7GwZ_XcAlfB1eMx_bqRiSLVVgbB403wHr_LpRW5GcNOTEumGIn4pr-lIA')",
                    }}
                  />
                  <div className={styles.mapQuoteWrap}>
                    <div className={styles.mapQuoteCard}>
                      <p className={styles.mapQuoteText}>
                        &quot;The world is but a canvas to our imagination. In
                        these pages, the map grows ever larger.&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeSection>
          </section>

          {/* Ritual of Correspondence */}
          <section className={`${styles.section} ${styles.sectionBg}`}>
            <FadeSection className={styles.ritualInner}>
              <h2 className={styles.headlineLg}>
                The Ritual of Correspondence
              </h2>
              <div className={styles.ritualGrid}>
                <div className={styles.ritualImgWrap}>
                  <img
                    className={styles.ritualImg}
                    alt="A vintage ivory envelope being carefully unsealed by a brass letter opener, a sprig of dried eucalyptus resting beside it, dark wood background."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWoE1F61EHecMwn9EJx6p6_ORCX280s_XIU5dvH9PCZ_lRJFTi5ra-2NxAWxSWw74wl3JW-j-vLb3NgNmGs6v4pDA6whp4IDhC7Cd3AVtKnIQK1z-ZiuE5HITMUtsNRIBaBNJ-MblmJ6QwIkg7Ih5T-zzbxWSdhi2BA33hA632TnshSO005KYkIfZNGoLBtAnZPlbiy8y6oft5_s907zICjTTa8wo4oVTj1Tn7YWqPFeS29WTzWcT7pg"
                  />
                  <div className={styles.ritualImgGradient} />
                  <div className={styles.ritualImgCaption}>
                    <p className={styles.ritualImgEyebrow}>
                      Immersive Ceremony
                    </p>
                    <h4 className={styles.ritualImgTitle}>Opening</h4>
                  </div>
                </div>

                <div className={styles.ritualTextCol}>
                  <h3 className={styles.ritualTextTitle}>
                    Beyond Simple Input
                  </h3>
                  <p
                    className={styles.bodyLgMuted}
                    style={{ fontSize: 16, lineHeight: "24px" }}
                  >
                    Memoire isn't just a database; it's a sensory journey. From
                    the sound of the stylus on the glass to the visual physics
                    of a wax seal cooling, every interaction is crafted to lower
                    your pulse and heighten your focus.
                  </p>
                  <ul className={styles.ritualList}>
                    <li className={styles.ritualListItem}>
                      <span
                        className={`material-symbols-outlined ${styles.checkIcon}`}
                      >
                        <Image src={checkIcon} alt="Check" width={24} height={24} />
                      </span>
                      Tactile Haptic Feedback
                    </li>
                    <li className={styles.ritualListItem}>
                      <span
                        className={`material-symbols-outlined ${styles.checkIcon}`}
                      >
                        <Image src={checkIcon} alt="Check" width={24} height={24} />
                      </span>
                      ASMR-Inspired Audio Landscapes
                    </li>
                    <li className={styles.ritualListItem}>
                      <span
                        className={`material-symbols-outlined ${styles.checkIcon}`}
                      >
                        <Image src={checkIcon} alt="Check" width={24} height={24} />
                      </span>
                      Custom Stationery Selection
                    </li>
                  </ul>
                </div>
              </div>

              <img
                className={styles.ritualDecor}
                alt="Faded, artistic illustration of eucalyptus leaves and dried flowers, botanical vintage style, watercolor texture, soft forest greens and sepia tones."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCADkuEXMAC0mpwnjM5wdLJGcuwVlVxPqHslnZfVi0eaQjhTnPPx3t2qvMuN81-OM1CY6pLxS3sL1UEnEi0pF-6R2PGzcJwwOE8iRXoh3aojc_99hq9jIrsBL0UIKwHWrh8S6DvkZHYSHxnbedqEr4UkWamzKSNL8bOm8vKNFMpJiMZlt2-04TrLCT0Ugkz_C3q1_wfEx6YoRK11kOfpVlpJSI6fkDGECYNyJGfsQV7_3ZLojr3xWACiQ"
              />
            </FadeSection>
          </section>

          {/* Final CTA */}
          <section
            className={`${styles.section} ${styles.sectionBgHigh}`}
            style={{ padding: "96px 0" }}
          >
            <FadeSection className={styles.ctaInner}>
              <h2 className={styles.ctaTitle}>
                Begin your lineage of thought.
              </h2>
              <p className={styles.ctaSubtitle}>
                Join 50,000+ authors, historians, and thinkers who have found a
                quieter place for their words.
              </p>
              <div className={styles.ctaBtnRow}>
                <button className={styles.primaryBtn} style={{ margin: 0 }}>
                  JOIN THE GUILD
                </button>
                <button className={styles.secondaryBtn}>
                  VIEW SAMPLE ARCHIVES
                </button>
              </div>
            </FadeSection>
          </section>

          <footer className={styles.footer}>
            <div className={styles.footerInner}>
              <div className={styles.footerBrand}>
                {/* <img
                  alt="Logo"
                  className={styles.footerLogo}
                  src="https://lh3.googleusercontent.com/aida/AP1WRLv-Z2z6DKGtji5FOy4U2Z4W7EsqokmprDW-oG42FxsqtFkJjKxM_w6XWdyt-cpw8P-7GtLPjgqyne4nIch4cHJVdItixGO_YQV5GMJmIniDTptOs-cAbb_vzcwhLQ-EYEl9V5Gyj-1AOdBkplyXaUTLn6uKwFkf1uMZxWzb3bE0HEP3DH0jl8C3ewUIsCaMcKZndVMnen3ickVl5574i1XAZjqV4radWnHEyCxypBWOfAJ63YzLY3AWWQ3E"
                /> */}
                <Image
                  src={waxSealIcon}
                  alt="Logo"
                  style={{ width: 20, height: 20 }}
                  className={styles.footerLogo}
                  />
                <span className={styles.footerCopy}>
                  © 2024 MEMOIRE DIGITAL SANCTUARY
                </span>
              </div>
              <div className={styles.footerLinks}>
                <a href="#">Terms</a>
                <a href="#">Privacy</a>
                <a href="#">Manifesto</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}