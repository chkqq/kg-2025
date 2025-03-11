import styles from './style.module.scss'
import TieFighterCanvas from '../../widjets/TieFighter'
import PictureViewer from '../../widjets/pictureViewer'
const MainPage: React.FC = () => {

    return(
        <div className={styles.main_box}>
            <TieFighterCanvas />
        </div>
    )
}

export default MainPage