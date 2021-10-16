import Link from 'next/link'; // para navegar
import styles from './styles.module.scss';

import { SignInButton } from '../SignInButton';

import { useSession } from 'next-auth/client';

import Image from 'next/image';
import logo from '../../../public/images/logo.svg';

export function Header () {
    //assim pego as info que determinei pegar do github
    //a sessão do github
    const [ session ] = useSession();

    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <Link href='/'>
                    <a>
                        <Image src={logo} alt='Logo Meu Board'/>
                    </a>
                </Link>

                <nav>
                    <Link href='/'>
                        <a>Home</a>
                    </Link>
                    
                    { session ? ( // se o user estiver logado
                        <Link href='/board'>
                            <a className={styles.logado}> Meu Board</a>
                        </Link>
                    ) : (
                        <Link href='/board'>
                            <a className={styles.notLogin} >Meu Board </a>
                        </Link>
                    ) }
                    
                </nav>
                
                <SignInButton />
                
            </div>
        </header>
    )
}
