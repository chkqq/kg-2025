import styles from './style.module.scss'
import TieFighterCanvas from '../../widjets/TieFighter'
import PictureViewer from '../../widjets/pictureViewer'
import Cuboctahedron from '../../widjets/cuboctahedron'
import RocketVisualization from '../../widjets/rocket'
import Graph from '../../widjets/graph'
import Scene from '../../widjets/house/textures/Cottage'
import MemoryTrainer3D from '../../widjets/memoryGame/memoryGame'
const MainPage: React.FC = () => {

    return(
        <div className={styles.main_box}>
            <MemoryTrainer3D />
        </div>
    )
}

export default MainPage