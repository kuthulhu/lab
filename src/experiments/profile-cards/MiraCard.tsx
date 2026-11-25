import { useState, type PointerEvent, type SyntheticEvent } from "react";
import type { MiraProfile } from "./people";
import styles from "./mira.module.css";

function markImgLoaded(el: HTMLImageElement | null) {
  if (el && el.complete && el.naturalWidth > 0) el.setAttribute("data-loaded", "");
}

function onImgReady(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.setAttribute("data-loaded", "");
}

export function MiraCard({ person }: { person: MiraProfile }) {
  const [following, setFollowing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const followerCount = person.followers + (following ? 1 : 0);

  function onPointerEnter(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse") setExpanded(true);
  }

  function onPointerLeave(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse") setExpanded(false);
  }

  function onCardClick(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    setExpanded((prev) => !prev);
  }

  return (
    <div className={styles.stage}>
      <article
        className={styles.card}
        data-expanded={expanded || undefined}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={onCardClick}
        aria-label={`${person.name}, ${person.role}`}
      >
        <div className={styles.mediaWrap}>
          <div className={styles.mediaFrame}>
            <div className={styles.landscapePos}>
              <img
                ref={markImgLoaded}
                src={person.landscapeSrc}
                alt=""
                className={styles.coverImg}
                onLoad={onImgReady}
                onError={onImgReady}
              />
            </div>
            <div className={styles.portraitPos}>
              <img
                ref={markImgLoaded}
                src={person.portraitSrc}
                alt={person.name}
                className={styles.coverImg}
                onLoad={onImgReady}
                onError={onImgReady}
              />
            </div>

            <div className={styles.collapsedScrim} aria-hidden="true" />

            <div className={styles.collapsedTitle} aria-hidden={expanded}>
              <span className={styles.collapsedName}>{person.name}</span>
              <img
                src="/profile-cards/mira-verified.svg"
                alt=""
                width={20}
                height={20}
                className={styles.verifiedIcon}
              />
            </div>
          </div>
        </div>

        <div className={styles.contentCollapse}>
          <div className={styles.contentInner}>
            <div className={styles.content}>
              <div className={styles.identity}>
                <div className={styles.nameRow}>
                  <h4 className={styles.name}>{person.name}</h4>
                  <img
                    src="/profile-cards/mira-verified.svg"
                    alt="Verified"
                    width={20}
                    height={20}
                    className={styles.verifiedIcon}
                  />
                </div>
                <p className={styles.role}>{person.role}</p>
              </div>

              <div className={styles.footerRow}>
                <div className={styles.stats}>
                  <div className={styles.statItem} aria-label={`${followerCount} followers`}>
                    <i className={`ph ph-users ${styles.statIcon}`} style={{ fontSize: 16 }} aria-hidden="true" />
                    <span className={styles.statValue}>{followerCount}</span>
                  </div>

                  <div className={styles.statItem} aria-label={`${person.shots} shots`}>
                    <i className={`ph ph-images ${styles.statIcon}`} style={{ fontSize: 16 }} aria-hidden="true" />
                    <span className={styles.statValue}>{person.shots}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.chip}
                  aria-pressed={following}
                  onClick={() => setFollowing((f) => !f)}
                >
                  <i
                    className={`ph ${following ? "ph-check" : "ph-plus"} ${styles.chipIcon}`}
                    style={{ fontSize: 16 }}
                    aria-hidden="true"
                  />
                  <span className={styles.chipLabel}>{following ? "Following" : "Follow"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.noiseMask} aria-hidden="true" />
        <div className={styles.glowOneWrap} aria-hidden="true">
          <div className={styles.glowOneInner}>
            <img src="/profile-cards/mira-glow-1.svg" alt="" className={styles.fillImg} />
          </div>
        </div>
        <div className={styles.glowTwoWrap} aria-hidden="true">
          <div className={styles.glowTwoInner}>
            <img src="/profile-cards/mira-glow-2.svg" alt="" className={styles.fillImg} />
          </div>
        </div>
      </article>
    </div>
  );
}
