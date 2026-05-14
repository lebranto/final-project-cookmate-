import styles from "./loading.module.css"

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <p className={styles.text}>데이터를 불러오는 중...</p>
      </div>
    </div>
  );
}