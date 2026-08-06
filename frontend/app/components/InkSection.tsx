export default function InkSection() {
  return (
    <div>
      <section className="relative py-stack-lg px-container-padding-mobile lg:px-0 mt-stack-lg">
        {/* <!-- Decorative Botanical Corner (Bottom Left) --> */}
        <img
          alt="Vintage botanical accents"
          className="absolute -bottom-24 -left-24 w-80 h-80 object-contain opacity-60 pointer-events-none mix-blend-multiply -rotate-45"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEGvtfaglx5WzB0Um734fA2QfoIfM8vxfk66oAG4tpBW4xf7Mo9NyCs-fiqOZW5Le5Y8cp0RJIxri8hCJfah8wmRu9h0GoV__npcJlkfK10EFKnSH9STRuP-NAyCdQnqqWICacPopq2tLr569BbcwRQHHPBHZAYE9eWDj6TKECXu3dRFiHQxEibTfokVu6eANQ48NuvP-BV_sonuur4WGnNiHbTvH9nHy0AKFP74iXE5g3ndyRnMBSYw"
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          <div className="lg:col-span-7">
            <div className="bg-surface-container-low p-stack-md lg:p-stack-lg border border-outline-variant relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-4xl">
                  history_edu
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-stack-sm text-center">
                The Art of Slow Writing
              </h2>
              <div className="w-16 h-px bg-outline-variant mx-auto mb-stack-md"></div>
              <div className="space-y-stack-sm font-body-md text-body-md text-on-surface-variant leading-relaxed">
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
              <div className="mt-stack-md pt-stack-sm border-t border-outline-variant/30 flex justify-center">
                <span className="font-caption text-caption text-secondary italic opacity-70">
                  — From the Desk of the Curator
                </span>
              </div>
            </div>
          </div>
          {/* <!-- Sidebar Decorative Element --> */}
          <div className="hidden lg:flex lg:col-span-4 lg:col-start-9 flex-col gap-stack-md">
            <div className="aspect-[3/4] bg-surface-container border border-outline-variant overflow-hidden p-6 relative">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <img
                className="w-full h-full object-cover grayscale brightness-90 contrast-125"
                data-alt="A macro close-up of a vintage fountain pen nib touching textured cream-colored paper, warm sunlight casting long shadows across the page."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC1Lj6jD9KV4KVtn3kWRmbpOdQ6AxVj3u8elwZju_yP_R89WRTcCMDj-GunKqCNbS2M6kSSquUMy16qRxcQraJPN3cYPYzL0hKNEXsKKYPAjTGcwKQIjJ3FOv4Tp4jIf1iqkNZhwuUItPQVhGtQDUulVKPzP1Q2KY6LDTYs2mRANdwgQnoOheUAsg6LFeZPl13iVcKldWtcQ3frM_6ny8y_QmiWvFLPsPd-cqfoE3oRbbQ4kR1I46e_A"
              />
              <div className="absolute bottom-10 left-0 bg-primary text-on-primary px-4 py-2 font-label-md text-label-md tracking-[0.2em] uppercase">
                The Archive
              </div>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-center">
              Crafted for permanence
            </p>
          </div>
        </div>
      </section>
      {/* <!-- Interactive Flourish Section --> */}
      <section className="py-stack-lg bg-surface-container-lowest/50 border-y border-outline-variant/20 mb-stack-lg">
        <div className="max-w-2xl mx-auto text-center px-container-padding-mobile">
          <div className="inline-flex items-center gap-4 mb-stack-sm">
            <div className="h-px w-8 bg-outline"></div>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-[0.3em]">
              Our Philosophy
            </span>
            <div className="h-px w-8 bg-outline"></div>
          </div>
          <h3 className="font-headline-md text-headline-md text-primary mb-stack-md italic">
            "Writing is the painting of the voice."
          </h3>
          <div className="grid grid-cols-3 gap-stack-md mt-stack-md">
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-primary-fixed-dim text-3xl mb-2">
                ink_pen
              </span>
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-secondary-fixed-variant">
                Tactile Feel
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-primary-fixed-dim text-3xl mb-2">
                visibility_off
              </span>
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-secondary-fixed-variant">
                Focused Privacy
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-primary-fixed-dim text-3xl mb-2">
                auto_stories
              </span>
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-secondary-fixed-variant">
                Digital Legacy
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
