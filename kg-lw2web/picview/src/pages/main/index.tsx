import styles from './style.module.scss'
import PictureViewer from '../../widjets/pictureViewer'

const MainPage: React.FC = () => {

    return(
        <div className={styles.main_box}>
            <PictureViewer />
        </div>
    )
}

export default MainPage