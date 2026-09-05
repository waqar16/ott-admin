import styles from './RoundLoader.module.css'

type RoundLoaderProps = {
  entireScreen?: boolean
  details?: string
  whiteColor?: boolean
  className?: string
}

const RoundLoader: React.FC<RoundLoaderProps> = ({
  entireScreen = false,
  details = '',
  whiteColor = false,
  className,
}) => {
  return (
    <div className={`${entireScreen ? styles.screenLoder : styles.loader} ${className}`}>
      <div className={whiteColor ? styles.whiteSpinner : styles.spinner}></div>
      {entireScreen && <p className={styles.text}>{`${details}`}</p>}
    </div>
  )
}

export default RoundLoader
