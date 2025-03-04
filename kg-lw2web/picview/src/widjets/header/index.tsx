import styles from './style.module.scss'
import Button from '../../ui/button'
const Header: React.FC = () => {
 return(
        <div className = {styles.header}>
        <div className = {styles.title}>=IMAGE VIEWER=</div>
        <div className= {styles.buttons}>
            <Button color='#333' type='text' text='File' />
            <Button color='#333' type='text' text='Help'  />
        </div>

    </div>
    )
}

export default Header