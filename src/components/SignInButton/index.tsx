import styles from './styles.module.scss';

import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

import Image from 'next/image';

// para fazer login, e deslogar
import { signIn, signOut, useSession } from 'next-auth/client';

export function SignInButton(){

    const [session] = useSession(); //useSession do next da linha 7

    return session ? (
        <button
        type='button'
        className={styles.signInButton}
        onClick={ () => signOut() }
        >   
            <img src={session.user.image} alt="Foto do usuário"/>
            
            Olá {session.user.name} 
            
            <FiX color='#737380' className={styles.closeIcon} />
        </button>
    ) : (
        <button
        type='button'
        className={styles.signInButton}

        //aqui informo qual o provider que quero (github)
        onClick={ () => signIn('github') }
        >   
            <FaGithub color='#FFB800'/>
            Entrar com GitHub
        </button>
    )
    
}