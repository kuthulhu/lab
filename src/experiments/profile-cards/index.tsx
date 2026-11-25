import { AikoCard } from "./AikoCard";
import { JonasCard } from "./JonasCard";
import { MiraCard } from "./MiraCard";
import { AIKO, JONAS, MIRA } from "./people";
import styles from "./index.module.css";

export default function ProfileCards() {
  return (
    <div className={styles.root}>
      <div className={styles.slot}>
        <MiraCard person={MIRA} />
      </div>
      <div className={styles.slot}>
        <JonasCard person={JONAS} />
      </div>
      <div className={styles.slot}>
        <AikoCard person={AIKO} />
      </div>
    </div>
  );
}
