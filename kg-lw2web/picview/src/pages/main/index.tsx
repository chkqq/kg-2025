import styles from './style.module.scss'
import TieFighterCanvas from '../../widjets/TieFighter'
import PictureViewer from '../../widjets/pictureViewer'
import Cuboctahedron from '../../widjets/cuboctahedron'
import Graph from '../../widjets/graph'
const MainPage: React.FC = () => {

    return(
        <div className={styles.main_box}>
            <Graph />
        </div>
    )
}

export default MainPage