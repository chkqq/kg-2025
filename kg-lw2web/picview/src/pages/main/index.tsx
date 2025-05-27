import styles from './style.module.scss'
import TieFighterCanvas from '../../widjets/TieFighter'
import PictureViewer from '../../widjets/pictureViewer'
import Cuboctahedron from '../../widjets/cuboctahedron'
import Graph from '../../widjets/graph'
import MemoryTrainer3D from '../../widjets/memoryGame/memoryGame'
import BowlingPinVisualizer from '../../widjets/BowlingPin'
import ChessScene from '../../widjets/chess'
import SeaBattle3D from '../../widjets/ShipBattle3D'
import Torus from '../../widjets/parabolla'
import Fractal from '../../widjets/fractal'
import Canabola from '../../widjets/canabola'
import TorusPyramid from '../../widjets/torusPyramid'
const MainPage: React.FC = () => {

    return(
        <div className={styles.main_box}>
            <TorusPyramid />
        </div>
    )
}

export default MainPage