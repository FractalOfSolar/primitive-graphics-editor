import React from 'react';

import SidePanel from './layout/SidePanel';
import Workspace from './layout/Workspace';
import styles from './App.module.css';


export default function App() {
    return (
        <div className={styles.container}>
            <SidePanel />
            <Workspace />
        </div>
    );
}
